import React from 'react';
import { Plus, Calendar as CalendarIcon, ShieldCheck, Crown, Zap, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { SubscriptionStatus } from '../../services/subscription';

interface NavbarProps {
  onNewPatient: () => void;
  onNewAppointment: () => void;
  subscriptionStatus?: SubscriptionStatus;
  onOpenSubscriptionModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onNewPatient,
  onNewAppointment,
  subscriptionStatus,
  onOpenSubscriptionModal,
}) => {
  const todayFormatted = format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR });
  const capitalizedDate = todayFormatted.charAt(0).toUpperCase() + todayFormatted.slice(1);

  return (
    <header className="min-h-16 py-2.5 bg-white border-b border-slate-200 sticky top-0 z-20 px-3.5 sm:px-6 flex items-center justify-between gap-3.5 shadow-2xs">
      {/* Date & Subtitle */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <div className="flex items-center gap-1.5 sm:gap-2 text-slate-600 bg-slate-50 border border-slate-200/90 px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-semibold shrink-0 shadow-2xs">
          <CalendarIcon className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span className="truncate">{capitalizedDate}</span>
        </div>

        <div className="hidden xl:flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50/80 px-2.5 py-1 rounded-md border border-emerald-200/60 font-semibold shrink-0">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Nutrição Clínica & Esportiva</span>
        </div>
      </div>

      {/* Trial / Pro Status Banner */}
      {subscriptionStatus && (
        <div className="flex items-center">
          {subscriptionStatus.isPro ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500/10 via-amber-500/15 to-amber-600/10 text-amber-800 border border-amber-300/80 rounded-xl text-xs font-black shadow-2xs">
              <Crown className="w-3.5 h-3.5 text-amber-600 fill-current" />
              <span>NutriPlan PRO</span>
            </div>
          ) : subscriptionStatus.isExpired ? (
            <div
              onClick={onOpenSubscriptionModal}
              className="cursor-pointer flex items-center gap-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-800 transition-all shadow-2xs group"
              title="Clique para assinar o NutriPlan Pro"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              <span className="hidden sm:inline">Teste de 14 dias encerrado</span>
              <span className="text-[10px] font-black uppercase text-white bg-rose-600 group-hover:bg-rose-700 px-2 py-0.5 rounded-md shadow-xs">
                Assinar Pro
              </span>
            </div>
          ) : (
            <div
              onClick={onOpenSubscriptionModal}
              className="cursor-pointer flex items-center gap-2 bg-gradient-to-r from-amber-50 to-emerald-50 hover:from-amber-100 hover:to-emerald-100 border border-amber-200/90 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-800 transition-all shadow-2xs group"
              title="Clique para ver os planos e fazer upgrade"
            >
              <div className="flex items-center gap-1 text-amber-700">
                <Zap className="w-3.5 h-3.5 fill-current text-amber-500" />
                <span>{subscriptionStatus.daysRemaining}d de teste</span>
              </div>
              <span className="text-slate-300 hidden sm:inline">|</span>
              <span className="text-slate-600 font-semibold hidden sm:inline">
                {subscriptionStatus.currentPatientCount}/5 pac.
              </span>
              <span className="text-[10px] font-black uppercase text-white bg-emerald-600 group-hover:bg-emerald-700 px-2 py-0.5 rounded-md shadow-xs">
                Assinar
              </span>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-auto">
        <button
          onClick={onNewAppointment}
          className="flex items-center gap-1.5 px-3 sm:px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 hover:border-slate-400 rounded-xl transition-all shadow-xs shrink-0 cursor-pointer"
        >
          <CalendarIcon className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span className="whitespace-nowrap">Nova Consulta</span>
        </button>

        <button
          onClick={onNewPatient}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] rounded-xl transition-all shadow-sm shadow-emerald-600/20 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Novo Paciente</span>
          <span className="sm:hidden">Paciente</span>
        </button>
      </div>
    </header>
  );
};
