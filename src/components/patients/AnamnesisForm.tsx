import React, { useState, useEffect } from 'react';
import {
  FileText,
  HeartPulse,
  Activity,
  Utensils,
  Save,
  CheckCircle2,
  AlertCircle,
  Clock,
  Droplet
} from 'lucide-react';
import { Anamnesis, Patient } from '../../types';

interface AnamnesisFormProps {
  patient: Patient;
  initialAnamnesis: Anamnesis | null;
  onSave: (anamnesis: Anamnesis) => Promise<void>;
}

export const AnamnesisForm: React.FC<AnamnesisFormProps> = ({
  patient,
  initialAnamnesis,
  onSave,
}) => {
  const [mainComplaint, setMainComplaint] = useState('');
  // Clinical
  const [pathologies, setPathologies] = useState<string>('');
  const [familyHistory, setFamilyHistory] = useState<string>('');
  const [medications, setMedications] = useState('');
  const [surgeries, setSurgeries] = useState('');
  const [bowelHabits, setBowelHabits] = useState('Regular (1x ao dia)');

  // Lifestyle
  const [sleepHours, setSleepHours] = useState<number>(7);
  const [stressLevel, setStressLevel] = useState<'low' | 'moderate' | 'high'>('moderate');
  const [smoking, setSmoking] = useState(false);
  const [alcohol, setAlcohol] = useState('Não consome');
  const [physicalActivity, setPhysicalActivity] = useState('');
  const [activityFrequency, setActivityFrequency] = useState('');

  // Dietary
  const [waterIntakeMl, setWaterIntakeMl] = useState<number>(2000);
  const [preferredFoods, setPreferredFoods] = useState('');
  const [dislikedFoods, setDislikedFoods] = useState('');
  const [allergies, setAllergies] = useState<string>('');
  const [foodIntolerances, setFoodIntolerances] = useState<string>('');
  const [appetite, setAppetite] = useState('Normal');
  const [recall24h, setRecall24h] = useState('');
  const [weekendHabits, setWeekendHabits] = useState('');

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (initialAnamnesis) {
      setMainComplaint(initialAnamnesis.mainComplaint || '');
      setPathologies(initialAnamnesis.clinicalHistory?.pathologies?.join(', ') || '');
      setFamilyHistory(initialAnamnesis.clinicalHistory?.familyHistory?.join(', ') || '');
      setMedications(initialAnamnesis.clinicalHistory?.medications || '');
      setSurgeries(initialAnamnesis.clinicalHistory?.surgeries || '');
      setBowelHabits(initialAnamnesis.clinicalHistory?.bowelHabits || 'Regular (1x ao dia)');

      setSleepHours(initialAnamnesis.lifestyle?.sleepHours || 7);
      setStressLevel(initialAnamnesis.lifestyle?.stressLevel || 'moderate');
      setSmoking(Boolean(initialAnamnesis.lifestyle?.smoking));
      setAlcohol(initialAnamnesis.lifestyle?.alcohol || 'Não consome');
      setPhysicalActivity(initialAnamnesis.lifestyle?.physicalActivity || '');
      setActivityFrequency(initialAnamnesis.lifestyle?.activityFrequency || '');

      setWaterIntakeMl(initialAnamnesis.dietaryHistory?.waterIntakeMl || 2000);
      setPreferredFoods(initialAnamnesis.dietaryHistory?.preferredFoods || '');
      setDislikedFoods(initialAnamnesis.dietaryHistory?.dislikedFoods || '');
      setAllergies(initialAnamnesis.dietaryHistory?.allergies?.join(', ') || '');
      setFoodIntolerances(initialAnamnesis.dietaryHistory?.foodIntolerances?.join(', ') || '');
      setAppetite(initialAnamnesis.dietaryHistory?.appetite || 'Normal');
      setRecall24h(initialAnamnesis.dietaryHistory?.recall24h || '');
      setWeekendHabits(initialAnamnesis.dietaryHistory?.weekendHabits || '');
    }
  }, [initialAnamnesis]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      const data: Anamnesis = {
        id: initialAnamnesis?.id || `anam-${Date.now()}`,
        patientId: patient.id,
        mainComplaint,
        clinicalHistory: {
          pathologies: pathologies.split(',').map((s) => s.trim()).filter(Boolean),
          familyHistory: familyHistory.split(',').map((s) => s.trim()).filter(Boolean),
          medications,
          surgeries,
          bowelHabits,
        },
        lifestyle: {
          sleepHours,
          stressLevel,
          smoking,
          alcohol,
          physicalActivity,
          activityFrequency,
        },
        dietaryHistory: {
          waterIntakeMl,
          preferredFoods,
          dislikedFoods,
          allergies: allergies.split(',').map((s) => s.trim()).filter(Boolean),
          foodIntolerances: foodIntolerances.split(',').map((s) => s.trim()).filter(Boolean),
          appetite,
          recall24h,
          weekendHabits,
        },
        updatedAt: new Date().toISOString(),
      };

      await onSave(data);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Save action top bar */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600" />
            <span>Anamnese Clínica & Nutricional</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Histórico de saúde, hábitos cotidianos e preferências alimentares de {patient.name}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {savedSuccess && (
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 animate-fade-in">
              <CheckCircle2 className="w-4 h-4" />
              <span>Anamnese salva!</span>
            </span>
          )}
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-xs font-bold rounded-xl shadow-sm shadow-emerald-600/20 transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Salvando...' : 'Salvar Anamnese'}</span>
          </button>
        </div>
      </div>

      {/* 1. Queixa Principal & Objetivos */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>1. Queixa Principal & Motivo da Consulta</span>
        </h4>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
            Motivo do Atendimento / Queixa do Paciente
          </label>
          <textarea
            rows={3}
            value={mainComplaint}
            onChange={(e) => setMainComplaint(e.target.value)}
            placeholder="Ex: Busca emagrecimento após gestação, queixa de distensão abdominal frequente e falta de energia nos treinos matinais..."
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* 2. Histórico Clínico & Medicamentoso */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
          <HeartPulse className="w-4 h-4 text-rose-500" />
          <span>2. Histórico Clínico, Patologias & Medicamentos</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Patologias / Diagnósticos Prévios (separar por vírgula)
            </label>
            <input
              type="text"
              value={pathologies}
              onChange={(e) => setPathologies(e.target.value)}
              placeholder="Ex: Hipertensão, Diabetes Tipo 2, Hipotireoidismo, Gastrite"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Histórico Familiar de Doenças
            </label>
            <input
              type="text"
              value={familyHistory}
              onChange={(e) => setFamilyHistory(e.target.value)}
              placeholder="Ex: Pai com infarto aos 50 anos, mãe diabética"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Medicamentos em Uso Contínuo
            </label>
            <input
              type="text"
              value={medications}
              onChange={(e) => setMedications(e.target.value)}
              placeholder="Ex: Levotiroxina 50mcg em jejum, Losartana 50mg"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Hábito Intestinal / Evacuação
            </label>
            <input
              type="text"
              value={bowelHabits}
              onChange={(e) => setBowelHabits(e.target.value)}
              placeholder="Ex: Regular diário (Escala Bristol 3-4), Constipado (a cada 3 dias)"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
          </div>
        </div>
      </div>

      {/* 3. Estilo de Vida & Atividade Física */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
          <Activity className="w-4 h-4 text-blue-500" />
          <span>3. Estilo de Vida, Sono & Atividade Física</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Horas de Sono por Noite
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={3}
                max={14}
                value={sleepHours}
                onChange={(e) => setSleepHours(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
              <span className="text-xs text-slate-500">horas</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Nível de Estresse
            </label>
            <select
              value={stressLevel}
              onChange={(e) => setStressLevel(e.target.value as any)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-white"
            >
              <option value="low">Baixo (Tranquilo)</option>
              <option value="moderate">Moderado</option>
              <option value="high">Elevado / Ansiedade</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Consumo de Álcool
            </label>
            <input
              type="text"
              value={alcohol}
              onChange={(e) => setAlcohol(e.target.value)}
              placeholder="Ex: 2 latinhas de cerveja no fim de semana"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Atividade Física Praticada
            </label>
            <input
              type="text"
              value={physicalActivity}
              onChange={(e) => setPhysicalActivity(e.target.value)}
              placeholder="Ex: Musculação, Corrida, Natação, Crossfit, Nenhuma"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Frequência e Horário do Treino
            </label>
            <input
              type="text"
              value={activityFrequency}
              onChange={(e) => setActivityFrequency(e.target.value)}
              placeholder="Ex: 4x por semana às 18:30 (duração 1h)"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
          </div>
        </div>
      </div>

      {/* 4. Hábitos Alimentares, Preferências & Recordatório */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
          <Utensils className="w-4 h-4 text-emerald-600" />
          <span>4. Preferências Alimentares, Alergias & Recordatório 24h</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1 flex items-center gap-1">
              <Droplet className="w-3.5 h-3.5 text-blue-500" />
              <span>Consumo Médio de Água Atual (ml/dia)</span>
            </label>
            <input
              type="number"
              step={100}
              value={waterIntakeMl}
              onChange={(e) => setWaterIntakeMl(Number(e.target.value))}
              placeholder="Ex: 1500"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Comportamento do Apetite
            </label>
            <input
              type="text"
              value={appetite}
              onChange={(e) => setAppetite(e.target.value)}
              placeholder="Ex: Mais fome no fim de tarde, compulsão por doces à noite"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Alimentos Favoritos / Gosta muito
            </label>
            <textarea
              rows={2}
              value={preferredFoods}
              onChange={(e) => setPreferredFoods(e.target.value)}
              placeholder="Ex: Ovos, frutas vermelhas, café com leite, queijo minas, pasta de amendoim"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Aversões / Não Consome de jeito nenhum
            </label>
            <textarea
              rows={2}
              value={dislikedFoods}
              onChange={(e) => setDislikedFoods(e.target.value)}
              placeholder="Ex: Coentro, fígado, berinjela, quiabo"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1 text-rose-700">
              Alergias Alimentares Diagnosticadas
            </label>
            <input
              type="text"
              value={allergies}
              onChange={(e) => setAllergies(e.target.value)}
              placeholder="Ex: Camarão, Frutos do mar, Amendoim"
              className="w-full px-3 py-2 text-xs rounded-xl border border-rose-200 bg-rose-50/30 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1 text-amber-700">
              Intolerâncias ou Desconfortos Digestivos
            </label>
            <input
              type="text"
              value={foodIntolerances}
              onChange={(e) => setFoodIntolerances(e.target.value)}
              placeholder="Ex: Intolerância à lactose, Sensibilidade ao glúten"
              className="w-full px-3 py-2 text-xs rounded-xl border border-amber-200 bg-amber-50/30 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
            Recordatório Alimentar Habitual (24 Horas)
          </label>
          <textarea
            rows={3}
            value={recall24h}
            onChange={(e) => setRecall24h(e.target.value)}
            placeholder="Descreva o que o paciente consome tipicamente no dia a dia: Café, Almoço, Lanches e Jantar..."
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
            Rotina e Exceções nos Fins de Semana
          </label>
          <textarea
            rows={2}
            value={weekendHabits}
            onChange={(e) => setWeekendHabits(e.target.value)}
            placeholder="Ex: Almoço em família aos domingos, consome pizza ou hambúrguer no sábado à noite..."
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none"
          />
        </div>
      </div>
    </form>
  );
};
