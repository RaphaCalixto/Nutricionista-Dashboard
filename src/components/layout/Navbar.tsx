import React from 'react';
import { Plus, Calendar as CalendarIcon, ShieldCheck } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface NavbarProps {
  onNewPatient: () => void;
  onNewAppointment: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onNewPatient,
  onNewAppointment,
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

        <div className="hidden lg:flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50/80 px-2.5 py-1 rounded-md border border-emerald-200/60 font-semibold shrink-0">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Nutrição Clínica & Esportiva</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-auto">
        <button
          onClick={onNewAppointment}
          className="flex items-center gap-1.5 px-3 sm:px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 hover:border-slate-400 rounded-xl transition-all shadow-xs shrink-0"
        >
          <CalendarIcon className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span className="whitespace-nowrap">Nova Consulta</span>
        </button>

        <button
          onClick={onNewPatient}
          className="hidden sm:flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] rounded-xl transition-all shadow-sm shadow-emerald-600/20 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Paciente</span>
        </button>
      </div>
    </header>
  );
};
