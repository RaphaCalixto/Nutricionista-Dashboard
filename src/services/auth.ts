import { supabase } from './supabase';
import { sendPasswordResetEmail } from './resend';
import type { User } from '../types';

const USERS_STORAGE_KEY = 'nutriplan_auth_users_v1';
const SESSION_STORAGE_KEY = 'nutriplan_auth_session_v1';
const PASSWORD_RESETS_STORAGE_KEY = 'nutriplan_password_resets_v1';

interface PasswordResetToken {
  email: string;
  code: string;
  expiresAt: number; // timestamp
}

export const DEMO_USER: User = {
  id: 'user-lais-leal-default',
  name: 'Dra. Laís Leal',
  email: 'lais.leal@nutriplan.com',
  password: '123456',
  createdAt: '2026-01-01T00:00:00.000Z',
};

// Initialize default users if empty
function initializeUsers(): User[] {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (raw) {
      const users: User[] = JSON.parse(raw);
      // Ensure demo user is present
      if (!users.some((u) => u.email.toLowerCase() === DEMO_USER.email.toLowerCase())) {
        users.push(DEMO_USER);
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
      }
      return users;
    }
  } catch (e) {}

  const initial = [DEMO_USER];
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(initial));
  return initial;
}

export function getAllUsers(): User[] {
  return initializeUsers();
}

export function getCurrentUser(): User | null {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {}
  return null;
}

export function setCurrentSession(user: User): void {
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
}

export function clearCurrentSession(): void {
  localStorage.removeItem(SESSION_STORAGE_KEY);
}

export async function loginUser(
  email: string,
  password: string
): Promise<{ success: boolean; user?: User; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanPassword = password.trim();

  if (!cleanEmail || !cleanPassword) {
    return { success: false, error: 'Por favor, preencha o e-mail e a senha.' };
  }

  // 1. Check local registered users / demo user
  const users = getAllUsers();
  const foundUser = users.find(
    (u) => u.email.toLowerCase() === cleanEmail && (u.password === cleanPassword || !u.password)
  );

  if (foundUser) {
    // Exclude raw password from session
    const safeUser: User = {
      id: foundUser.id,
      name: foundUser.name,
      email: foundUser.email,
      createdAt: foundUser.createdAt,
    };
    setCurrentSession(safeUser);

    // Also attempt background Supabase signIn if configured
    try {
      await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPassword,
      });
    } catch (e) {}

    return { success: true, user: safeUser };
  }

  // 2. Try Supabase Auth directly if online
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: cleanPassword,
    });

    if (!error && data.user) {
      const supaUser: User = {
        id: data.user.id,
        name: data.user.user_metadata?.name || cleanEmail.split('@')[0],
        email: data.user.email || cleanEmail,
        createdAt: data.user.created_at || new Date().toISOString(),
      };
      // Save locally to known users
      users.push({ ...supaUser, password: cleanPassword });
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
      setCurrentSession(supaUser);
      return { success: true, user: supaUser };
    }
  } catch (e) {}

  return { success: false, error: 'E-mail ou senha incorretos. Verifique os dados digitados.' };
}

