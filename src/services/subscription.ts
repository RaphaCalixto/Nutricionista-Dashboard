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
    price: 5.00,
    period: '/mês',
    billingText: 'Cobrado mensalmente • Valor promocional de teste',
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
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionStatus {
  isPro: boolean;
  isTrial: boolean;
  isExpired: boolean;
  plan: 'free' | 'monthly' | 'annual';
  daysRemaining: number;
  trialTotalDays: number;
  currentPatientCount: number;
  maxPatients: number;
  canAddPatient: boolean;
  status: 'trial' | 'active' | 'expired';
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
  if (stored && stored.status === 'active') {
    const expires = new Date(stored.expiresAt).getTime();
    const now = Date.now();
    if (expires > now) {
      return {
        isPro: true,
        isTrial: false,
        isExpired: false,
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
export function activateProPlan(user: User, plan: 'monthly' | 'annual', paymentId?: string): SubscriptionRecord {
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
    expiresAt: expirationDate.toISOString(),
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };

  saveStoredSubscription(record);
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
