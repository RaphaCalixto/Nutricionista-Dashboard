/**
 * Serviço de Gerenciamento de Assinaturas, Trial e Integração com Asaas
 */

import { DEMO_USER } from './auth';
import type { User } from '../types';

export const TRIAL_DAYS = 14;
export const TRIAL_PATIENT_LIMIT = 5;

export interface PlanDetails {
  id: 'monthly' | 'annual';
  name: string;
  price: number;
  period: string;
  billingText: string;
  badge?: string;
  savings?: string;
  checkoutUrl: string;
  features: string[];
}

export const PRO_FEATURES: string[] = [
  'Pacientes e prontuários 100% ilimitados',
  'Montador e exportador de dietas ilimitado',
  'Fotos de evolução antes & depois sem limite',
  'Histórico completo de consultas, anamneses e antropometria',
  'Prescrições e suplementação personalizada',
  'Exportação de dietas em PDF profissional e envio no WhatsApp',
  'Todas as atualizações e novos recursos inclusos',
  'Suporte prioritário via WhatsApp',
];

export const FREE_LIMITATIONS: string[] = [
  'Limite máximo de até 5 pacientes cadastrados',
  'Válido por 14 dias de teste',
  'Bloqueio para adicionar novos pacientes após 14 dias ou ao atingir 5 pacientes',
  'Fotos de evolução antes & depois limitadas',
  'Suporte padrão por e-mail',
];

export const PLANS: Record<'monthly' | 'annual', PlanDetails> = {
  monthly: {
    id: 'monthly',
    name: 'Plano Pro Mensal',
    price: 29.90,
    period: '/mês',
    billingText: 'Cobrado mensalmente • Cancele quando quiser',
    checkoutUrl: 'https://www.asaas.com/000/c/ufjxf9iqw8n414ay',
    features: PRO_FEATURES,
  },
  annual: {
    id: 'annual',
    name: 'Plano Pro Anual',
    price: 238.80,
    period: '/ano',
    billingText: 'Equivale a apenas R$ 19,90/mês • Em até 12x no cartão',
    badge: '33% de Desconto',
    savings: 'Economize R$ 120/ano',
    checkoutUrl: 'https://www.asaas.com/000/c/ke0734296euml8he',
    features: PRO_FEATURES,
  }
};

export interface SubscriptionRecord {
  userId: string;
  userEmail: string;
  status: 'active' | 'trial' | 'expired' | 'canceled';
  plan: 'free' | 'monthly' | 'annual';
  asaasPaymentId?: string;
  asaasSubscriptionId?: string;
  canceledAt?: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionStatus {
  isPro: boolean;
  isTrial: boolean;
  isExpired: boolean;
  isCanceled?: boolean;
  canceledAt?: string;
  plan: 'free' | 'monthly' | 'annual';
  daysRemaining: number;
  trialTotalDays: number;
  currentPatientCount: number;
  maxPatients: number;
  canAddPatient: boolean;
  status: 'trial' | 'active' | 'expired' | 'canceled';
  expiresAt?: string;
}

const STORAGE_KEY_PREFIX = 'nutriplan_sub_';

function getStorageKey(userId: string): string {
  return `${STORAGE_KEY_PREFIX}${userId}`;
}

export function getStoredSubscription(userId: string): SubscriptionRecord | null {
  try {
    const raw = localStorage.getItem(getStorageKey(userId));
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {}
  return null;
}

export function saveStoredSubscription(record: SubscriptionRecord): void {
  try {
    localStorage.setItem(getStorageKey(record.userId), JSON.stringify(record));
  } catch (e) {
    console.error('Erro ao salvar assinatura localmente', e);
  }
}

export function getTrialStartDate(user: User): Date {
  const key = `nutriplan_trial_start_${user.id}`;
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      const parsed = new Date(stored);
      if (!isNaN(parsed.getTime())) {
        return parsed;
      }
    }
  } catch (e) {}

  const d = user.createdAt ? new Date(user.createdAt) : new Date();
  const valid = !isNaN(d.getTime()) ? d : new Date();
  try {
    localStorage.setItem(key, valid.toISOString());
  } catch (e) {}
  return valid;
}

/**
 * Calcula o status em tempo real da assinatura ou período de teste do usuário
 */
