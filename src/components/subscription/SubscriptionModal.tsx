import React, { useState } from 'react';
import {
  X,
  Crown,
  Check,
  Clock,
  Users,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  QrCode,
  CreditCard,
  Lock,
  CheckCircle2,
  RefreshCw,
  Zap,
  AlertTriangle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  PLANS,
  activateProPlan,
  checkAsaasPayment,
  FREE_LIMITATIONS,
  PRO_FEATURES,
  type SubscriptionStatus
} from '../../services/subscription';
import type { User } from '../../types';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  subscriptionStatus: SubscriptionStatus;
  triggerReason?: 'limit_reached' | 'trial_expired' | 'manual';
  initialPlan?: 'monthly' | 'annual';
  onPlanActivated?: () => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  subscriptionStatus,
  triggerReason = 'manual',
  initialPlan = 'annual',
  onPlanActivated,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual'>(initialPlan);
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'credit_card'>('credit_card');
  const [hasOpenedCheckout, setHasOpenedCheckout] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen && initialPlan) {
      setSelectedPlan(initialPlan);
      setVerificationError(null);
    }
  }, [isOpen, initialPlan]);

  if (!isOpen) return null;

  const currentPlanDetails = PLANS[selectedPlan];
  const checkoutUrl = currentPlanDetails.checkoutUrl;

  const handleOpenCheckout = () => {
    // Abre a página de checkout oficial do Asaas em nova aba
    window.open(checkoutUrl, '_blank', 'noopener,noreferrer');
    setHasOpenedCheckout(true);
    setVerificationError(null);
  };

  const handleVerifyPayment = async () => {
    if (!currentUser) return;
    setIsVerifying(true);
    setVerificationError(null);

    try {
      const res = await checkAsaasPayment(currentUser.email);
      if (res.paid) {
        activateProPlan(currentUser, res.plan || selectedPlan, res.paymentId);
        try {
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 }
          });
        } catch (e) {}
        if (onPlanActivated) onPlanActivated();
        onClose();
      } else {
        setVerificationError(
          res.message ||
          `Nenhum pagamento confirmado foi localizado no Asaas para o e-mail ${currentUser.email}. Se você já pagou via Pix ou Cartão, aguarde alguns instantes e tente novamente.`
        );
      }
    } catch (e) {
      setVerificationError('Erro ao consultar o Asaas. Verifique sua conexão e tente novamente.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full max-h-[94vh] flex flex-col overflow-hidden border border-slate-200">
        
        {/* Header Premium com Gradiente */}
        <div className="relative bg-gradient-to-br from-emerald-600 via-teal-600 to-slate-900 p-6 text-white overflow-hidden shrink-0">
          <div className="absolute top-0 right-0 translate-x-8 -translate-y-8 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white bg-black/20 hover:bg-black/40 rounded-full transition-colors cursor-pointer"
            title="Fechar"
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
              ? 'Você atingiu o limite de 5 pacientes do teste gratuito. Assine para gerenciar pacientes ilimitados!'
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
                onClick={() => {
                  setSelectedPlan('annual');
                  setHasOpenedCheckout(false);
                }}
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
                <p className="text-[11px] text-slate-500 mt-0.5">R$ 238,80 à vista no Pix ou em até 12x</p>
                <p className="text-[10px] font-bold text-emerald-700 mt-1 bg-emerald-100/60 px-1.5 py-0.5 rounded w-fit">
                  Economize R$ 120 por ano
                </p>
              </div>

              {/* Plano Mensal */}
              <div
                onClick={() => {
                  setSelectedPlan('monthly');
                  setHasOpenedCheckout(false);
                }}
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
                  <span className="text-2xl font-black text-slate-900">
                    R$ {PLANS.monthly.price.toFixed(2).replace('.', ',')}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">/mês</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">Sem fidelidade • Cancele quando quiser</p>
              </div>
            </div>
          </div>

          {/* Comparativo de Planos: Limitações do Free vs Desbloqueio Pro */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Comparativo de Recursos
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Limitações do Free / Teste Grátis */}
              <div className="bg-rose-50/60 rounded-2xl p-4 border border-rose-200/80 space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800 uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                  <span>Limitações do Grátis:</span>
                </div>
                <div className="space-y-2 text-xs text-rose-900/85">
                  {FREE_LIMITATIONS.map((lim, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-rose-500 font-bold shrink-0">✕</span>
                      <span className="leading-tight">{lim}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Vantagens do Plano Pro (Iguais no Mensal e Anual) */}
              <div className="bg-emerald-50/70 rounded-2xl p-4 border border-emerald-300/80 space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 uppercase tracking-wider">
                  <Crown className="w-3.5 h-3.5 text-amber-500 fill-current shrink-0" />
                  <span>Desbloqueado no Pro:</span>
                </div>
                <div className="space-y-2 text-xs text-emerald-950">
                  {PRO_FEATURES.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 font-bold shrink-0 mt-0.5" />
                      <span className="leading-tight">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Formas de Pagamento (Asaas) */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Forma de Pagamento (Processado pelo Gateway Asaas)
            </label>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('credit_card')}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  paymentMethod === 'credit_card'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <span>Cartão de Crédito</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('pix')}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  paymentMethod === 'pix'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <QrCode className="w-4 h-4 text-emerald-600" />
                <span>Pix (Liberação Imediata)</span>
              </button>
            </div>

            {/* Painel do Cartão de Crédito */}
            {paymentMethod === 'credit_card' && (
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-slate-800">
                      Checkout Seguro com Proteção Antifraude
                    </h5>
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                      {selectedPlan === 'annual'
                        ? 'Você pode parcelar o plano anual em até 12x de R$ 19,90 no cartão de crédito.'
                        : `Pagamento mensal de R$ ${PLANS.monthly.price.toFixed(2).replace('.', ',')} sem taxa de adesão ou fidelidade.`}
                      {' '}Seus dados são criptografados diretamente na infraestrutura certificada PCI-DSS do Asaas.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-1 border-t border-slate-200">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Ambiente bancário seguro Asaas • Aceita Visa, Mastercard, Elo, Hipercard e Amex</span>
                </div>
              </div>
            )}

            {/* Painel do Pix */}
            {paymentMethod === 'pix' && (
              <div className="bg-slate-50 rounded-2xl p-4 border border-emerald-200 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-slate-800">
                      QR Code Dinâmico do Banco Central
                    </h5>
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                      Ao clicar em continuar, o checkout oficial do Asaas gerará o <strong>QR Code oficial e a chave Copia e Cola</strong> com liberação instantânea da sua assinatura logo após o pagamento no seu aplicativo de banco.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-emerald-800 bg-emerald-100/60 p-2 rounded-xl">
                  <Zap className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Liberação automática em segundos após o pagamento pelo Pix.</span>
                </div>
              </div>
            )}

            {/* Alerta quando o usuário já abriu o checkout */}
            {hasOpenedCheckout && (
              <div className="space-y-3 animate-in fade-in">
                <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-300 text-xs text-slate-700 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>A página de checkout do Asaas foi aberta em uma nova aba!</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    1. Conclua o pagamento por Pix ou Cartão de Crédito na tela oficial do Asaas.<br />
                    2. Assim que o pagamento for concluído no seu banco, clique em <strong>Verificar Pagamento no Asaas</strong> abaixo para validar e desbloquear seu Pro imediatamente.
                  </p>
                  <div className="pt-1 flex items-center gap-3">
                    <a
                      href={checkoutUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-700 hover:text-emerald-800 text-[11px] font-bold underline flex items-center gap-1"
                    >
                      <span>Não abriu a página? Clique aqui para abrir novamente</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                {verificationError && (
                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-1.5 animate-in fade-in">
                    <div className="flex items-center gap-2 font-bold text-rose-900">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>Pagamento ainda não localizado</span>
                    </div>
                    <p className="text-[11px] text-rose-700 leading-relaxed">
                      {verificationError}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer com Botão de Ação */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-center sm:text-left">
            <span className="text-xs text-slate-400">Total a pagar:</span>
            <div className="text-base font-extrabold text-slate-900">
              R$ {selectedPlan === 'annual' ? '238,80' : PLANS.monthly.price.toFixed(2).replace('.', ',')}
              <span className="text-xs font-normal text-slate-500 ml-1">
                ({selectedPlan === 'annual' ? 'plano anual' : 'plano mensal'})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {!hasOpenedCheckout ? (
              <button
                type="button"
                onClick={handleOpenCheckout}
                className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Ir para Checkout Seguro Asaas</span>
                <ExternalLink className="w-4 h-4" />
              </button>
            ) : (
              <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleOpenCheckout}
                  className="w-full sm:w-auto px-3.5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  title="Abrir página do Asaas novamente"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reabrir Asaas</span>
                </button>
                <button
                  type="button"
                  onClick={handleVerifyPayment}
                  disabled={isVerifying}
                  className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isVerifying ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Consultando Asaas...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Verificar Pagamento no Asaas</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
