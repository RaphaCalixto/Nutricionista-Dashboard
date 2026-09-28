import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  UtensilsCrossed,
  Calendar,
  Apple,
  Pill,
  Settings,
  Plus,
  X,
  LogOut,
  ChevronRight,
  User as UserIcon,
  ShieldCheck,
  Heart
} from 'lucide-react';
import type { NavTab } from './Sidebar';
import type { ClinicProfile, User } from '../../types';

interface MobileNavProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  clinicProfile: ClinicProfile;
  currentUser?: User | null;
  onLogout?: () => void;
  onNewPatient?: () => void;
  onNewAppointment?: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  currentTab,
  onSelectTab,
  clinicProfile,
  currentUser,
  onLogout,
  onNewPatient,
  onNewAppointment,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems: { id: NavTab; label: string; icon: React.ReactNode; badge?: string; desc: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, desc: 'Visão geral da clínica e métricas' },
    { id: 'patients', label: 'Pacientes & Prontuários', icon: <Users className="w-5 h-5" />, desc: 'Anamnese, antropometria e evolução' },
    { id: 'diet_planner', label: 'Montador de Dietas', icon: <UtensilsCrossed className="w-5 h-5" />, badge: 'TACO & API', desc: 'Cardápios personalizados e cálculos' },
    { id: 'schedule', label: 'Agenda de Consultas', icon: <Calendar className="w-5 h-5" />, desc: 'Horários, retornos e atendimentos' },
    { id: 'foods', label: 'Tabela de Alimentos', icon: <Apple className="w-5 h-5" />, desc: 'Consulta nutricional de alimentos' },
    { id: 'supplements', label: 'Suplementação', icon: <Pill className="w-5 h-5" />, desc: 'Prescrição e fórmulas manipuladas' },
    { id: 'settings', label: 'Configurações', icon: <Settings className="w-5 h-5" />, desc: 'Perfil profissional e dados da conta' },
  ];

  const displayName = currentUser?.name || clinicProfile.nutritionistName || 'Raphael';
  const displayEmail = currentUser?.email || clinicProfile.email || 'raphacalixto10@gmail.com';

  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('');

  const handleNavigate = (tab: NavTab) => {
    onSelectTab(tab);
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* FIXED BOTTOM NAVIGATION BAR (Mobile / Tablet) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-3 py-1.5 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-around max-w-lg mx-auto">
          {/* Dashboard */}
          <button
            onClick={() => handleNavigate('dashboard')}
            className={`flex flex-col items-center py-1 px-2 rounded-xl transition-all ${
              currentTab === 'dashboard'
                ? 'text-emerald-600 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <LayoutDashboard className={`w-5 h-5 ${currentTab === 'dashboard' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[10px] mt-0.5">Início</span>
          </button>

          {/* Pacientes */}
          <button
            onClick={() => handleNavigate('patients')}
            className={`flex flex-col items-center py-1 px-2 rounded-xl transition-all ${
              currentTab === 'patients'
                ? 'text-emerald-600 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className={`w-5 h-5 ${currentTab === 'patients' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[10px] mt-0.5">Pacientes</span>
          </button>

          {/* Central "+" Action Button */}
          <button
            onClick={() => setIsMenuOpen(true)}
            aria-label="Abrir Menu Completo"
            className="flex flex-col items-center group -mt-5"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-600/35 border-4 border-slate-50 group-active:scale-95 transition-all">
              <Plus className={`w-6 h-6 transition-transform duration-200 ${isMenuOpen ? 'rotate-45' : ''}`} />
            </div>
            <span className="text-[10px] font-bold text-emerald-700 mt-0.5">Menu</span>
          </button>

          {/* Dietas */}
          <button
            onClick={() => handleNavigate('diet_planner')}
            className={`flex flex-col items-center py-1 px-2 rounded-xl transition-all ${
              currentTab === 'diet_planner'
                ? 'text-emerald-600 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <UtensilsCrossed className={`w-5 h-5 ${currentTab === 'diet_planner' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[10px] mt-0.5">Dietas</span>
          </button>

          {/* Agenda */}
          <button
            onClick={() => handleNavigate('schedule')}
            className={`flex flex-col items-center py-1 px-2 rounded-xl transition-all ${
              currentTab === 'schedule'
                ? 'text-emerald-600 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Calendar className={`w-5 h-5 ${currentTab === 'schedule' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[10px] mt-0.5">Agenda</span>
          </button>
        </div>
      </nav>

      {/* FULL-SCREEN NAVIGATION BOTTOM SHEET / DRAWER */}
      {isMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end animate-fade-in">
          {/* Backdrop */}
          <div
            onClick={() => setIsMenuOpen(false)}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
          />

          {/* Drawer Panel */}
          <div className="relative bg-white rounded-t-3xl shadow-2xl max-h-[85vh] flex flex-col overflow-hidden border-t border-slate-200 animate-slide-up">
            {/* Drawer Header */}
            <div className="p-4 px-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500 via-pink-500 to-emerald-500 flex items-center justify-center text-white shadow-sm">
                  <Heart className="w-4 h-4 fill-white" />
                </div>
                <div>
                  <h2 className="text-sm font-extrabold text-slate-800">NutriPlan Pro</h2>
                  <p className="text-[11px] font-bold text-emerald-600">Navegação e Ações Rápidas</p>
                </div>
              </div>

              <button
                onClick={() => setIsMenuOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Actions Bar */}
            {(onNewPatient || onNewAppointment) && (
              <div className="grid grid-cols-2 gap-2 p-4 bg-emerald-50/50 border-b border-emerald-100/60">
                {onNewPatient && (
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      onNewPatient();
                    }}
                    className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-sm shadow-emerald-600/20 active:scale-95 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Novo Paciente</span>
                  </button>
                )}
                {onNewAppointment && (
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      onNewAppointment();
                    }}
                    className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold shadow-2xs hover:bg-slate-50 active:scale-95 transition-all"
                  >
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    <span>Nova Consulta</span>
                  </button>
                )}
              </div>
            )}

            {/* Navigation List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-1.5 divide-y divide-slate-100/80">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 pt-1 pb-1">
                Todas as Seções do Sistema
              </div>

              {menuItems.map((item) => {
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigate(item.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl text-left transition-all ${
                      isActive
                        ? 'bg-emerald-50/90 text-emerald-800 border border-emerald-200 font-bold'
                        : 'text-slate-700 hover:bg-slate-50 active:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          isActive
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {item.icon}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold truncate">{item.label}</span>
                          {item.badge && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 truncate font-normal">{item.desc}</p>
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                  </button>
                );
              })}
            </div>

            {/* Profile & Logout Section */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                  {initials || <UserIcon className="w-5 h-5" />}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 truncate">{displayName}</p>
                  <p className="text-[11px] text-slate-500 truncate">{displayEmail}</p>
                </div>
              </div>

              {onLogout && (
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onLogout();
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-bold transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sair</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
