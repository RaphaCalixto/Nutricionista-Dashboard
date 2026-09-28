/**
 * Resend Email Service for Nutrição com Amor
 * Handles password recovery and clinical notification emails via Resend API.
 */

// Default sender and support reply email
export const SENDER_DOMAIN = 'pacientenutri.com.br';
export const SUPPORT_EMAIL = 'nutrihealthplan@gmail.com';
export const DEFAULT_FROM_EMAIL = 'Nutrição com Amor <suporte@pacientenutri.com.br>';

// Storage key for custom Resend API Key if set via UI/Settings
const RESEND_KEY_STORAGE = 'nutriplan_resend_api_key_v1';

export function getResendApiKey(): string {
  // Check Vite environment variable or localStorage setting
  const envKey = (import.meta as any).env?.VITE_RESEND_API_KEY;
  if (envKey && typeof envKey === 'string' && envKey.trim()) {
    return envKey.trim();
  }
  return localStorage.getItem(RESEND_KEY_STORAGE) || '';
}

export function setResendApiKey(key: string): void {
  localStorage.setItem(RESEND_KEY_STORAGE, key.trim());
}

/**
 * Generates the clean, modern HTML email template for password reset
 */
export function buildPasswordResetEmailHtml(userName: string, resetCode: string): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Recuperação de Senha - Nutrição com Amor</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f8fafc;
      color: #1e293b;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      table-layout: fixed;
      background-color: #f8fafc;
      padding: 40px 10px;
    }
    .container {
      max-width: 540px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
      border: 1px solid #e2e8f0;
    }
    .header {
      background: linear-gradient(135deg, #059669 0%, #0d9488 50%, #e11d48 100%);
      padding: 36px 30px;
      text-align: center;
      color: #ffffff;
    }
    .header-icon {
      font-size: 32px;
      margin-bottom: 8px;
    }
    .header-title {
      font-size: 24px;
      font-weight: 800;
      letter-spacing: -0.5px;
      margin: 0;
      color: #ffffff;
    }
    .header-subtitle {
      font-size: 13px;
      color: #d1fae5;
      margin-top: 4px;
      font-weight: 500;
    }
    .content {
      padding: 36px 32px;
    }
    .greeting {
      font-size: 18px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 12px;
    }
    .text {
      font-size: 14px;
      line-height: 1.6;
      color: #475569;
      margin-bottom: 24px;
    }
    .code-card {
      background: #f0fdf4;
      border: 2px dashed #86efac;
      border-radius: 16px;
      padding: 24px 20px;
      text-align: center;
      margin: 28px 0;
    }
    .code-label {
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #166534;
      margin-bottom: 8px;
    }
    .code-value {
      font-family: 'SF Mono', 'Roboto Mono', Menlo, monospace;
      font-size: 36px;
      font-weight: 800;
      letter-spacing: 8px;
      color: #047857;
      margin: 0;
    }
    .code-expiry {
      font-size: 12px;
      color: #15803d;
      margin-top: 8px;
      font-weight: 500;
    }
    .security-notice {
      background-color: #f8fafc;
      border-left: 4px solid #0d9488;
      border-radius: 8px;
      padding: 12px 16px;
      font-size: 12px;
      color: #64748b;
      line-height: 1.5;
      margin-bottom: 24px;
    }
    .footer {
      border-top: 1px solid #f1f5f9;
      background-color: #fafafa;
      padding: 24px 32px;
      text-align: center;
      font-size: 12px;
      color: #94a3b8;
    }
    .footer strong {
      color: #475569;
    }
    .footer a {
      color: #059669;
      text-decoration: none;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <!-- Header -->
      <div class="header">
        <div class="header-icon">💚</div>
        <h1 class="header-title">Nutrição com Amor</h1>
        <p class="header-subtitle">Plataforma Clínica de Nutrição</p>
      </div>

      <!-- Content -->
      <div class="content">
        <div class="greeting">Olá, ${userName}! 👋</div>
        <p class="text">
          Recebemos uma solicitação para redefinir a senha da sua conta de acesso ao <strong>Nutrição com Amor</strong>.
          Utilize o código de segurança abaixo no aplicativo para criar sua nova senha:
        </p>

        <!-- Verification Code Card -->
        <div class="code-card">
          <div class="code-label">Seu Código de Recuperação</div>
          <div class="code-value">${resetCode}</div>
          <div class="code-expiry">⏱️ Válido por 15 minutos</div>
        </div>

        <div class="security-notice">
          🔒 <strong>Dica de Segurança:</strong> Nunca compartilhe este código com ninguém. Se você não solicitou esta redefinição de senha, ignore este e-mail — sua conta continua 100% segura.
        </div>

        <p class="text" style="margin-bottom: 0; font-size: 13px;">
          Em caso de dúvidas, nossa equipe está à disposição para ajudar.
        </p>
      </div>

      <!-- Footer -->
      <div class="footer">
        <p style="margin: 0 0 6px 0;">
          <strong>Nutrição com Amor • Sistema Clínico Profissional</strong>
        </p>
        <p style="margin: 0;">
          Suporte: <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>
        </p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}

export interface SendEmailResult {
  success: boolean;
  simulated?: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Sends password reset email via Resend API
 */
export async function sendPasswordResetEmail(
  toEmail: string,
  userName: string,
  resetCode: string
): Promise<SendEmailResult> {
  const apiKey = getResendApiKey();

  // If no Resend API key is configured yet, gracefully simulate so UI works in dev
  if (!apiKey) {
    console.warn(
      `[Resend Simulation] No VITE_RESEND_API_KEY configured. Verification code for ${toEmail} is: ${resetCode}`
    );
    return {
      success: true,
      simulated: true,
      messageId: `simulated-${Date.now()}`,
    };
  }

  const html = buildPasswordResetEmailHtml(userName, resetCode);

  try {
    let response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: DEFAULT_FROM_EMAIL,
        to: [toEmail.trim().toLowerCase()],
        reply_to: SUPPORT_EMAIL,
        subject: '🔐 Código de Recuperação de Senha - Nutrição com Amor',
        html: html,
      }),
    });

    let data = await response.json();

    // If custom domain is not yet verified or active, fallback to onboarding@resend.dev
    if (!response.ok && (data.message?.includes('domain') || data.name === 'validation_error')) {
      const fallbackResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          from: 'Nutrição com Amor <onboarding@resend.dev>',
          to: [toEmail.trim().toLowerCase()],
          reply_to: SUPPORT_EMAIL,
          subject: '🔐 Código de Recuperação de Senha - Nutrição com Amor',
          html: html,
        }),
      });

      if (fallbackResponse.ok) {
        const fallbackData = await fallbackResponse.json();
        return {
          success: true,
          simulated: false,
          messageId: fallbackData.id,
        };
      }
    }

    if (!response.ok) {
      console.error('[Resend Error]', data);
      return {
        success: false,
        error: data.message || 'Erro ao enviar e-mail pelo Resend.',
      };
    }

    return {
      success: true,
      simulated: false,
      messageId: data.id,
    };
  } catch (err: any) {
    console.error('[Resend Network Error]', err);
    return {
      success: false,
      error: err.message || 'Erro de conexão ao contatar a API do Resend.',
    };
  }
}