export async function registerUser(
  name: string,
  email: string,
  password: string
): Promise<{ success: boolean; user?: User; error?: string }> {
  const cleanName = name.trim();
  const cleanEmail = email.trim().toLowerCase();
  const cleanPassword = password.trim();

  if (!cleanName) {
    return { success: false, error: 'Informe seu nome ou nome profissional (ex: Dra. Joana Silva).' };
  }
  if (!cleanEmail || !cleanEmail.includes('@')) {
    return { success: false, error: 'Informe um e-mail válido.' };
  }
  if (!cleanPassword || cleanPassword.length < 6) {
    return { success: false, error: 'A senha deve conter no mínimo 6 caracteres.' };
  }

  const users = getAllUsers();
  if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
    return { success: false, error: 'Este e-mail já está cadastrado no sistema. Faça login.' };
  }

  // Try creating in Supabase Auth first
  let generatedId = `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  try {
    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password: cleanPassword,
      options: {
        data: { name: cleanName },
      },
    });
    if (!error && data.user) {
      generatedId = data.user.id;
    }
  } catch (e) {}

  const newUser: User = {
    id: generatedId,
    name: cleanName,
    email: cleanEmail,
    password: cleanPassword,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

  // Set active session (safe without password)
  const safeUser: User = {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    createdAt: newUser.createdAt,
  };
  setCurrentSession(safeUser);

  return { success: true, user: safeUser };
}

export function logoutUser(): void {
  clearCurrentSession();
  try {
    supabase.auth.signOut();
  } catch (e) {}
}

/**
 * Initiates the password recovery flow by generating a 6-digit code
 * and sending an email via Resend to the user.
 */
export async function requestPasswordReset(
  email: string
): Promise<{ success: boolean; userName?: string; code?: string; error?: string; simulated?: boolean }> {
  const cleanEmail = email.trim().toLowerCase();

  if (!cleanEmail || !cleanEmail.includes('@')) {
    return { success: false, error: 'Por favor, informe um endereço de e-mail válido.' };
  }

  const users = getAllUsers();
  const user = users.find((u) => u.email.toLowerCase() === cleanEmail);

  if (!user) {
    return {
      success: false,
      error: 'Não encontramos nenhuma conta cadastrada com este e-mail no sistema.',
    };
  }

  // Generate 6-digit verification code
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes validity

  // Save reset token in local storage
  const resets: PasswordResetToken[] = (() => {
    try {
      const raw = localStorage.getItem(PASSWORD_RESETS_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  })();

  // Filter out any previous expired or existing tokens for this email
  const updatedResets = resets.filter((r) => r.email.toLowerCase() !== cleanEmail && r.expiresAt > Date.now());
  updatedResets.push({
    email: cleanEmail,
    code: resetCode,
    expiresAt,
  });

  localStorage.setItem(PASSWORD_RESETS_STORAGE_KEY, JSON.stringify(updatedResets));

  // Send email via Resend
  const emailResult = await sendPasswordResetEmail(cleanEmail, user.name, resetCode);

  if (!emailResult.success) {
    return {
      success: false,
      error: emailResult.error || 'Não foi possível enviar o e-mail de recuperação. Tente novamente.',
    };
  }

  return {
    success: true,
    userName: user.name,
  };
}

/**
 * Validates the 6-digit verification code and updates the user's password.
 */
export async function verifyAndResetPassword(
  email: string,
  code: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanCode = code.trim();
  const cleanPassword = newPassword.trim();

  if (!cleanCode || cleanCode.length !== 6) {
    return { success: false, error: 'O código de recuperação deve conter 6 dígitos.' };
  }

  if (!cleanPassword || cleanPassword.length < 6) {
    return { success: false, error: 'A nova senha deve conter no mínimo 6 caracteres.' };
  }

  // Check reset token
  const resets: PasswordResetToken[] = (() => {
    try {
      const raw = localStorage.getItem(PASSWORD_RESETS_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  })();

  const token = resets.find(
    (r) => r.email.toLowerCase() === cleanEmail && r.code === cleanCode && r.expiresAt > Date.now()
  );

  if (!token) {
    return {
      success: false,
      error: 'Código de recuperação inválido ou expirado. Por favor, solicite um novo código.',
    };
  }

  // Update user's password
  const users = getAllUsers();
  const userIndex = users.findIndex((u) => u.email.toLowerCase() === cleanEmail);

  if (userIndex === -1) {
    return { success: false, error: 'Usuário não encontrado.' };
  }

  users[userIndex].password = cleanPassword;
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

  // If this is the demo account, also update demo password in memory
  if (cleanEmail === DEMO_USER.email.toLowerCase()) {
    DEMO_USER.password = cleanPassword;
  }

  // Clean up used token
  const remainingResets = resets.filter((r) => r.email.toLowerCase() !== cleanEmail);
  localStorage.setItem(PASSWORD_RESETS_STORAGE_KEY, JSON.stringify(remainingResets));

  // Also attempt Supabase password update if user is authenticated with Supabase
  try {
    await supabase.auth.updateUser({ password: cleanPassword });
  } catch (e) {}

  return { success: true };
}

