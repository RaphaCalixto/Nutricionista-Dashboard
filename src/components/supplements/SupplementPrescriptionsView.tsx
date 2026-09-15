import React, { useState } from 'react';
import {
  Pill,
  Plus,
  Droplet,
  Trash2,
  Edit2,
  Copy,
  Check,
  Sparkles,
  User
} from 'lucide-react';
import { Supplement, Patient } from '../../types';
import { SupplementModal } from '../modals/SupplementModal';
import { calculateWaterRecommendation } from '../../utils/nutritionCalculations';

interface SupplementPrescriptionsViewProps {
  patients: Patient[];
  supplements: Record<string, Supplement[]>;
  onSaveSupplement: (supplement: Supplement) => Promise<void>;
  onDeleteSupplement: (patientId: string, id: string) => Promise<void>;
}

export const SupplementPrescriptionsView: React.FC<SupplementPrescriptionsViewProps> = ({
  patients,
  supplements,
  onSaveSupplement,
  onDeleteSupplement,
}) => {
  const [selectedPatientId, setSelectedPatientId] = useState<string>(
    patients[0]?.id || ''
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [supplementToEdit, setSupplementToEdit] = useState<Supplement | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Water calculator state
  const [calcWeight, setCalcWeight] = useState<number>(70);
  const [calcActivity, setCalcActivity] = useState<'sedentary' | 'light' | 'moderate' | 'intense'>('moderate');

  const currentPatient = patients.find((p) => p.id === selectedPatientId);
  const patientSupplements = supplements[selectedPatientId] || [];
  const calculatedWater = calculateWaterRecommendation(calcWeight, calcActivity);

  const handleCopyPrescription = (sup: Supplement) => {
    const text = `Prescrição Nutricional:\n${sup.name}\nDosagem: ${sup.dosage}\nHorário: ${sup.timing}\nInstruções: ${sup.instructions || 'Conforme orientação'}`;
    navigator.clipboard.writeText(text);
    setCopiedId(sup.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2.5">
            <Pill className="w-6 h-6 text-purple-600" />
            <span>Suplementação & Prescrições Clínicas</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Prescreva fórmulas manipuladas, suplementos e calcule metas de hidratação personalizadas
          </p>
        </div>

        <button
          onClick={() => {
            setSupplementToEdit(null);
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm shadow-emerald-600/20 active:scale-[0.98] transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Prescrição de Suplemento</span>
        </button>
      </div>

      {/* Main Grid: Prescriptions & Water Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Patient Supplements */}
        <div className="lg:col-span-2 space-y-4">
          {/* Patient Selector Filter */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <User className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold text-slate-700">Selecione o Paciente:</span>
            </div>

            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="px-3 py-1.5 text-xs font-bold text-slate-800 rounded-xl border border-slate-300 bg-slate-50 focus:ring-2 focus:ring-emerald-500"
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Supplements List */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-sm">
                Suplementos Prescritos para {currentPatient?.name || 'Paciente'}
              </h3>
              <span className="text-xs text-slate-400 font-medium">
                {patientSupplements.length} itens ativos
              </span>
            </div>

            {patientSupplements.length === 0 ? (
              <div className="text-center py-12 text-slate-400 space-y-2">
                <Pill className="w-8 h-8 mx-auto text-slate-300" />
                <p className="text-xs">Nenhum suplemento prescrito para este paciente ainda.</p>
                <button
                  onClick={() => {
                    setSupplementToEdit(null);
                    setIsModalOpen(true);
                  }}
                  className="px-3.5 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 rounded-xl hover:bg-emerald-100"
                >
                  Prescrever agora
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {patientSupplements.map((sup) => (
                  <div
                    key={sup.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-purple-300 hover:shadow-xs transition-all space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-black text-slate-800 text-sm">{sup.name}</h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                            {sup.dosage}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 font-semibold">
                          Horário: <span className="font-normal text-slate-700">{sup.timing}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleCopyPrescription(sup)}
                          className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 px-2 py-1 rounded-lg transition-colors"
                          title="Copiar texto formatado"
                        >
                          {copiedId === sup.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-600 font-bold">Copiado</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copiar</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setSupplementToEdit(sup);
                            setIsModalOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Remover suplemento ${sup.name}?`)) {
                              onDeleteSupplement(selectedPatientId, sup.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {sup.instructions && (
                      <p className="text-[11px] text-slate-500 italic bg-white p-2.5 rounded-lg border border-slate-100">
                        {sup.instructions}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Water Intake Calculator */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <Droplet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Calculadora de Hidratação</h3>
              <p className="text-[11px] text-slate-400">Recomendação personalizada de água (ml/dia)</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                Peso do Paciente (kg)
              </label>
              <input
                type="number"
                value={calcWeight}
                onChange={(e) => setCalcWeight(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-black text-slate-800"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                Nível de Atividade & Sudorese
              </label>
              <select
                value={calcActivity}
                onChange={(e) => setCalcActivity(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
              >
                <option value="sedentary">Sedentário (35 ml/kg)</option>
                <option value="moderate">Moderado (40 ml/kg)</option>
                <option value="intense">Intenso / Atleta (45 ml/kg)</option>
              </select>
            </div>

            {/* Result Box */}
            <div className="bg-blue-50/80 p-4 rounded-xl border border-blue-200 text-center space-y-1 mt-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                Meta Hídrica Recomendada
              </span>
              <p className="text-3xl font-black text-blue-900">{calculatedWater} ml</p>
              <p className="text-[11px] text-blue-700 font-medium">
                Equivale a ~{Math.round(calculatedWater / 250)} copos de 250ml ou {Math.round(calculatedWater / 500)} garrafinhas de 500ml ao dia.
              </p>
            </div>
          </div>
        </div>
      </div>

      <SupplementModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        patients={patients}
        selectedPatientId={selectedPatientId}
        supplementToEdit={supplementToEdit}
        onSave={onSaveSupplement}
      />
    </div>
  );
};
