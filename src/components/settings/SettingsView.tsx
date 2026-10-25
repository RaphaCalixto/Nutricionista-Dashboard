import React, { useState, useEffect } from 'react';
import {
  Settings,
  Save,
  CheckCircle2,
  Download,
  Building,
  User as UserIcon,
  ShieldCheck,
  Smartphone,
  Sparkles,
  RefreshCw,
  LogOut,
  Crown,
  Zap,
  AlertTriangle,
  ArrowRight,
  Ticket,
  Gift,
  Check,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { ClinicProfile, User } from '../../types';
import {
  type SubscriptionStatus,
  redeemCoupon,
  getRedeemedCoupons,
  type RedeemedCoupon,
} from '../../services/subscription';
import { usePWAInstall } from '../../services/pwa';
import { InstallAppModal } from '../modals/InstallAppModal';

interface SettingsViewProps {
  clinicProfile: ClinicProfile;
  onSaveClinicProfile: (profile: ClinicProfile) => void;
  currentUser?: User | null;
  onLogout?: () => void;
  supabaseConnected?: boolean;
  onOpenSqlModal?: () => void;
  onCheckConnection?: () => Promise<void>;
  subscriptionStatus?: SubscriptionStatus;
  onOpenSubscriptionModal?: () => void;
  onPlanActivated?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  clinicProfile,
  onSaveClinicProfile,
  currentUser,
  onLogout,
  subscriptionStatus,
  onOpenSubscriptionModal,
  onPlanActivated,
}) => {
  const [nutritionistName, setNutritionistName] = useState(
    clinicProfile.nutritionistName || currentUser?.name || 'Nutricionista'
  );
  const [crn, setCrn] = useState(clinicProfile.crn || '');
  const [clinicName, setClinicName] = useState(clinicProfile.clinicName || '');
  const [email, setEmail] = useState(clinicProfile.email || currentUser?.email || '');
  const [phone, setPhone] = useState(clinicProfile.phone || '');
  const [address, setAddress] = useState(clinicProfile.address || '');
  const [instagram, setInstagram] = useState(clinicProfile.instagram || '');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const { isInstallable, installPWA, isIOS, isInstalled } = usePWAInstall();

  // Estados do sistema de Cupom
  const [couponCode, setCouponCode] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [redeemedCoupons, setRedeemedCoupons] = useState<RedeemedCoupon[]>([]);

  useEffect(() => {
    if (currentUser?.id) {
      setRedeemedCoupons(getRedeemedCoupons(currentUser.id));
    }
  }, [currentUser?.id]);

  const handleRedeemCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setCouponFeedback({
        type: 'error',
        text: 'Você precisa estar logado para resgatar um cupom.'
      });
      return;
    }

    const res = redeemCoupon(currentUser, couponCode);
    if (res.success) {
      setCouponFeedback({ type: 'success', text: res.message });
      setCouponCode('');
      setRedeemedCoupons(getRedeemedCoupons(currentUser.id));
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (err) {}
      if (onPlanActivated) {
        onPlanActivated();
      }
    } else {
      setCouponFeedback({ type: 'error', text: res.message });
    }
  };

  useEffect(() => {
    setNutritionistName(clinicProfile.nutritionistName || currentUser?.name || 'Nutricionista');
    setCrn(clinicProfile.crn || '');
    setClinicName(clinicProfile.clinicName || '');
    setEmail(clinicProfile.email || currentUser?.email || '');
    setPhone(clinicProfile.phone || '');
    setAddress(clinicProfile.address || '');
    setInstagram(clinicProfile.instagram || '');
  }, [clinicProfile, currentUser]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveClinicProfile({
      nutritionistName: nutritionistName.trim(),
      crn: crn.trim(),
      clinicName: clinicName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      address: address.trim(),
      instagram: instagram.trim() || undefined,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleExportBackup = () => {
    const allData: Record<string, any> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('nutriplan_')) {
        try {
          allData[key] = JSON.parse(localStorage.getItem(key) || '{}');
        } catch (e) {}
      }
    }
    const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nutriplan_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-emerald-600" />
          <span>Configurações do Consultório</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Personalize as informações profissionais para emissão de planos alimentares, anamneses e impressões
        </p>
      </div>

      {/* Account Info Card */}
      {currentUser && (
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-400 flex items-center justify-center font-bold text-sm shrink-0">
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-white">{currentUser.name}</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                  Conta Ativa
                </span>
              </div>
              <p className="text-xs text-slate-300 font-mono mt-0.5">{currentUser.email}</p>
            </div>
          </div>

          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="px-4 py-2 bg-slate-700/80 hover:bg-rose-600/90 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 self-start sm:self-center border border-white/10"
            >
              <LogOut className="w-4 h-4" />
              <span>Sair da Conta</span>
            </button>
          )}
        </div>
      )}

      {/* Clinic & Nutritionist Profile Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Building className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-800 text-base">Dados da(o) Nutricionista & Consultório</h3>
          </div>
          <span className="text-xs text-slate-400">Usado no cabeçalho dos planos e impressões</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Nome da(o) Nutricionista *
            </label>
            <input
              type="text"
              required
              value={nutritionistName}
              onChange={(e) => setNutritionistName(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 font-bold text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Registro Profissional (CRN) *
            </label>
            <input
              type="text"
              required
              value={crn}
              onChange={(e) => setCrn(e.target.value)}
              placeholder="Ex: CRN-3 71644"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 font-bold text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Telefone / WhatsApp Comercial *
            </label>
            <input
              type="text"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(11) 91790-8668"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 font-semibold text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Nome da Clínica / Consultório (Opcional)
            </label>
            <input
              type="text"
              value={clinicName}
              onChange={(e) => setClinicName(e.target.value)}
              placeholder="Digite o nome do consultório ou deixe em branco"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              E-mail de Contato (Opcional)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contato@exemplo.com"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Instagram Profissional (Opcional)
            </label>
            <input
              type="text"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              placeholder="@seunome.nutri"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
            Endereço Completo do Consultório (Opcional)
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Ex: Av. Paulista, 1000 - Cj 804, São Paulo/SP"
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          {savedSuccess ? (
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>Configurações salvas com sucesso!</span>
            </span>
          ) : (
            <span />
          )}

          <button
            type="submit"
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-xs font-bold rounded-xl shadow-sm shadow-emerald-600/20 transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Salvar Alterações</span>
          </button>
        </div>
      </form>

      {/* PWA App Installation & Auto-Update Card */}
      <div className="bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 text-white rounded-2xl p-6 shadow-sm space-y-4 border border-emerald-500/20">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-400 flex items-center justify-center">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <span>Aplicativo Instalável (PWA)</span>
                {isInstalled && (
                  <span className="text-[10px] bg-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded-full font-bold border border-emerald-400/30">
                    Instalado
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-emerald-200/80">
                NutriPlan Pro no Celular, Tablet e Computador
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-300 font-semibold bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-500/30">
            <RefreshCw className="w-3.5 h-3.5 text-emerald-400 animate-spin" style={{ animationDuration: '6s' }} />
            <span>Auto-atualização ativa</span>
          </div>
        </div>

        <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
          <p>
            • <strong className="text-white">Atualização 100% Automática:</strong> Sempre que novas melhorias ou correções forem publicadas, o aplicativo se atualiza em segundo plano sem que você precise desinstalar e reinstalar.
          </p>
          <p>
            • <strong className="text-white">Acesso Rápido:</strong> Abra como um aplicativo nativo na tela inicial do seu celular, tablet ou na barra de tarefas do computador.
          </p>
        </div>

        {!isInstalled && (
          <div className="pt-2">
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
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 active:scale-95 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Instalar NutriPlan Pro no Dispositivo</span>
              <Sparkles className="w-3.5 h-3.5 opacity-90" />
            </button>
          </div>
        )}
      </div>

      <InstallAppModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />

      {/* Subscription & Plan Card */}
      {subscriptionStatus && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-500 text-slate-950 flex items-center justify-center shadow-sm">
                <Crown className="w-5 h-5 fill-current" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <span>Plano & Assinatura</span>
                  {subscriptionStatus.isPro ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      PRO ATIVO
                    </span>
                  ) : subscriptionStatus.isExpired ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                      TRIAL EXPIRADO
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                      TESTE GRATUITO
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-500">
                  {subscriptionStatus.isPro
                    ? 'Você tem acesso irrestrito a todas as funcionalidades do NutriPlan Pro.'
                    : `Restam ${subscriptionStatus.daysRemaining} dias de teste gratuito (${subscriptionStatus.currentPatientCount}/5 pacientes cadastrados).`}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenSubscriptionModal}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-sm shadow-emerald-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>{subscriptionStatus.isPro ? 'Ver Detalhes do Plano' : 'Fazer Upgrade para o Pro'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 block mb-0.5">Status Atual</span>
              <span className="font-bold text-slate-800">
                {subscriptionStatus.isPro ? 'Plano Pro Liberado' : 'Período de Testes (Trial)'}
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 block mb-0.5">Limite de Pacientes</span>
              <span className="font-bold text-slate-800">
                {subscriptionStatus.isPro ? 'Ilimitado' : `${subscriptionStatus.currentPatientCount} de 5 pacientes`}
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 block mb-0.5">Renovação / Vencimento</span>
              <span className="font-bold text-slate-800">
                {subscriptionStatus.isPro
                  ? 'Assinatura Recorrente Ativa'
                  : `${subscriptionStatus.daysRemaining} dias restantes`}
              </span>
            </div>
          </div>

          {!subscriptionStatus.isPro && (
            <div className="p-3.5 bg-amber-50/70 rounded-xl border border-amber-200/80 text-xs text-amber-900 space-y-1">
              <span className="font-bold flex items-center gap-1.5 text-amber-800">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Limitações do Período de Testes (Plano Gratuito):</span>
              </span>
              <ul className="list-disc list-inside space-y-0.5 text-[11px] text-amber-800/90 pl-1">
                <li>Limite máximo de 5 pacientes cadastrados (atualmente: {subscriptionStatus.currentPatientCount}/5).</li>
                <li>Duração de 14 dias a partir da criação da sua conta ({subscriptionStatus.daysRemaining} dias restantes).</li>
                <li>Ao término dos 14 dias ou ao atingir 5 pacientes, o cadastro de novos pacientes é travado até o upgrade para o Pro.</li>
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Resgate de Cupons Promocionais */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-600 text-white flex items-center justify-center shadow-sm">
            <Ticket className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <span>Cupom de Acesso</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                PROMOÇÃO / CORTESIA
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Possui um código de acesso ou cortesia? Insira abaixo para desbloquear o Plano Pro.
            </p>
          </div>
        </div>

        <form onSubmit={handleRedeemCoupon} className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => {
                  setCouponCode(e.target.value.toUpperCase());
                  setCouponFeedback(null);
                }}
                placeholder="Digite seu cupom de acesso..."
                className="w-full px-4 py-2.5 text-xs font-mono font-bold tracking-wider rounded-xl border border-slate-300 uppercase focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-slate-50/50"
              />
            </div>
            <button
              type="submit"
              disabled={!couponCode.trim()}
              className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 text-white text-xs font-bold rounded-xl shadow-sm shadow-purple-500/20 transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              <Gift className="w-4 h-4" />
              <span>Resgatar Cupom</span>
            </button>
          </div>

          {couponFeedback && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                couponFeedback.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {couponFeedback.type === 'success' ? (
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{couponFeedback.text}</span>
            </div>
          )}
        </form>

        {redeemedCoupons.length > 0 && (
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Cupons Resgatados nesta Conta:
            </span>
            <div className="space-y-1.5">
              {redeemedCoupons.map((c) => {
                const isStillValid = new Date(c.expiresAt).getTime() > Date.now();
                return (
                  <div
                    key={c.code}
                    className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                        {c.code}
                      </span>
                      <span className="text-slate-700 font-medium">{c.label}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px]">
                      <span className="text-slate-400">
                        Ativado em {new Date(c.redeemedAt).toLocaleDateString('pt-BR')}
                      </span>
                      {isStillValid ? (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 font-bold rounded-full">
                          Válido até {new Date(c.expiresAt).toLocaleDateString('pt-BR')}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-slate-200 text-slate-600 font-semibold rounded-full">
                          Expirado
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Backup Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-3">
        <h3 className="font-bold text-slate-800 text-sm">Backup de Segurança dos Dados</h3>
        <p className="text-xs text-slate-500">
          Exporte uma cópia completa de todos os pacientes cadastrados, dietas e consultas com um clique.
        </p>
        <button
          type="button"
          onClick={handleExportBackup}
          className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          <span>Baixar Backup JSON</span>
        </button>
      </div>
    </div>
  );
};
