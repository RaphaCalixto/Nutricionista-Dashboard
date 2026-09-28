import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Phone,
  Mail,
  User,
  ExternalLink,
  Edit2,
  Trash2,
  UtensilsCrossed,
  Activity,
  ArrowRight,
  Filter
} from 'lucide-react';
import { Patient, PatientGoal } from '../../types';
import { calculateAge } from '../../utils/nutritionCalculations';

interface PatientListViewProps {
  patients: Patient[];
  onSelectPatient: (patient: Patient) => void;
  onNewPatient: () => void;
  onEditPatient: (patient: Patient) => void;
  onDeletePatient: (id: string) => void;
  onOpenDietPlanner: (patient: Patient) => void;
}

const GOAL_LABELS: Record<PatientGoal, { label: string; color: string }> = {
  weight_loss: { label: 'Emagrecimento', color: 'bg-rose-50 text-rose-700 border-rose-200' },
  hypertrophy: { label: 'Hipertrofia', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  maintenance: { label: 'Manutenção', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  health_clinical: { label: 'Saúde Clínica', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  performance: { label: 'Performance', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  pregnancy_lactation: { label: 'Gestação/Lactação', color: 'bg-pink-50 text-pink-700 border-pink-200' },
};

export const PatientListView: React.FC<PatientListViewProps> = ({
  patients,
  onSelectPatient,
  onNewPatient,
  onEditPatient,
  onDeletePatient,
  onOpenDietPlanner,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGoal, setSelectedGoal] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'inactive'>('all');

  const filteredPatients = useMemo(() => {
    return patients.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.phone.includes(searchTerm);

      const matchesGoal = selectedGoal === 'all' || p.goal === selectedGoal;
      const matchesStatus = selectedStatus === 'all' || p.status === selectedStatus;

      return matchesSearch && matchesGoal && matchesStatus;
    });
  }, [patients, searchTerm, selectedGoal, selectedStatus]);

  const handleWhatsApp = (phone: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const cleanPhone = phone.replace(/\D/g, '');
    const phoneWithCountry = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
    const text = encodeURIComponent(`Olá ${name.split(' ')[0]}, tudo bem? Aqui é da clínica de nutrição!`);
    window.open(`https://wa.me/${phoneWithCountry}?text=${text}`, '_blank');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header & Main Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Pacientes & Prontuários</h2>
          <p className="text-xs text-slate-500 mt-1">
            Total de {patients.length} pacientes cadastrados no sistema
          </p>
        </div>

        <button
          onClick={onNewPatient}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm shadow-emerald-600/20 active:scale-[0.98] transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Novo Paciente</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar paciente por nome, telefone ou e-mail..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Status filter */}
          <div className="flex flex-wrap items-center gap-1.5 shrink-0">
            <button
              onClick={() => setSelectedStatus('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                selectedStatus === 'all'
                  ? 'bg-slate-800 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Todos ({patients.length})
            </button>
            <button
              onClick={() => setSelectedStatus('active')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                selectedStatus === 'active'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Ativos ({patients.filter((p) => p.status === 'active').length})
            </button>
            <button
              onClick={() => setSelectedStatus('inactive')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                selectedStatus === 'inactive'
                  ? 'bg-slate-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Inativos
            </button>
          </div>
        </div>

        {/* Goal Filters Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
          <span className="text-slate-400 text-[11px] font-semibold flex items-center gap-1 mr-1 shrink-0">
            <Filter className="w-3 h-3" /> Objetivo:
          </span>
          <button
            onClick={() => setSelectedGoal('all')}
            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
              selectedGoal === 'all'
                ? 'bg-emerald-100 text-emerald-800 font-bold border border-emerald-300'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/80'
            }`}
          >
            Todos
          </button>
          {Object.entries(GOAL_LABELS).map(([key, item]) => (
            <button
              key={key}
              onClick={() => setSelectedGoal(key)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                selectedGoal === key
                  ? 'bg-emerald-600 text-white font-bold shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Patient Cards Grid */}
      {filteredPatients.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <User className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-700 text-sm">Nenhum paciente encontrado</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Tente mudar os termos da busca ou cadastre um novo paciente para começar.
          </p>
          <button
            onClick={onNewPatient}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors border border-emerald-200"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Cadastrar Paciente</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPatients.map((patient) => {
            const age = calculateAge(patient.birthDate);
            const goalInfo = GOAL_LABELS[patient.goal] || {
              label: patient.goal,
              color: 'bg-slate-50 text-slate-700 border-slate-200',
            };

            return (
              <div
                key={patient.id}
                onClick={() => onSelectPatient(patient)}
                className="bg-white rounded-2xl border border-slate-200 hover:border-emerald-400 hover:shadow-md transition-all duration-200 p-5 flex flex-col justify-between cursor-pointer group relative overflow-hidden"
              >
                {/* Top colored indicator */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1 ${
                    patient.status === 'active' ? 'bg-emerald-500' : 'bg-slate-300'
                  }`}
                />

                <div>
                  {/* Patient Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      {patient.photoUrl ? (
                        <img
                          src={patient.photoUrl}
                          alt={patient.name}
                          className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shadow-xs"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-100 to-teal-100 text-emerald-800 font-bold text-base flex items-center justify-center border border-emerald-200/80">
                          {patient.name
                            .split(' ')
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join('')}
                        </div>
                      )}
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm group-hover:text-emerald-700 transition-colors line-clamp-1">
                          {patient.name}
                        </h4>
                        <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <span>{age} anos</span>
                          <span>•</span>
                          <span>{patient.gender === 'male' ? 'Masc' : 'Fem'}</span>
                          {patient.occupation && (
                            <>
                              <span>•</span>
                              <span className="truncate max-w-[80px]">{patient.occupation}</span>
                            </>
                          )}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${goalInfo.color}`}
                    >
                      {goalInfo.label}
                    </span>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-1.5 text-xs text-slate-500 my-3.5 bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-mono text-slate-700">{patient.phone}</span>
                      </div>
                      <button
                        onClick={(e) => handleWhatsApp(patient.phone, patient.name, e)}
                        className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 hover:underline flex items-center gap-1"
                      >
                        <span>WhatsApp</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>

                    {patient.email && (
                      <div className="flex items-center gap-2 truncate">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate text-slate-600">{patient.email}</span>
                      </div>
                    )}
                  </div>

                  {/* Notes snippet */}
                  {patient.notes && (
                    <p className="text-xs text-slate-500 line-clamp-2 italic mb-3">
                      "{patient.notes}"
                    </p>
                  )}
                </div>

                {/* Card Footer Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenDietPlanner(patient);
                      }}
                      className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                      title="Montar Dieta"
                    >
                      <UtensilsCrossed className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditPatient(patient);
                      }}
                      className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Editar dados"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Deseja realmente remover o paciente ${patient.name}?`)) {
                          onDeletePatient(patient.id);
                        }
                      }}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Excluir paciente"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => onSelectPatient(patient)}
                    className="flex items-center gap-1 text-xs font-bold text-emerald-600 group-hover:text-emerald-700"
                  >
                    <span>Ver Prontuário</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
