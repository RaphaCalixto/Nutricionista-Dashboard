import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  Plus,
  Clock,
  User,
  Phone,
  Video,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Edit2,
  Trash2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Send,
  DollarSign
} from 'lucide-react';
import {
  format,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  parseISO
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Appointment, Patient, AppointmentStatus, ClinicProfile } from '../../types';

interface ScheduleViewProps {
  appointments: Appointment[];
  patients: Patient[];
  clinicProfile: ClinicProfile;
  onNewAppointment: (initialDate?: string) => void;
  onEditAppointment: (appointment: Appointment) => void;
  onDeleteAppointment: (id: string) => Promise<void>;
  onUpdateStatus: (appointmentId: string, newStatus: AppointmentStatus) => Promise<void>;
  onSelectPatient?: (patient: Patient) => void;
}

const STATUS_CONFIG: Record<
  AppointmentStatus,
  { label: string; bg: string; text: string; border: string }
> = {
  scheduled: { label: 'Agendada', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  confirmed: { label: 'Confirmada', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  completed: { label: 'Realizada', bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300' },
  cancelled: { label: 'Cancelada', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  no_show: { label: 'Não compareceu', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
};

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  appointments,
  patients,
  clinicProfile,
  onNewAppointment,
  onEditAppointment,
  onDeleteAppointment,
  onUpdateStatus,
  onSelectPatient,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [viewMode, setViewMode] = useState<'month' | 'day' | 'list'>('month');

  // Month navigation
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  // Calendar dates generation
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Filter appointments for selected day
  const selectedDayAppointments = useMemo(() => {
    return appointments
      .filter((a) => a.date === selectedDate)
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [appointments, selectedDate]);

  // WhatsApp Reminder Generator
  const handleSendWhatsAppReminder = (apt: Appointment, e: React.MouseEvent) => {
    e.stopPropagation();
    const cleanPhone = apt.patientPhone.replace(/\D/g, '');
    const phoneWithCountry = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;

    let formattedDate = apt.date;
    try {
      const parsed = parseISO(apt.date);
      formattedDate = format(parsed, "EEEE, dd 'de' MMMM", { locale: ptBR });
    } catch (e) {}

    const message = `Olá, ${apt.patientName.split(' ')[0]}! Tudo bem? 🌿\n\nLembramos da sua consulta nutricional marcada para *${formattedDate}* às *${apt.time}* com a nutricionista ${clinicProfile.nutritionistName} (${clinicProfile.clinicName}).\n\nPor favor, confirme se você comparecerá respondendo esta mensagem. Até breve!`;

    window.open(`https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Agenda de Consultas</h2>
          <p className="text-xs text-slate-500 mt-1">
            Gerencie os horários, atendimentos e lembretes aos pacientes via WhatsApp
          </p>
        </div>

        <button
          onClick={() => onNewAppointment(selectedDate)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm shadow-emerald-600/20 active:scale-[0.98] transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Agendar Nova Consulta</span>
        </button>
      </div>

      {/* Main Schedule Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Interactive Calendar */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4">
          {/* Calendar Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-black text-slate-800 text-lg capitalize">
                {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
              </h3>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  const today = new Date();
                  setCurrentDate(today);
                  setSelectedDate(today.toISOString().split('T')[0]);
                }}
                className="px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Hoje
              </button>
              <button
                onClick={prevMonth}
                className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextMonth}
                className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 text-center text-[11px] font-bold text-slate-400 uppercase py-2 border-b border-slate-100">
            <span>Dom</span>
            <span>Seg</span>
            <span>Ter</span>
            <span>Qua</span>
            <span>Qui</span>
            <span>Sex</span>
            <span>Sáb</span>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, idx) => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const isSelected = dateStr === selectedDate;
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isCurrentDay = isToday(day);

              const dayAppointments = appointments.filter((a) => a.date === dateStr);

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`min-h-[85px] p-2 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50/40 shadow-xs'
                      : isCurrentMonth
                      ? 'border-slate-100 hover:border-slate-300 hover:bg-slate-50/60'
                      : 'border-transparent bg-slate-50/40 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                        isCurrentDay
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : isSelected
                          ? 'text-emerald-800'
                          : isCurrentMonth
                          ? 'text-slate-700'
                          : 'text-slate-400'
                      }`}
                    >
                      {format(day, 'd')}
                    </span>

                    {dayAppointments.length > 0 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded-full">
                        {dayAppointments.length}
                      </span>
                    )}
                  </div>

                  {/* Tiny appointment markers */}
                  <div className="space-y-1 mt-1">
                    {dayAppointments.slice(0, 2).map((apt) => (
                      <div
                        key={apt.id}
                        className="text-[10px] font-semibold truncate px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-700 shadow-2xs"
                      >
                        <span className="font-mono font-bold text-emerald-700 mr-1">{apt.time}</span>
                        {apt.patientName.split(' ')[0]}
                      </div>
                    ))}
                    {dayAppointments.length > 2 && (
                      <span className="text-[9px] text-slate-400 font-semibold block text-center">
                        +{dayAppointments.length - 2} mais
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Day Appointments List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4 flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Atendimentos do Dia
              </span>
              <h4 className="font-bold text-slate-800 text-sm">
                {selectedDate === new Date().toISOString().split('T')[0]
                  ? 'Hoje'
                  : format(parseISO(selectedDate), "dd 'de' MMMM", { locale: ptBR })}
              </h4>
            </div>

            <button
              onClick={() => onNewAppointment(selectedDate)}
              className="p-1.5 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
              title="Adicionar consulta nesta data"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3">
            {selectedDayAppointments.length === 0 ? (
              <div className="text-center py-12 text-slate-400 space-y-2">
                <CalendarIcon className="w-8 h-8 mx-auto text-slate-300" />
                <p className="text-xs">Nenhuma consulta marcada para esta data.</p>
                <button
                  onClick={() => onNewAppointment(selectedDate)}
                  className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-xl"
                >
                  Agendar agora
                </button>
              </div>
            ) : (
              selectedDayAppointments.map((apt) => {
                const statusStyle = STATUS_CONFIG[apt.status] || STATUS_CONFIG.scheduled;

                return (
                  <div
                    key={apt.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-emerald-300 hover:shadow-xs transition-all space-y-2.5"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-slate-800 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                          {apt.time}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">
                          ({apt.durationMinutes} min)
                        </span>
                      </div>

                      <select
                        value={apt.status}
                        onChange={(e) => onUpdateStatus(apt.id, e.target.value as AppointmentStatus)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border} focus:outline-none cursor-pointer`}
                      >
                        <option value="scheduled">Agendada</option>
                        <option value="confirmed">Confirmada</option>
                        <option value="completed">Realizada</option>
                        <option value="cancelled">Cancelada</option>
                        <option value="no_show">Não compareceu</option>
                      </select>
                    </div>

                    <div>
                      <h5 className="font-bold text-slate-800 text-sm">{apt.patientName}</h5>
                      <p className="text-xs text-slate-400">
                        {apt.type === 'first_consultation'
                          ? 'Primeira Consulta'
                          : apt.type === 'follow_up'
                          ? 'Retorno'
                          : apt.type === 'online'
                          ? 'Online (Videoconferência)'
                          : 'Avaliação Física'}
                      </p>
                    </div>

                    {apt.meetUrl && (
                      <a
                        href={apt.meetUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 hover:bg-blue-100"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Entrar no Google Meet</span>
                      </a>
                    )}

                    {apt.notes && (
                      <p className="text-[11px] text-slate-500 italic bg-white p-2 rounded-lg border border-slate-100">
                        "{apt.notes}"
                      </p>
                    )}

                    {/* Actions bar */}
                    <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between">
                      <button
                        onClick={(e) => handleSendWhatsAppReminder(apt, e)}
                        className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-100/70 px-2.5 py-1 rounded-lg hover:bg-emerald-100 transition-colors"
                        title="Enviar mensagem de lembrete com horário formatado"
                      >
                        <Send className="w-3 h-3" />
                        <span>Lembrete WhatsApp</span>
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onEditAppointment(apt)}
                          className="p-1 text-slate-400 hover:text-blue-600 rounded-md"
                          title="Editar"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Remover agendamento de ${apt.patientName}?`)) {
                              onDeleteAppointment(apt.id);
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded-md"
                          title="Excluir"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
