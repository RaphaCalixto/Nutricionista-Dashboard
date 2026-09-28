import React from 'react';
import {
  Users,
  Calendar,
  UtensilsCrossed,
  Clock,
  ArrowRight,
  Plus,
  Phone,
  Sparkles
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip
} from 'recharts';
import type { Patient, Appointment, ClinicProfile, AppointmentStatus } from '../../types';
import type { NavTab } from '../layout/Sidebar';

interface DashboardViewProps {
  patients: Patient[];
  appointments: Appointment[];
  dietPlansCount: number;
  clinicProfile: ClinicProfile;
  onNavigate: (tab: NavTab) => void;
  onSelectPatient: (patient: Patient) => void;
  onNewPatient: () => void;
  onNewAppointment: () => void;
}

const GOAL_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

const STATUS_LABELS: Record<AppointmentStatus, { label: string; bg: string; text: string; border: string }> = {
  confirmed: { label: 'Confirmada', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  scheduled: { label: 'Agendada', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  completed: { label: 'Realizada', bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' },
  cancelled: { label: 'Cancelada', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  no_show: { label: 'Não compareceu', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
};

export const DashboardView: React.FC<DashboardViewProps> = ({
  patients,
  appointments,
  dietPlansCount,
  clinicProfile,
  onNavigate,
  onSelectPatient,
  onNewPatient,
  onNewAppointment,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments
    .filter((a) => a.date === todayStr)
    .sort((a, b) => a.time.localeCompare(b.time));

  const activePatients = patients.filter((p) => p.status === 'active');
  const nutritionistName = clinicProfile.nutritionistName || 'Raphael';

  // Goal Distribution for Chart
  const goalDistribution = React.useMemo(() => {
    const map: Record<string, number> = {};
    patients.forEach((p) => {
      let label = 'Emagrecimento';
      if (p.goal === 'hypertrophy') label = 'Hipertrofia';
      else if (p.goal === 'maintenance') label = 'Manutenção';
      else if (p.goal === 'health_clinical') label = 'Saúde Clínica';
      else if (p.goal === 'performance') label = 'Performance';
      else if (p.goal === 'pregnancy_lactation') label = 'Gestação';
      map[label] = (map[label] || 0) + 1;
    });

    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [patients]);

  const handleWhatsApp = (phone: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const cleanPhone = phone.replace(/\D/g, '');
    const phoneWithCountry = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
    const clinicGreeting = clinicProfile.clinicName ? ` da clínica ${clinicProfile.clinicName}` : '';
    const text = encodeURIComponent(`Olá ${name.split(' ')[0]}, tudo bem? Aqui é da ${nutritionistName}${clinicGreeting}!`);
    window.open(`https://wa.me/${phoneWithCountry}?text=${text}`, '_blank');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-emerald-100 text-xs font-semibold border border-white/15 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            <span>Painel Clínico de Atendimentos</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
            Olá, {nutritionistName}! 🌿
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
            Você tem <strong className="text-white">{todayAppointments.length} consultas</strong> agendadas para hoje e um total de <strong className="text-white">{activePatients.length} pacientes ativos</strong> em acompanhamento.
          </p>

          {/* Quick Action Pills */}
          <div className="flex flex-wrap items-center gap-2.5 pt-3">
            <button
              onClick={onNewPatient}
              className="px-4 py-2 bg-white text-emerald-900 hover:bg-emerald-50 active:scale-[0.98] rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Novo Paciente</span>
            </button>
            <button
              onClick={onNewAppointment}
              className="px-4 py-2 bg-emerald-600/80 hover:bg-emerald-600 border border-emerald-400/40 text-white active:scale-[0.98] rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Nova Consulta</span>
            </button>
            <button
              onClick={() => onNavigate('diet_planner')}
              className="px-4 py-2 bg-teal-600/80 hover:bg-teal-600 border border-teal-400/40 text-white active:scale-[0.98] rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <UtensilsCrossed className="w-3.5 h-3.5" />
              <span>Montar Dieta</span>
            </button>
          </div>
        </div>

        {/* Decorative background shape */}
        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Total Patients */}
        <div
          onClick={() => onNavigate('patients')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-emerald-400 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Pacientes Ativos</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-800">{activePatients.length}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Total cadastrados: {patients.length}</span>
        </div>

        {/* Today's Appointments */}
        <div
          onClick={() => onNavigate('schedule')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-emerald-400 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Consultas Hoje</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-800">{todayAppointments.length}</p>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
            {todayAppointments.filter((a) => a.status === 'confirmed').length} confirmadas
          </span>
        </div>

        {/* Diet Plans */}
        <div
          onClick={() => onNavigate('diet_planner')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-emerald-400 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Dietas Criadas</span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition-colors">
              <UtensilsCrossed className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-800">{dietPlansCount || 4}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Com cálculo TACO & API</span>
        </div>

        {/* Total Appointments in Agenda */}
        <div
          onClick={() => onNavigate('schedule')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-emerald-400 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total na Agenda</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-800">{appointments.length}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Atendimentos cadastrados</span>
        </div>
      </div>

      {/* Center Grid: Today's Schedule & Goal Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Today's Appointments */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span>Atendimentos do Dia</span>
              </h3>
              <p className="text-xs text-slate-500">Acompanhe e confirme os pacientes agendados para hoje</p>
            </div>

            <button
              onClick={() => onNavigate('schedule')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 hover:underline"
            >
              <span>Ver Agenda Completa</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {todayAppointments.length === 0 ? (
            <div className="text-center py-8 text-slate-400 space-y-2">
              <Calendar className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-xs">Nenhum atendimento marcado para hoje.</p>
              <button
                onClick={onNewAppointment}
                className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-xl"
              >
                Agendar Consulta
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {todayAppointments.map((apt) => {
                const statusInfo = STATUS_LABELS[apt.status] || STATUS_LABELS.scheduled;

                return (
                  <div
                    key={apt.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-emerald-300 hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="font-mono font-black text-sm text-slate-800 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shrink-0">
                        {apt.time}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">{apt.patientName}</h4>
                        <p className="text-slate-400 text-[11px] flex items-center gap-1.5">
                          <span>
                            {apt.type === 'first_consultation'
                              ? '1ª Consulta'
                              : apt.type === 'online'
                              ? 'Online'
                              : 'Retorno'}
                          </span>
                          <span>•</span>
                          <span>{apt.durationMinutes} min</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={(e) => handleWhatsApp(apt.patientPhone, apt.patientName, e)}
                        className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold rounded-lg border border-emerald-200 flex items-center gap-1 transition-colors"
                      >
                        <Phone className="w-3 h-3" />
                        <span>WhatsApp</span>
                      </button>

                      {/* Portuguese Status Badge */}
                      <span
                        className={`font-bold px-2.5 py-1 rounded-md text-[11px] border ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}
                      >
                        {statusInfo.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Col: Goal Distribution Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-800 text-sm">Objetivos dos Pacientes</h3>
            <p className="text-xs text-slate-400">Distribuição clínica do consultório</p>
          </div>

          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={goalDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {goalDistribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={GOAL_COLORS[index % GOAL_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 pt-1 text-xs">
            {goalDistribution.map((g, i) => (
              <div key={g.name} className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: GOAL_COLORS[i % GOAL_COLORS.length] }}
                  />
                  <span>{g.name}</span>
                </span>
                <strong className="text-slate-800">{g.value}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Patients List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-slate-800 text-base">Pacientes Recentes</h3>
            <p className="text-xs text-slate-500">Últimos prontuários atualizados</p>
          </div>

          <button
            onClick={() => onNavigate('patients')}
            className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
          >
            <span>Ver Todos</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {patients.slice(0, 4).map((p) => (
            <div
              key={p.id}
              onClick={() => onSelectPatient(p)}
              className="p-4 rounded-xl border border-slate-200 hover:border-emerald-400 hover:shadow-xs transition-all cursor-pointer bg-slate-50/50 hover:bg-white space-y-2.5"
            >
              <div className="flex items-center gap-3">
                {p.photoUrl ? (
                  <img src={p.photoUrl} alt={p.name} className="w-10 h-10 rounded-xl object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
                    {p.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                  </div>
                )}
                <div className="min-w-0">
                  <h4 className="font-bold text-slate-800 text-xs truncate">{p.name}</h4>
                  <p className="text-[11px] text-slate-400">{p.phone}</p>
                </div>
              </div>
              <div className="flex justify-between items-center text-[11px] pt-1">
                <span className="text-slate-500">{p.gender === 'male' ? 'Masc' : 'Fem'}</span>
                <span className="font-bold text-emerald-700">Ver Prontuário →</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