export function getSubscriptionStatus(user: User | null, patientCount: number): SubscriptionStatus {
  // Administrador / Conta Raphael sempre é Pro Ilimitado
  const isMasterAdmin =
    !user ||
    user.id === DEMO_USER.id ||
    user.email.toLowerCase() === DEMO_USER.email.toLowerCase();

  if (isMasterAdmin) {
    return {
      isPro: true,
      isTrial: false,
      isExpired: false,
      isCanceled: false,
      plan: 'annual',
      daysRemaining: 999,
      trialTotalDays: TRIAL_DAYS,
      currentPatientCount: patientCount,
      maxPatients: Infinity,
      canAddPatient: true,
      status: 'active',
      expiresAt: '2099-12-31T23:59:59.000Z'
    };
  }

  // Verifica se o usuário tem assinatura paga salva
  const stored = getStoredSubscription(user.id);
  if (stored) {
    const expires = new Date(stored.expiresAt).getTime();
    const now = Date.now();
    const isWithinValidPeriod = expires > now;

    // Se o usuário cancelou a renovação mas o período vigente ainda não acabou:
    if (stored.status === 'canceled') {
      if (isWithinValidPeriod) {
        // Mantém 100% de acesso Pro até a data de expiração!
        return {
          isPro: true,
          isTrial: false,
          isExpired: false,
          isCanceled: true,
          canceledAt: stored.canceledAt,
          plan: stored.plan,
          daysRemaining: Math.ceil((expires - now) / (1000 * 60 * 60 * 24)),
          trialTotalDays: TRIAL_DAYS,
          currentPatientCount: patientCount,
          maxPatients: Infinity,
          canAddPatient: true,
          status: 'canceled',
          expiresAt: stored.expiresAt,
        };
      } else {
        // Já expirou após o cancelamento
        return {
          isPro: false,
          isTrial: false,
          isExpired: true,
          isCanceled: true,
          canceledAt: stored.canceledAt,
          plan: 'free',
          daysRemaining: 0,
          trialTotalDays: TRIAL_DAYS,
          currentPatientCount: patientCount,
          maxPatients: TRIAL_PATIENT_LIMIT,
          canAddPatient: false,
          status: 'expired',
          expiresAt: stored.expiresAt,
        };
      }
    }

    if (stored.status === 'active' && isWithinValidPeriod) {
      return {
        isPro: true,
        isTrial: false,
        isExpired: false,
        isCanceled: false,
        plan: stored.plan,
        daysRemaining: Math.ceil((expires - now) / (1000 * 60 * 60 * 24)),
        trialTotalDays: TRIAL_DAYS,
        currentPatientCount: patientCount,
        maxPatients: Infinity,
        canAddPatient: true,
        status: 'active',
        expiresAt: stored.expiresAt
      };
    }
  }

  // Cálculo do período de Trial (14 dias a partir da criação da conta)
  const createdDate = getTrialStartDate(user);
  const now = new Date();
  const diffMs = now.getTime() - createdDate.getTime();
  const daysPassed = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const daysRemaining = Math.max(0, TRIAL_DAYS - daysPassed);
  const isExpired = daysRemaining <= 0;

  const canAddPatient = !isExpired && patientCount < TRIAL_PATIENT_LIMIT;

  return {
    isPro: false,
    isTrial: !isExpired,
    isExpired,
    isCanceled: false,
    plan: 'free',
    daysRemaining,
    trialTotalDays: TRIAL_DAYS,
    currentPatientCount: patientCount,
    maxPatients: TRIAL_PATIENT_LIMIT,
    canAddPatient,
    status: isExpired ? 'expired' : 'trial'
  };
}

/**
 * Ativa manualmente ou após confirmação de pagamento o plano Pro
 */
export function activateProPlan(
  user: User,
  plan: 'monthly' | 'annual',
  paymentId?: string,
  subscriptionId?: string
): SubscriptionRecord {
  const now = new Date();
  const expirationDate = new Date(now);

  if (plan === 'monthly') {
    expirationDate.setMonth(expirationDate.getMonth() + 1);
  } else {
    expirationDate.setFullYear(expirationDate.getFullYear() + 1);
  }

  const record: SubscriptionRecord = {
    userId: user.id,
    userEmail: user.email,
    status: 'active',
    plan,
    asaasPaymentId: paymentId || `asaas_sim_${Date.now()}`,
    asaasSubscriptionId: subscriptionId,
    expiresAt: expirationDate.toISOString(),
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };

  saveStoredSubscription(record);
  return record;
}

