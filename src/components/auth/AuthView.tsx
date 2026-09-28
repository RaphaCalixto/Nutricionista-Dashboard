import React, { useState } from 'react';
import { useClerk } from '@clerk/react';
import {
  Heart,
  Mail,
  Lock,
  User as UserIcon,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Apple,
  KeyRound,
  ArrowLeft,
  RotateCcw,
  Check,
  Download,
  Smartphone
} from 'lucide-react';
import {
  loginUser,
  registerUser,
  requestPasswordReset,
  verifyAndResetPassword
} from '../../services/auth';
import { SUPPORT_EMAIL } from '../../services/resend';
import { usePWAInstall } from '../../services/pwa';
import { InstallAppModal } from '../modals/InstallAppModal';
import type { User } from '../../types';

interface AuthViewProps {
  onAuthSuccess: (user: User) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onAuthSuccess }) => {
  const clerk = useClerk();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot_password'>('login');
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const { isInstallable, installPWA, isInstalled } = usePWAInstall();
  
  // Login form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register form states
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);

  // Forgot password form states
  const [forgotStep, setForgotStep] = useState<'request_code' | 'verify_and_reset'>('request_code');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotCode, setForgotCode] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [showForgotNewPassword, setShowForgotNewPassword] = useState(false);

  // Loading & Error states
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleGoogleAuth = async () => {
    setErrorMessage(null);
    setLoading(true);

    try {
      const c = clerk as any;
      const ssoCallbackUrl = `${window.location.origin}/sso-callback`;

      // 1. Try Direct OAuth Redirect via Clerk client (sign up)
      if (mode === 'register' && c?.client?.signUp?.authenticateWithRedirect) {
        await c.client.signUp.authenticateWithRedirect({
          strategy: 'oauth_google',
          redirectUrl: ssoCallbackUrl,
          redirectUrlComplete: '/',
        });
        return;
      }

      // 2. Try Direct OAuth Redirect via Clerk client (sign in)
      if (c?.client?.signIn?.authenticateWithRedirect) {
        await c.client.signIn.authenticateWithRedirect({
          strategy: 'oauth_google',
          redirectUrl: ssoCallbackUrl,
          redirectUrlComplete: '/',
        });
        return;
      }

      // 3. Try authenticateWithRedirect on clerk directly
      if (typeof c?.authenticateWithRedirect === 'function') {
        await c.authenticateWithRedirect({
          strategy: 'oauth_google',
          redirectUrl: ssoCallbackUrl,
          redirectUrlComplete: '/',
        });
        return;
      }

      // 4. Try openSignUp / openSignIn modals
      if (mode === 'register' && typeof c?.openSignUp === 'function') {
        c.openSignUp({
          fallbackRedirectUrl: '/',
          signInFallbackRedirectUrl: '/',
        });
        return;
      }

      if (typeof c?.openSignIn === 'function') {
        c.openSignIn({
          fallbackRedirectUrl: '/',
          signUpFallbackRedirectUrl: '/',
        });
        return;
      }

      // 5. Try redirectToSignIn / redirectToSignUp
      if (typeof c?.redirectToSignIn === 'function') {
        await c.redirectToSignIn({
          signInFallbackRedirectUrl: '/',
          signUpFallbackRedirectUrl: '/',
        });
        return;
      }
    } catch (err: any) {
      console.error('[Google Auth Error]', err);
      // If user already exists on sign up, try sign in redirect
      if (err?.errors?.[0]?.code === 'form_identifier_exists' || err?.message?.includes('already exists')) {
        try {
          const c = clerk as any;
          if (c?.client?.signIn?.authenticateWithRedirect) {
            await c.client.signIn.authenticateWithRedirect({
              strategy: 'oauth_google',
              redirectUrl: `${window.location.origin}/sso-callback`,
              redirectUrlComplete: '/',
            });
            return;
          }
        } catch (e2) {}
      }
      setErrorMessage(err?.errors?.[0]?.message || err.message || 'Erro ao conectar com a conta Google.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const result = await loginUser(loginEmail, loginPassword);
      if (result.success && result.user) {
        onAuthSuccess(result.user);
      } else {
        setErrorMessage(result.error || 'Falha ao autenticar.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro inesperado ao realizar login.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (registerPassword !== registerConfirmPassword) {
      setErrorMessage('As senhas digitadas não coincidem.');
      return;
    }

    setLoading(true);

    try {
      const result = await registerUser(registerName, registerEmail, registerPassword);
      if (result.success && result.user) {
        setSuccessMessage('Conta criada com sucesso! Redirecionando...');
        setTimeout(() => {
          onAuthSuccess(result.user!);
        }, 600);
      } else {
        setErrorMessage(result.error || 'Falha ao criar conta.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro inesperado ao criar conta.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      const result = await requestPasswordReset(forgotEmail);
      if (result.success) {
        setForgotCode('');
        setSuccessMessage(`Código enviado com sucesso para ${forgotEmail}! Verifique sua caixa de entrada no e-mail.`);
        setForgotStep('verify_and_reset');
      } else {
        setErrorMessage(result.error || 'Não foi possível enviar o código de recuperação.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro inesperado ao solicitar recuperação.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (forgotNewPassword !== forgotConfirmPassword) {
      setErrorMessage('As novas senhas digitadas não coincidem.');
      return;
    }

    if (forgotNewPassword.length < 6) {
      setErrorMessage('A nova senha deve conter no mínimo 6 caracteres.');
      return;
    }

    setLoading(true);

    try {
      const result = await verifyAndResetPassword(forgotEmail, forgotCode, forgotNewPassword);
      if (result.success) {
        setSuccessMessage('Senha redefinida com sucesso! Entrando no sistema...');
        // Automatically login with new credentials
        const loginRes = await loginUser(forgotEmail, forgotNewPassword);
        if (loginRes.success && loginRes.user) {
          setTimeout(() => {
            onAuthSuccess(loginRes.user!);
          }, 800);
        } else {
          setTimeout(() => {
            setMode('login');
            setLoginEmail(forgotEmail);
            setLoginPassword('');
            setForgotStep('request_code');
          }, 1200);
        }
      } else {
        setErrorMessage(result.error || 'Falha ao redefinir a senha.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro inesperado ao redefinir a senha.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenForgotPassword = () => {
    setMode('forgot_password');
    setForgotStep('request_code');
    setForgotEmail(loginEmail || '');
    setForgotCode('');
    setForgotNewPassword('');
    setForgotConfirmPassword('');
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 flex flex-col justify-center items-center p-4 sm:p-6 font-sans">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-rose-500 text-white shadow-xl shadow-emerald-950/50 mb-4 ring-4 ring-white/10">
            <Heart className="w-8 h-8 fill-white/90" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center justify-center gap-2">
            NutriPlan Pro
          </h1>
          <p className="text-sm text-emerald-300 font-medium mt-1">
            Sistema de Gestão Nutricional
          </p>
        </div>

        {/* Card Container */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 p-6 sm:p-8">
          {/* Tab Switcher (Only on login / register) */}
          {mode !== 'forgot_password' ? (
            <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl mb-6 text-sm font-semibold">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMessage(null);
                }}
                className={`py-2.5 rounded-xl transition-all duration-200 ${
                  mode === 'login'
                    ? 'bg-white text-emerald-800 shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Entrar
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setErrorMessage(null);
                }}
                className={`py-2.5 rounded-xl transition-all duration-200 ${
                  mode === 'register'
                    ? 'bg-white text-emerald-800 shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Criar Conta
              </button>
            </div>
          ) : (
            <div className="mb-6 pb-4 border-b border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar para o Login</span>
              </button>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
                <span>Recuperação</span>
              </span>
            </div>
          )}

          {/* Feedback Alerts */}
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}


          {/* LOGIN FORM */}
          {mode === 'login' && (
            <div className="space-y-4">
              {/* Google Login Button */}
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 hover:border-slate-400 text-slate-700 font-bold text-xs shadow-2xs flex items-center justify-center gap-3 transition-all active:scale-[0.99] cursor-pointer disabled:opacity-60"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Entrar com o Google</span>
              </button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-slate-400 text-[10px] font-bold">ou continue com e-mail</span>
                </div>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  E-mail
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    placeholder="seu.email@exemplo.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Senha
                  </label>
                  <button
                    type="button"
                    onClick={handleOpenForgotPassword}
                    className="text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
                  >
                    Esqueci minha senha
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    placeholder="Digite sua senha"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-sm shadow-md hover:from-emerald-700 hover:to-teal-700 focus:ring-4 focus:ring-emerald-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-70 cursor-pointer"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Entrar no Sistema</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
          )}

          {/* REGISTER FORM */}
          {mode === 'register' && (
            <div className="space-y-4">
              {/* Google Sign Up Button */}
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 hover:border-slate-400 text-slate-700 font-bold text-xs shadow-2xs flex items-center justify-center gap-3 transition-all active:scale-[0.99] cursor-pointer disabled:opacity-60"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Criar conta com o Google</span>
              </button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-slate-400 text-[10px] font-bold">ou cadastre com e-mail</span>
                </div>
              </div>

              <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nome Completo / Profissional
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    placeholder="Ex: Dra. Joana Silva"
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  E-mail Profissional
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    placeholder="seu.email@clinica.com"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showRegisterPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    placeholder="Mínimo de 6 caracteres"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    {showRegisterPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Confirmar Senha
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showRegisterPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    placeholder="Repita sua senha"
                    value={registerConfirmPassword}
                    onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center gap-2.5 text-[11px] text-slate-600">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Isolamento total: seus pacientes e dietas pertencem unicamente à sua conta.</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-sm shadow-md hover:from-emerald-700 hover:to-teal-700 focus:ring-4 focus:ring-emerald-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-70 cursor-pointer"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Criar Minha Conta e Entrar</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
          )}

          {/* FORGOT PASSWORD FORM (RESEND EMAIL INTEGRATION) */}
          {mode === 'forgot_password' && (
            <div className="space-y-4">
              <div className="text-center mb-2">
                <h3 className="font-extrabold text-slate-800 text-lg">
                  {forgotStep === 'request_code' ? 'Recuperar Senha' : 'Nova Senha'}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {forgotStep === 'request_code'
                    ? 'Informe seu e-mail para enviarmos um código de segurança via Resend.'
                    : `Digite o código de 6 dígitos enviado para ${forgotEmail} e defina sua nova senha.`}
                </p>
              </div>

              {forgotStep === 'request_code' ? (
                /* Step 1: Request Code */
                <form onSubmit={handleForgotPasswordRequest} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      E-mail Cadastrado
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="email"
                        required
                        placeholder="seu.email@exemplo.com"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200/80 text-[11px] text-slate-600 flex items-start gap-2">
                    <Mail className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      O e-mail será enviado com remetente de suporte <strong>{SUPPORT_EMAIL}</strong>.
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-sm shadow-md hover:from-emerald-700 hover:to-teal-700 focus:ring-4 focus:ring-emerald-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Enviar Código de Recuperação</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* Step 2: Verify Code & Reset Password */
                <form onSubmit={handleForgotPasswordReset} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Código de 6 Dígitos
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        required
                        maxLength={6}
                        placeholder="123456"
                        value={forgotCode}
                        onChange={(e) => setForgotCode(e.target.value.replace(/\D/g, ''))}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base font-mono tracking-widest text-center text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Nova Senha
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type={showForgotNewPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        placeholder="Mínimo de 6 caracteres"
                        value={forgotNewPassword}
                        onChange={(e) => setForgotNewPassword(e.target.value)}
                        className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowForgotNewPassword(!showForgotNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                      >
                        {showForgotNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Confirmar Nova Senha
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type={showForgotNewPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        placeholder="Repita a nova senha"
                        value={forgotConfirmPassword}
                        onChange={(e) => setForgotConfirmPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={handleForgotPasswordRequest}
                      disabled={loading}
                      className="text-xs font-bold text-slate-500 hover:text-emerald-700 flex items-center gap-1 transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reenviar código</span>
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-sm shadow-md hover:from-emerald-700 hover:to-teal-700 focus:ring-4 focus:ring-emerald-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Redefinir Senha e Acessar</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Download / PWA Section for new & returning users */}
        {!isInstalled && (
          <div className="mt-4 bg-white/95 backdrop-blur-md rounded-2xl border border-emerald-100 p-4 shadow-sm text-left">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-800 truncate">Baixar Aplicativo no Dispositivo (PWA)</h4>
                  <p className="text-[11px] text-slate-500 truncate">Acesso rápido e direto pelo celular ou computador</p>
                </div>
              </div>
              <button
                type="button"
                onClick={async () => {
                  if (isInstallable) {
                    const ok = await installPWA();
                    if (!ok) setIsInstallModalOpen(true);
                  } else {
                    setIsInstallModalOpen(true);
                  }
                }}
                className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer shrink-0 active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Baixar App</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mt-2.5 border-t border-slate-100 pt-2 leading-relaxed">
              💡 <strong>Dica:</strong> Se não quiser baixar agora, você sempre poderá instalar depois acessando a aba <strong>Configurações</strong> do sistema.
            </p>
          </div>
        )}

        <InstallAppModal
          isOpen={isInstallModalOpen}
          onClose={() => setIsInstallModalOpen(false)}
        />

        {/* Footer info */}
        <div className="text-center mt-6 text-xs text-slate-400 flex items-center justify-center gap-2">
          <Apple className="w-4 h-4 text-emerald-400" />
          <span>NutriPlan Pro • Suporte: {SUPPORT_EMAIL}</span>
        </div>
      </div>
    </div>
  );
};
