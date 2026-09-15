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
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-20 px-6 flex items-center justify-between shadow-2xs">
      {/* Date & Subtitle */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-slate-600 bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-lg text-xs font-medium">
          <CalendarIcon className="w-3.5 h-3.5 text-emerald-600" />
          <span>{capitalizedDate}</span>
        </div>

        <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-500 bg-emerald-50/80 text-emerald-700 px-2.5 py-1 rounded-md border border-emerald-200/60 font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Nutrição Clínica & Esportiva</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={onNewAppointment}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 hover:border-slate-400 rounded-xl transition-all shadow-xs"
        >
          <CalendarIcon className="w-3.5 h-3.5 text-slate-500" />
          <span>Nova Consulta</span>
        </button>

        <button
          onClick={onNewPatient}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] rounded-xl transition-all shadow-sm shadow-emerald-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Paciente</span>
        </button>
      </div>
    </header>
  );
};
