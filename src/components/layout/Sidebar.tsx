import React from 'react';
import {
  LayoutDashboard,
  Users,
  UtensilsCrossed,
  Calendar,
  Apple,
  Pill,
  Settings,
  Heart,
  ChevronRight,
  LogOut
} from 'lucide-react';
import type { ClinicProfile, User } from '../../types';

export type NavTab = 
  | 'dashboard' 
  | 'patients' 
  | 'diet_planner' 
  | 'schedule' 
  | 'foods' 
  | 'supplements' 
  | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  clinicProfile: ClinicProfile;
  currentUser?: User | null;
  onLogout?: () => void;
  supabaseConnected?: boolean;
  onOpenSqlModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  clinicProfile,
  currentUser,
  onLogout,
}) => {
  const menuItems: { id: NavTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'patients', label: 'Pacientes & Prontuários', icon: <Users className="w-5 h-5" /> },
    { id: 'diet_planner', label: 'Montador de Dietas', icon: <UtensilsCrossed className="w-5 h-5" />, badge: 'TACO & API' },
    { id: 'schedule', label: 'Agenda de Consultas', icon: <Calendar className="w-5 h-5" /> },
    { id: 'foods', label: 'Tabela de Alimentos', icon: <Apple className="w-5 h-5" /> },
    { id: 'supplements', label: 'Suplementação', icon: <Pill className="w-5 h-5" /> },
    { id: 'settings', label: 'Configurações', icon: <Settings className="w-5 h-5" /> },
  ];

  const displayName = currentUser?.name || clinicProfile.nutritionistName || 'Nutricionista';
  const crn = clinicProfile.crn || 'Clínica & Consultório';

  // Compute initials
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('');

  return (
    <aside className="hidden lg:flex w-64 bg-white border-r border-slate-200 flex-col h-screen fixed left-0 top-0 z-30 shadow-sm">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-100 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 via-pink-500 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-pink-500/20 shrink-0">
          <Heart className="w-5 h-5 fill-white" />
        </div>
        <div className="min-w-0">
          <h1 className="font-extrabold text-slate-800 text-sm tracking-tight leading-tight">
            NutriPlan Pro
          </h1>
          <p className="text-xs font-bold text-emerald-600 mt-0.5 truncate">
            Gestão Nutricional
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
          Menu Principal
        </div>

        {menuItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-200/60 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={isActive ? 'text-emerald-600' : 'text-slate-400'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>
              {item.badge ? (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100/80 text-emerald-800">
                  {item.badge}
                </span>
              ) : isActive ? (
                <ChevronRight className="w-4 h-4 text-emerald-500 opacity-60" />
              ) : null}
            </button>
          );
        })}
      </nav>

      {/* User Mini Profile & Logout */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center text-xs font-bold shadow-xs shrink-0">
            {initials || 'NC'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-800 truncate" title={displayName}>
              {displayName}
            </p>
            <p className="text-[10px] text-slate-500 truncate">{currentUser?.email || crn}</p>
          </div>
        </div>

        {onLogout && (
          <button
            type="button"
            onClick={onLogout}
            title="Sair da Conta"
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </aside>
  );
};
