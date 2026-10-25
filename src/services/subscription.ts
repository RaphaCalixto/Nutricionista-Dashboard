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
  features: string[];
}

export const PLANS: Record<'monthly' | 'annual', PlanDetails> = {
  monthly: {
    id: 'monthly',
    name: 'Plano Pro Mensal',
    price: 29.90,
    period: '/mês',
    billingText: 'Cobrado mensalmente • Cancele quando quiser',
    features: [
      'Pacientes ilimitados',
      'Montador e exportador de dietas ilimitado',
      'Fotos de evolução antes & depois sem limite',
      'Histórico de consultas e prescrições',
      'Exportação de dietas em PDF profissional e WhatsApp',
      'Suporte prioritário via WhatsApp'
    ]
  },
  annual: {
    id: 'annual',
    name: 'Plano Pro Anual',
    price: 238.80,
    period: '/ano',
    billingText: 'Equivale a apenas R$ 19,90/mês • Em até 12x no cartão',
    badge: '33% de Desconto',
    savings: 'Economize R$ 120/ano',
    features: [
      'Tudo do Plano Mensal',
      'Pacientes e prontuários 100% ilimitados',
      '33% de desconto comparado ao mensal',
      'Parcelamento em até 12x no cartão de crédito',
      'Acesso garantido a todas as novas funções',
      'Selo Nutricionista Pro Verificado'
    ]
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

  // Cálculo do período de Trial (14 dias a partir de user.createdAt)
  const createdDate = user.createdAt ? new Date(user.createdAt) : new Date();
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
