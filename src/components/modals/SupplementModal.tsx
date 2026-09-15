import React, { useState, useEffect } from 'react';
import { X, Pill, Plus, Check } from 'lucide-react';
import { Supplement, Patient } from '../../types';

interface SupplementModalProps {
  isOpen: boolean;
  onClose: () => void;
  patients: Patient[];
  selectedPatientId?: string;
  supplementToEdit?: Supplement | null;
  onSave: (supplement: Supplement) => Promise<void>;
}

export const SupplementModal: React.FC<SupplementModalProps> = ({
  isOpen,
  onClose,
  patients,
  selectedPatientId: initialPatientId,
  supplementToEdit,
  onSave,
}) => {
  const [patientId, setPatientId] = useState(initialPatientId || (patients[0]?.id || ''));
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [timing, setTiming] = useState('Manhã em jejum');
  const [instructions, setInstructions] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (supplementToEdit) {
      setPatientId(supplementToEdit.patientId);
      setName(supplementToEdit.name);
      setDosage(supplementToEdit.dosage);
      setTiming(supplementToEdit.timing);
      setInstructions(supplementToEdit.instructions);
    } else {
      setPatientId(initialPatientId || (patients[0]?.id || ''));
      setName('');
      setDosage('');
      setTiming('Após o café da manhã');
      setInstructions('');
    }
  }, [supplementToEdit, initialPatientId, isOpen, patients]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !dosage.trim() || !patientId) return;

    setSaving(true);
    try {
      const data: Supplement = {
        id: supplementToEdit?.id || `sup-${Date.now()}`,
        patientId,
        name: name.trim(),
        dosage: dosage.trim(),
        timing: timing.trim(),
        instructions: instructions.trim(),
        active: true,
        createdAt: supplementToEdit?.createdAt || new Date().toISOString(),
      };
      await onSave(data);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">Prescrição de Suplemento</h3>
              <p className="text-xs text-slate-500">Adicione fitoterápicos, vitaminas ou suplementos esportivos</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Paciente *
            </label>
            <select
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-bold text-slate-800"
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Nome do Suplemento / Manipulado *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Creatina Monohidratada 100% Pura, Ômega 3 EPA/DHA, Coenzima Q10"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 font-semibold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Dosagem / Posologia *
              </label>
              <input
                type="text"
                required
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                placeholder="Ex: 5g ao dia, 1 cápsula 500mg"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Horário / Momento de Tomada
              </label>
              <input
                type="text"
                value={timing}
                onChange={(e) => setTiming(e.target.value)}
                placeholder="Ex: Após o almoço, 30 min antes do treino"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Instruções de Uso / Recomendações Farmacêuticas
            </label>
            <textarea
              rows={3}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Ex: Tomar com bastante água junto a uma refeição contendo gorduras boas. Uso diário contínuo..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 resize-none"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] rounded-xl shadow-xs flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{saving ? 'Salvando...' : 'Salvar Prescrição'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
