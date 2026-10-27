import React, { useState, useEffect, useRef } from 'react';
import {
  Bell,
  Calendar,
  Clock,
  User,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  X,
  Volume2,
  Sparkles,
  Settings
} from 'lucide-react';
import { format, differenceInCalendarDays, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Appointment, Patient, ClinicProfile } from '../../types';

interface AppointmentsNotificationBellProps {
  appointments?: Appointment[];
  patients?: Patient[];
  onNavigateToSchedule?: () => void;
  onSelectPatient?: (patient: Patient) => void;
  clinicProfile?: ClinicProfile;
  onNavigateToSettings?: () => void;
}

export const AppointmentsNotificationBell: React.FC<AppointmentsNotificationBellProps> = ({
  appointments = [],
  patients = [],
  onNavigateToSchedule,
  onSelectPatient,
  clinicProfile,
  onNavigateToSettings,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Verifica o status de permissão de notificações do navegador
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermissionStatus(Notification.permission);
    }
  }, []);

  // Fechar ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const todayStr = format(new Date(), 'yyyy-MM-dd');

  // Filtra consultas ativas (não canceladas e não finalizadas) de hoje e próximas
  const activeAppointments = appointments.filter(
    (a) => a.status !== 'cancelled' && a.status !== 'completed'
  );

  const todayAppointments = activeAppointments.filter((a) => a.date === todayStr);
  const upcomingAppointments = activeAppointments
    .filter((a) => a.date > todayStr)
    .sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return (a.time || '').localeCompare(b.time || '');
    });

  const isProfileIncomplete = !clinicProfile?.crn || clinicProfile.crn.trim() === '';
  const allAlertAppointments = [...todayAppointments, ...upcomingAppointments];
  const totalCount = allAlertAppointments.length + (isProfileIncomplete ? 1 : 0);
  const hasToday = todayAppointments.length > 0;

  // Disparo automático de notificação nativa no navegador caso tenha permissão concedida
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      'Notification' in window &&
      Notification.permission === 'granted' &&
      todayAppointments.length > 0
    ) {
      const storageKey = `nutriplan_notif_today_${todayStr}`;
      const alreadyNotified = sessionStorage.getItem(storageKey);

      if (!alreadyNotified) {
        try {
          const first = todayAppointments[0];
          new Notification('NutriPlan Pro: Consulta Hoje!', {
            body: `Você tem ${todayAppointments.length} consulta(s) hoje. Próxima: ${first.patientName} às ${first.time}.`,
            icon: '/pwa-192x192.svg',
          });
          sessionStorage.setItem(storageKey, 'true');
        } catch (e) {
          console.warn('Erro ao disparar notificação nativa:', e);
        }
      }
    }
  }, [todayAppointments, todayStr]);

  // Solicita permissão para notificações nativas
  const handleRequestPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      alert('Seu navegador atual não suporta notificações de área de trabalho.');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setPermissionStatus(permission);

      if (permission === 'granted') {
        new Notification('NutriPlan Pro: Notificações Ativadas! 🎉', {
          body: 'Você receberá avisos no dispositivo sempre que houver consultas agendadas.',
          icon: '/pwa-192x192.svg',
        });
      }
    } catch (e) {
      console.error('Erro ao pedir permissão de notificações:', e);
    }
  };

  const getDaysDiffText = (dateStr: string) => {
    try {
      const target = parseISO(dateStr);
      const diff = differenceInCalendarDays(target, new Date());
      if (diff === 0) return 'Hoje';
      if (diff === 1) return 'Amanhã';
      return `Em ${diff} dias`;
    } catch (e) {
      return 'Próxima';
    }
  };

  const formatDisplayDate = (dateStr: string) => {
    try {
      const d = parseISO(dateStr);
      return format(d, "dd 'de' MMM", { locale: ptBR });
    } catch (e) {
      return dateStr;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'first_consultation':
        return '1ª Consulta';
      case 'follow_up':
        return 'Retorno';
      case 'evaluation':
        return 'Avaliação';
      case 'online':
        return 'Online';
      default:
        return 'Consulta';
    }
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Botão do Sininho */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`relative p-2 rounded-xl transition-all cursor-pointer flex items-center justify-center ${
          isOpen
            ? 'bg-emerald-100 text-emerald-800 ring-2 ring-emerald-500/30'
            : hasToday
            ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 shadow-2xs'
            : totalCount > 0
            ? 'bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 shadow-2xs'
            : 'bg-slate-50 hover:bg-slate-100 text-slate-500 border border-slate-200'
        }`}
        title="Lembretes de Consultas e Agendas"
        aria-label="Lembretes de Consultas"
      >
        <Bell className={`w-4 h-4 ${hasToday ? 'animate-bounce text-rose-600' : ''}`} />

        {/* Badge Contador */}
        {totalCount > 0 && (
          <span
            className={`absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 flex items-center justify-center rounded-full text-[10px] font-black text-white shadow-xs ${
              hasToday ? 'bg-rose-600 animate-pulse' : 'bg-amber-500'
            }`}
          >
            {totalCount}
          </span>
        )}
      </button>

      {/* Popover / Dropdown de Notificações */}
      {isOpen && (
        <>
          {/* Backdrop exclusivo para mobile para centralizar a atenção e fechar ao clicar */}
          <div
            className="fixed inset-0 bg-slate-900/30 backdrop-blur-2xs z-40 sm:hidden animate-in fade-in duration-150"
            onClick={() => setIsOpen(false)}
          />

          <div className="fixed inset-x-3.5 top-16 sm:absolute sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:top-full sm:mt-2.5 w-auto sm:w-[380px] max-w-sm mx-auto bg-white rounded-3xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[calc(100vh-5rem)] flex flex-col">
            {/* Header do Popover */}
            <div className="p-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-amber-400">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-extrabold text-xs text-white">Central de Notificações</h4>
                <p className="text-[10px] text-slate-300">
                  {totalCount === 0
                    ? 'Nenhuma pendência no momento'
                    : `${totalCount} item(ns) para acompanhar`}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Banner de Permissão do Navegador */}
          {permissionStatus !== 'granted' ? (
            <div className="p-3 bg-emerald-50/90 border-b border-emerald-100 flex items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-2 text-[11px] text-emerald-950">
                <Volume2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="leading-tight">
                  Ative notificações para ser avisado no computador/celular.
                </span>
              </div>
              <button
                type="button"
                onClick={handleRequestPermission}
                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-[10px] rounded-lg shadow-xs whitespace-nowrap cursor-pointer shrink-0"
              >
                Permitir
              </button>
            </div>
          ) : (
            <div className="px-3 py-1.5 bg-slate-50 border-b border-slate-100 flex items-center gap-1.5 text-[10px] text-slate-500 font-semibold shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Notificações no dispositivo ativadas</span>
            </div>
          )}

          {/* Lista de Notificações / Consultas */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5 max-h-[360px] sm:max-h-[380px]">
            {/* Notificação Fixa: Cadastro Profissional / CRN */}
            {isProfileIncomplete && (
              <div
                onClick={() => {
                  if (onNavigateToSettings) {
                    onNavigateToSettings();
                    setIsOpen(false);
                  }
                }}
                className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 hover:bg-amber-100/80 hover:border-amber-400 transition-all cursor-pointer shadow-2xs group"
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500 text-white shadow-xs">
                    <Sparkles className="w-3 h-3" />
                    <span>Lembrete Importante</span>
                  </span>
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-200/60 px-2 py-0.5 rounded-full border border-amber-300/80">
                    Fixa
                  </span>
                </div>

                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h5 className="font-extrabold text-xs text-slate-900 group-hover:text-amber-950 transition-colors">
                      Complete seu CRN e Dados do Consultório
                    </h5>
                    <p className="text-[11px] text-slate-600 leading-snug mt-1">
                      Adicione seu número de <strong>CRN</strong> nas configurações. Ele é fundamental para sair assinado e validado nos PDFs de dietas e prontuários.
                    </p>
                    <div className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-amber-800 group-hover:text-amber-950">
                      <Settings className="w-3.5 h-3.5" />
                      <span>Ir para Configurações</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {allAlertAppointments.length === 0 && !isProfileIncomplete ? (
              <div className="py-8 text-center text-slate-400 space-y-2">
                <Calendar className="w-8 h-8 mx-auto text-slate-300 stroke-[1.5]" />
                <p className="text-xs font-bold text-slate-600">Nenhuma consulta próxima</p>
                <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                  Quando você cadastrar consultas na Agenda, elas aparecerão aqui com lembretes automáticos.
                </p>
              </div>
            ) : (
              allAlertAppointments.map((appt) => {
                const isTodayAppt = appt.date === todayStr;
                const daysDiff = getDaysDiffText(appt.date);
                const matchedPatient = patients.find((p) => p.id === appt.patientId);

                return (
                  <div
                    key={appt.id}
                    onClick={() => {
                      if (matchedPatient && onSelectPatient) {
                        onSelectPatient(matchedPatient);
                        setIsOpen(false);
                      } else if (onNavigateToSchedule) {
                        onNavigateToSchedule();
                        setIsOpen(false);
                      }
                    }}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer pt-3 ${
                      isTodayAppt
                        ? 'bg-rose-50/80 border-rose-300/80 hover:bg-rose-100/70 shadow-2xs'
                        : 'bg-amber-50/70 border-amber-300/80 hover:bg-amber-100/70 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      {/* Tag de Alerta: Vermelho no dia, Amarelo nos dias anteriores */}
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          isTodayAppt
                            ? 'bg-rose-600 text-white shadow-xs animate-pulse'
                            : 'bg-amber-200/90 text-amber-900 border border-amber-300'
                        }`}
                      >
                        <Clock className="w-3 h-3" />
                        <span>
                          {isTodayAppt ? `HOJE às ${appt.time}` : `${daysDiff} • ${formatDisplayDate(appt.date)}`}
                        </span>
                      </span>

                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/80 text-slate-600 border border-slate-200">
                        {getTypeLabel(appt.type)}
                      </span>
                    </div>

                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h5 className="font-bold text-xs text-slate-900 truncate">
                          {appt.patientName}
                        </h5>
                        <p className="text-[11px] text-slate-600 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>Horário: <strong>{appt.time}</strong></span>
                          {appt.patientPhone && (
                            <>
                              <span className="text-slate-300">•</span>
                              <span className="truncate">{appt.patientPhone}</span>
                            </>
                          )}
                        </p>
                      </div>

                      <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-slate-400 shadow-2xs shrink-0 self-center">
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer com link direto para a Agenda */}
          {onNavigateToSchedule && (
            <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
              <span className="text-[10px] text-slate-500 font-medium">
                {totalCount} consulta(s) agendada(s)
              </span>
              <button
                type="button"
                onClick={() => {
                  onNavigateToSchedule();
                  setIsOpen(false);
                }}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
              >
                <span>Ver Agenda Completa</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </>
    )}
  </div>
  );
};
