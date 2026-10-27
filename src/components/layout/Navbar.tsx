import React from 'react';
import { Plus, Calendar as CalendarIcon, ShieldCheck, Crown, Zap, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { SubscriptionStatus } from '../../services/subscription';
import type { Appointment, Patient } from '../../types';
import { AppointmentsNotificationBell } from '../notifications/AppointmentsNotificationBell';

interface NavbarProps {
  onNewPatient: () => void;
  onNewAppointment: () => void;
  subscriptionStatus?: SubscriptionStatus;
  onOpenSubscriptionModal?: () => void;
  appointments?: Appointment[];
  patients?: Patient[];
  onNavigateToSchedule?: () => void;
  onSelectPatient?: (patient: Patient) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onNewPatient,
  onNewAppointment,
  subscriptionStatus,
  onOpenSubscriptionModal,
  appointments = [],
  patients = [],
  onNavigateToSchedule,
  onSelectPatient,
}) => {
  const todayFormatted = format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR });
  const capitalizedDate = todayFormatted.charAt(0).toUpperCase() + todayFormatted.slice(1);

  return (
    <header className="min-h-16 py-2.5 bg-white border-b border-slate-200 sticky top-0 z-20 px-3.5 sm:px-6 flex items-center justify-between gap-2.5 sm:gap-3.5 shadow-2xs">
      {/* Left Section: Date on tablets/desktop, or Status Badge on mobile (< sm) */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Date: Shown on tablet/desktop (sm+), hidden on mobile to avoid overlapping content */}
        <div className="hidden sm:flex items-center gap-1.5 sm:gap-2 text-slate-600 bg-slate-50 border border-slate-200/90 px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-semibold shrink-0 shadow-2xs whitespace-nowrap">
          <CalendarIcon className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span className="truncate">{capitalizedDate}</span>
        </div>

        <div className="hidden xl:flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50/80 px-2.5 py-1 rounded-md border border-emerald-200/60 font-semibold shrink-0">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Nutrição Clínica & Esportiva</span>
        </div>

        {/* Mobile-only Status Badge & Notification Bell */}
        <div className="sm:hidden flex items-center gap-1.5 shrink-0">
          {subscriptionStatus && (
            <>
              {subscriptionStatus.isPro ? (
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-amber-500/10 via-amber-500/15 to-amber-600/10 text-amber-800 border border-amber-300/80 rounded-xl text-xs font-black shadow-2xs whitespace-nowrap">
                  <Crown className="w-3.5 h-3.5 text-amber-600 fill-current shrink-0" />
                  <span>PRO</span>
                </div>
              ) : subscriptionStatus.isExpired ? (
                <div
                  onClick={onOpenSubscriptionModal}
                  className="cursor-pointer flex items-center gap-1 bg-rose-50 border border-rose-200 px-2 py-1 rounded-xl text-[11px] font-bold text-rose-800 shadow-2xs whitespace-nowrap"
                  title="Clique para assinar o NutriPlan Pro"
                >
                  <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
                  <span className="text-[10px] font-black uppercase text-white bg-rose-600 px-1.5 py-0.5 rounded shadow-xs">
                    Assinar Pro
                  </span>
                </div>
              ) : (
                <div
                  onClick={onOpenSubscriptionModal}
                  className="cursor-pointer flex items-center gap-1.5 bg-gradient-to-r from-amber-50 to-emerald-50 border border-amber-200/90 px-2 py-1 rounded-xl text-[11px] font-bold text-slate-800 shadow-2xs whitespace-nowrap"
                  title="Clique para ver os planos e fazer upgrade"
                >
                  <div className="flex items-center gap-1 text-amber-700">
                    <Zap className="w-3.5 h-3.5 fill-current text-amber-500 shrink-0" />
                    <span>{subscriptionStatus.daysRemaining}d</span>
                  </div>
                  <span className="text-[10px] font-black uppercase text-white bg-emerald-600 px-1.5 py-0.5 rounded shadow-xs">
                    Pro
                  </span>
                </div>
              )}
            </>
          )}

          {/* Sininho de Notificação das Consultas */}
          <AppointmentsNotificationBell
            appointments={appointments}
            patients={patients}
            onNavigateToSchedule={onNavigateToSchedule}
            onSelectPatient={onSelectPatient}
          />
        </div>
      </div>

      {/* Center Section: Status Banner on desktop / tablet (sm+) + Bell */}
      <div className="hidden sm:flex items-center gap-2.5 shrink-0">
        {subscriptionStatus && (
          <>
            {subscriptionStatus.isPro ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500/10 via-amber-500/15 to-amber-600/10 text-amber-800 border border-amber-300/80 rounded-xl text-xs font-black shadow-2xs whitespace-nowrap">
                <Crown className="w-3.5 h-3.5 text-amber-600 fill-current shrink-0" />
                <span>NutriPlan PRO</span>
              </div>
            ) : subscriptionStatus.isExpired ? (
              <div
                onClick={onOpenSubscriptionModal}
                className="cursor-pointer flex items-center gap-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-800 transition-all shadow-2xs group whitespace-nowrap"
                title="Clique para assinar o NutriPlan Pro"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span>Teste de 14 dias encerrado</span>
                <span className="text-[10px] font-black uppercase text-white bg-rose-600 group-hover:bg-rose-700 px-2 py-0.5 rounded-md shadow-xs">
                  Assinar Pro
                </span>
              </div>
            ) : (
              <div
                onClick={onOpenSubscriptionModal}
                className="cursor-pointer flex items-center gap-2 bg-gradient-to-r from-amber-50 to-emerald-50 hover:from-amber-100 hover:to-emerald-100 border border-amber-200/90 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-800 transition-all shadow-2xs group whitespace-nowrap"
                title="Clique para ver os planos e fazer upgrade"
              >
                <div className="flex items-center gap-1 text-amber-700">
                  <Zap className="w-3.5 h-3.5 fill-current text-amber-500 shrink-0" />
                  <span>{subscriptionStatus.daysRemaining}d de teste</span>
                </div>
                <span className="text-slate-300">|</span>
                <span className="text-slate-600 font-semibold">
                  {subscriptionStatus.currentPatientCount}/5 pac.
                </span>
                <span className="text-[10px] font-black uppercase text-white bg-emerald-600 group-hover:bg-emerald-700 px-2 py-0.5 rounded-md shadow-xs">
                  Assinar
                </span>
              </div>
            )}
          </>
        )}

        {/* Sininho de Notificação das Consultas */}
        <AppointmentsNotificationBell
          appointments={appointments}
          patients={patients}
          onNavigateToSchedule={onNavigateToSchedule}
          onSelectPatient={onSelectPatient}
        />
      </div>

      {/* Right Section: Actions */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0 ml-auto">
        <button
          onClick={onNewAppointment}
          className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-[11px] sm:text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 hover:border-slate-400 rounded-xl transition-all shadow-xs shrink-0 cursor-pointer whitespace-nowrap"
        >
          <CalendarIcon className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span className="hidden xs:inline sm:inline">Nova Consulta</span>
          <span className="xs:hidden sm:hidden">Consulta</span>
        </button>

        <button
          onClick={onNewPatient}
          className="flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] rounded-xl transition-all shadow-sm shadow-emerald-600/20 shrink-0 cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span className="hidden sm:inline">Novo Paciente</span>
          <span className="sm:hidden">Paciente</span>
        </button>
      </div>
    </header>
  );
};