export interface VerifyPaymentResult {
  paid: boolean;
  message?: string;
  plan?: 'monthly' | 'annual';
  paymentId?: string;
  value?: number;
}

export interface VerifyPaymentOptions {
  email?: string;
  payerEmail?: string;
  cpf?: string;
  paymentId?: string;
  name?: string;
}

/**
 * Consulta o servidor e a API do Asaas para validar se existe um pagamento real confirmado
 */
export async function checkAsaasPayment(
  userEmailOrOptions?: string | VerifyPaymentOptions,
  paymentId?: string
): Promise<VerifyPaymentResult> {
  try {
    const params = new URLSearchParams();

    if (typeof userEmailOrOptions === 'object' && userEmailOrOptions !== null) {
      if (userEmailOrOptions.email) params.set('email', userEmailOrOptions.email.trim());
      if (userEmailOrOptions.payerEmail) params.set('payer_email', userEmailOrOptions.payerEmail.trim());
      if (userEmailOrOptions.cpf) params.set('cpf', userEmailOrOptions.cpf.trim());
      if (userEmailOrOptions.paymentId) params.set('payment_id', userEmailOrOptions.paymentId.trim());
      if (userEmailOrOptions.name) params.set('name', userEmailOrOptions.name.trim());
    } else if (typeof userEmailOrOptions === 'string') {
      if (userEmailOrOptions) params.set('email', userEmailOrOptions.trim());
      if (paymentId) params.set('payment_id', paymentId.trim());
    }

    // Anti-cache param
    params.set('_t', Date.now().toString());

    const response = await fetch(`/api/verify-payment.php?${params.toString()}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      cache: 'no-store',
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    }
  } catch (err) {
    console.warn('Erro ao verificar status de pagamento:', err);
  }

  return {
    paid: false,
    message: 'Nenhum pagamento confirmado foi localizado no Asaas para este e-mail ainda.',
  };
}

/**
 * Cancela a renovação automática do plano Pro do usuário.
 * Mantém o acesso Pro 100% ativo até o término do período pago (expiresAt).
 */
export async function cancelProPlan(user: User): Promise<SubscriptionRecord> {
  const current = getStoredSubscription(user.id);
  const now = new Date();

  // Preserva a data de expiração vigente para que o usuário não perca o período que já pagou
  let expiresAt = current?.expiresAt;
  if (!expiresAt || new Date(expiresAt).getTime() <= now.getTime()) {
    const defaultExp = new Date(now);
    defaultExp.setMonth(defaultExp.getMonth() + 1);
    expiresAt = defaultExp.toISOString();
  }

  const record: SubscriptionRecord = {
    userId: user.id,
    userEmail: user.email,
    status: 'canceled',
    plan: current?.plan || 'monthly',
    asaasPaymentId: current?.asaasPaymentId,
    asaasSubscriptionId: current?.asaasSubscriptionId,
    canceledAt: now.toISOString(),
    expiresAt: expiresAt,
    createdAt: current?.createdAt || now.toISOString(),
    updatedAt: now.toISOString(),
  };

  saveStoredSubscription(record);

  // Solicita ao backend o cancelamento da cobrança recorrente no Asaas
  try {
    const savedPayer = (localStorage.getItem('nutriplan_payer_identifier') || '').trim();
    const isCpf = savedPayer.replace(/\D/g, '').length >= 11;
    const isEmail = savedPayer.includes('@');

    await fetch('/api/cancel-subscription.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: isEmail ? savedPayer : user.email,
        cpf: isCpf ? savedPayer.replace(/\D/g, '') : undefined,
        paymentId: current?.asaasPaymentId,
        subscriptionId: current?.asaasSubscriptionId,
      }),
    });
  } catch (err) {
    console.warn('Erro ao notificar cancelamento no Asaas:', err);
  }

  return record;
}

// ==================== COUPONS SYSTEM ====================

export interface CouponDefinition {
  code: string;
  durationDays: number;
  label: string;
  description: string;
}

export const AVAILABLE_COUPONS: Record<string, CouponDefinition> = {
  NUTRI1MES: {
    code: 'NUTRI1MES',
    durationDays: 30,
    label: '1 Mês de Acesso Pro',
    description: 'Libera acesso ilimitado Pro por 30 dias',
  },
  NUTRI3MESES: {
    code: 'NUTRI3MESES',
    durationDays: 90,
    label: '3 Meses de Acesso Pro',
    description: 'Libera acesso ilimitado Pro por 90 dias',
  },
  NUTRI1ANO: {
    code: 'NUTRI1ANO',
    durationDays: 365,
    label: '1 Ano de Acesso Pro',
    description: 'Libera acesso ilimitado Pro por 365 dias (1 ano)',
  },
};

export interface RedeemedCoupon {
  code: string;
  label: string;
  durationDays: number;
  redeemedAt: string;
  expiresAt: string;
}

function getCouponsStorageKey(userId: string): string {
  return `nutriplan_coupons_${userId}`;
}

export function getRedeemedCoupons(userId: string): RedeemedCoupon[] {
  try {
    const raw = localStorage.getItem(getCouponsStorageKey(userId));
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {}
  return [];
}

export function saveRedeemedCoupons(userId: string, coupons: RedeemedCoupon[]): void {
  try {
    localStorage.setItem(getCouponsStorageKey(userId), JSON.stringify(coupons));
  } catch (e) {
    console.error('Erro ao salvar cupons resgatados', e);
  }
}

export interface RedeemCouponResult {
  success: boolean;
  message: string;
  coupon?: RedeemedCoupon;
  newExpiresAt?: string;
}

/**
 * Valida e resgata um cupom promocional para o usuário
 */
export function redeemCoupon(user: User, rawCode: string): RedeemCouponResult {
  const code = (rawCode || '').trim().toUpperCase();

  if (!code) {
    return {
      success: false,
      message: 'Por favor, digite o código do cupom.',
    };
  }

  const couponDef = AVAILABLE_COUPONS[code];
  if (!couponDef) {
    return {
      success: false,
      message: 'Cupom inválido ou não encontrado. Verifique se digitou corretamente.',
    };
  }

  // Verifica se o usuário já resgatou este mesmo cupom anteriormente
  const alreadyRedeemed = getRedeemedCoupons(user.id);
  if (alreadyRedeemed.some((c) => c.code === code)) {
    return {
      success: false,
      message: 'Este cupom já foi utilizado nesta conta. Cada cupom só pode ser resgatado uma única vez.',
    };
  }

  // Calcula a data de expiração
  const now = new Date();
  let baseDate = now;

  // Se o usuário já tiver uma assinatura Pro ativa com validade futura, estende a partir da data de término
  const stored = getStoredSubscription(user.id);
  if (stored && stored.status === 'active') {
    const currentExpires = new Date(stored.expiresAt);
    if (currentExpires > now) {
      baseDate = currentExpires;
    }
  }

  const newExpiresAt = new Date(baseDate);
  newExpiresAt.setDate(newExpiresAt.getDate() + couponDef.durationDays);

  // Atualiza a assinatura do usuário para ativa com o novo período
  const updatedSubscription: SubscriptionRecord = {
    userId: user.id,
    userEmail: user.email,
    status: 'active',
    plan: couponDef.durationDays >= 365 ? 'annual' : 'monthly',
    asaasPaymentId: `coupon_${code}_${Date.now()}`,
    expiresAt: newExpiresAt.toISOString(),
    createdAt: stored?.createdAt || now.toISOString(),
    updatedAt: now.toISOString(),
  };

  saveStoredSubscription(updatedSubscription);

  // Registra no histórico de cupons utilizados para impedir reutilização
  const newRedeemedRecord: RedeemedCoupon = {
    code,
    label: couponDef.label,
    durationDays: couponDef.durationDays,
    redeemedAt: now.toISOString(),
    expiresAt: newExpiresAt.toISOString(),
  };

  saveRedeemedCoupons(user.id, [...alreadyRedeemed, newRedeemedRecord]);

  const formattedDate = newExpiresAt.toLocaleDateString('pt-BR');

  return {
    success: true,
    message: `Cupom ${code} ativado com sucesso! Você ganhou ${couponDef.label} (válido até ${formattedDate}).`,
    coupon: newRedeemedRecord,
    newExpiresAt: newExpiresAt.toISOString(),
  };
}
