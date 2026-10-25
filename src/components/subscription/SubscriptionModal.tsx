import React, { useState } from 'react';
import {
  X,
  Crown,
  Check,
  Sparkles,
  Zap,
  ShieldCheck,
  QrCode,
  CreditCard,
  Copy,
  Clock,
  Users,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PLANS, activateProPlan, type SubscriptionStatus } from '../../services/subscription';
import type { User } from '../../types';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  subscriptionStatus: SubscriptionStatus;
  triggerReason?: 'limit_reached' | 'trial_expired' | 'manual';
  onPlanActivated?: () => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  subscriptionStatus,
  triggerReason = 'manual',
  onPlanActivated,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual'>('annual');
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'credit_card'>('pix');
  const [isProcessing, setIsProcessing] = useState(false);
  const [pixGenerated, setPixGenerated] = useState(false);
  const [copiedPix, setCopiedPix] = useState(false);

  // Exemplo de chave/código Pix para cópia
  const dummyPixCode = "00020126580014br.gov.bcb.pix0136nutriplan-asaas-pro-2026-recebimentos520400005303986540529.905802BR5925NUTRICIONISTA PLANNER SAAS6009SAO PAULO62070503***6304E8A2";

  if (!isOpen) return null;

  const currentPlanDetails = PLANS[selectedPlan];

  const handleConfirmPayment = () => {
    if (!currentUser) return;
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      activateProPlan(currentUser, selectedPlan);
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 }
      });
      if (onPlanActivated) onPlanActivated();
      onClose();
    }, 1200);
  };

  const handleCopyPix = () => {
    navigator.clipboard.writeText(dummyPixCode);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        
        {/* Header Premium com Gradiente */}
        <div className="relative bg-gradient-to-br from-emerald-600 via-teal-600 to-slate-900 p-6 text-white overflow-hidden shrink-0">
          <div className="absolute top-0 right-0 translate-x-8 -translate-y-8 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white bg-black/20 hover:bg-black/40 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-400/30">
              <Crown className="w-6 h-6 fill-current" />
            </div>
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-xs">
                NutriPlan Pro
              </span>
              <h3 className="font-extrabold text-xl sm:text-2xl text-white">
                Desbloqueie o Plano Pro
              </h3>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-emerald-50 mt-1 max-w-md">
            {triggerReason === 'limit_reached'
              ? 'Você atingiu o limite de 5 pacientes do período de teste gratuito. Assine para gerenciar pacientes ilimitados!'
              : triggerReason === 'trial_expired'
              ? 'Seus 14 dias de teste gratuito terminaram. Escolha um plano para continuar utilizando o sistema sem interrupções.'
              : 'Atenda mais pacientes com eficiência, gere dietas completas e encante seus clientes com relatórios profissionais.'}
          </p>

          {/* Banner de status do trial se aplicável */}
          {subscriptionStatus.isTrial && (
            <div className="mt-3.5 inline-flex items-center gap-2 bg-white/15 px-3 py-1 rounded-xl text-xs backdrop-blur-xs font-semibold">
              <Clock className="w-3.5 h-3.5 text-amber-300" />
              <span>Restam {subscriptionStatus.daysRemaining} dias de teste</span>
              <span className="opacity-50">•</span>
              <Users className="w-3.5 h-3.5 text-emerald-300" />
              <span>{subscriptionStatus.currentPatientCount}/5 pacientes</span>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">

          {/* Seleção de Planos (Mensal vs Anual) */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Escolha seu plano
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Plano Anual (Destaque) */}
              <div
                onClick={() => setSelectedPlan('annual')}
                className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  selectedPlan === 'annual'
                    ? 'border-emerald-600 bg-emerald-50/50 shadow-md ring-2 ring-emerald-600/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <span className="absolute -top-2.5 right-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                  33% OFF • Mais Popular
                </span>

                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-sm">Plano Anual</span>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    selectedPlan === 'annual' ? 'border-emerald-600 bg-emerald-600' : 'border-slate-300'
                  }`}>
                    {selectedPlan === 'annual' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </div>

                <div className="mt-2">
                  <span className="text-2xl font-black text-slate-900">R$ 19,90</span>
                  <span className="text-xs text-slate-500 font-medium">/mês</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">R$ 238,80 à vista ou em até 12x</p>
                <p className="text-[10px] font-bold text-emerald-700 mt-1 bg-emerald-100/60 px-1.5 py-0.5 rounded w-fit">
                  Economize R$ 120 por ano
                </p>
              </div>

              {/* Plano Mensal */}
              <div
                onClick={() => setSelectedPlan('monthly')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  selectedPlan === 'monthly'
                    ? 'border-emerald-600 bg-emerald-50/50 shadow-md ring-2 ring-emerald-600/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-sm">Plano Mensal</span>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    selectedPlan === 'monthly' ? 'border-emerald-600 bg-emerald-600' : 'border-slate-300'
                  }`}>
                    {selectedPlan === 'monthly' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </div>

                <div className="mt-2">
                  <span className="text-2xl font-black text-slate-900">R$ 29,90</span>
                  <span className="text-xs text-slate-500 font-medium">/mês</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">Sem fidelidade • Cancele quando quiser</p>
              </div>
            </div>
          </div>

          {/* Vantagens Inclusas */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              O que você terá acesso:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
              {currentPlanDetails.features.map((feat, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Formas de Pagamento (Asaas) */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Forma de Pagamento (Asaas)
            </label>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setPaymentMethod('pix');
                  setPixGenerated(true);
                }}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  paymentMethod === 'pix'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <QrCode className="w-4 h-4 text-emerald-600" />
                <span>Pix (Liberação Imediata)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPaymentMethod('credit_card');
                  setPixGenerated(false);
                }}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  paymentMethod === 'credit_card'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <CreditCard className="w-4 h-4 text-slate-600" />
                <span>Cartão de Crédito</span>
              </button>
            </div>

            {/* Painel do Pix */}
            {paymentMethod === 'pix' && (
              <div className="bg-slate-50 rounded-2xl p-4 border border-emerald-200/80 space-y-3 text-center">
                <div className="flex flex-col items-center justify-center gap-1">
                  <div className="w-36 h-36 bg-white p-2 rounded-xl border border-slate-200 shadow-xs flex items-center justify-center">
                    <QrCode className="w-32 h-32 text-slate-800" />
                  </div>
                  <span className="text-[11px] text-slate-500 mt-1">Escaneie pelo aplicativo do seu banco</span>
                </div>

                <div className="space-y-1.5 text-left">
                  <span className="text-[11px] font-bold text-slate-700">Ou use o Pix Copia e Cola:</span>
                  <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200">
                    <input
                      type="text"
                      readOnly
                      value={dummyPixCode}
                      className="text-xs text-slate-500 bg-transparent flex-1 outline-none truncate"
                    />
                    <button
                      type="button"
                      onClick={handleCopyPix}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shrink-0"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copiedPix ? 'Copiado!' : 'Copiar'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Painel do Cartão de Crédito */}
            {paymentMethod === 'credit_card' && (
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
                <p className="text-xs text-slate-600">
                  Ao clicar em <strong>Confirmar Assinatura</strong>, sua cobrança será processada com segurança pelo gateway <strong>Asaas</strong>.
                </p>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Ambiente criptografado com proteção antifraude</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer com Botão de Ação */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-center sm:text-left">
            <span className="text-xs text-slate-400">Total a pagar:</span>
            <div className="text-base font-extrabold text-slate-900">
              R$ {selectedPlan === 'annual' ? '238,80' : '29,90'}
              <span className="text-xs font-normal text-slate-500 ml-1">
                ({selectedPlan === 'annual' ? 'plano anual' : 'plano mensal'})
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleConfirmPayment}
            disabled={isProcessing}
            className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Validando pagamento...</span>
              </>
            ) : (
              <>
                <span>Ativar NutriPlan Pro</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
