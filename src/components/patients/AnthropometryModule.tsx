import React, { useState, useMemo } from 'react';
import {
  Activity,
  Plus,
  TrendingDown,
  TrendingUp,
  Scale,
  Ruler,
  Percent,
  Calendar,
  Trash2,
  Check,
  ChevronDown,
  ChevronUp,
  Info,
  Edit2,
  X
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Patient, Anthropometry } from '../../types';
import {
  calculateBMI,
  calculateWHR,
  calculateBodyFatPollock3,
  calculateAge
} from '../../utils/nutritionCalculations';

interface AnthropometryModuleProps {
  patient: Patient;
  assessments: Anthropometry[];
  onAddAssessment: (data: Anthropometry) => Promise<void>;
  onDeleteAssessment: (id: string) => Promise<void>;
}

export const AnthropometryModule: React.FC<AnthropometryModuleProps> = ({
  patient,
  assessments,
  onAddAssessment,
  onDeleteAssessment,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAssessmentId, setEditingAssessmentId] = useState<string | null>(null);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [weight, setWeight] = useState<number>(68);
  const [height, setHeight] = useState<number>(165);
  // Circumferences
  const [waist, setWaist] = useState<number | undefined>(76);
  const [abdomen, setAbdomen] = useState<number | undefined>(84);
  const [hip, setHip] = useState<number | undefined>(102);
  const [armRelaxed, setArmRelaxed] = useState<number | undefined>(28);
  const [armContracted, setArmContracted] = useState<number | undefined>(29.5);
  const [thigh, setThigh] = useState<number | undefined>(57);
  const [chest, setChest] = useState<number | undefined>(undefined);
  const [calf, setCalf] = useState<number | undefined>(undefined);
  // Skinfolds
  const [skinfoldTriceps, setSkinfoldTriceps] = useState<number | undefined>(20);
  const [skinfoldSubscapular, setSkinfoldSubscapular] = useState<number | undefined>(16);
  const [skinfoldSuprailiac, setSkinfoldSuprailiac] = useState<number | undefined>(22);
  const [skinfoldAbdominal, setSkinfoldAbdominal] = useState<number | undefined>(24);
  const [skinfoldThigh, setSkinfoldThigh] = useState<number | undefined>(26);
  const [skinfoldChest, setSkinfoldChest] = useState<number | undefined>(undefined);
  const [protocol, setProtocol] = useState<'pollock_3' | 'pollock_7' | 'faulkner' | 'bioimpedance' | 'manual'>('pollock_3');
  const [manualFatPercent, setManualFatPercent] = useState<number | undefined>(undefined);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  // Latest assessment
  const latestAssessment = assessments[assessments.length - 1];
  const previousAssessment = assessments.length > 1 ? assessments[assessments.length - 2] : null;

  // Real-time calculations for form
  const age = calculateAge(patient.birthDate);
  const currentBMI = calculateBMI(weight, height);
  const currentWHR = calculateWHR(waist || 0, hip || 0, patient.gender);

  // Calculated body fat
  const calculatedFatPercent = useMemo(() => {
    if (protocol === 'bioimpedance' || protocol === 'manual') {
      return manualFatPercent || 0;
    }
    // Pollock 3: Homens = Peito + Abdômen + Coxa; Mulheres = Tríceps + Supra-ilíaca + Coxa
    let sum = 0;
    if (patient.gender === 'male') {
      sum = (skinfoldChest || 0) + (skinfoldAbdominal || 0) + (skinfoldThigh || 0);
    } else {
      sum = (skinfoldTriceps || 0) + (skinfoldSuprailiac || 0) + (skinfoldThigh || 0);
    }
    return sum > 0 ? calculateBodyFatPollock3(patient.gender, age, sum) : 0;
  }, [protocol, manualFatPercent, skinfoldChest, skinfoldAbdominal, skinfoldThigh, skinfoldTriceps, skinfoldSuprailiac, patient.gender, age]);

  // Open New Assessment
  const handleOpenNew = () => {
    setEditingAssessmentId(null);
    setDate(new Date().toISOString().split('T')[0]);
    if (latestAssessment) {
      setWeight(latestAssessment.weight);
      setHeight(latestAssessment.height);
      setWaist(latestAssessment.waist);
      setAbdomen(latestAssessment.abdomen);
      setHip(latestAssessment.hip);
      setArmRelaxed(latestAssessment.armRelaxed);
      setArmContracted(latestAssessment.armContracted);
      setThigh(latestAssessment.thigh);
      setChest(latestAssessment.chest);
      setCalf(latestAssessment.calf);
      setSkinfoldTriceps(latestAssessment.skinfoldTriceps);
      setSkinfoldSubscapular(latestAssessment.skinfoldSubscapular);
      setSkinfoldSuprailiac(latestAssessment.skinfoldSuprailiac);
      setSkinfoldAbdominal(latestAssessment.skinfoldAbdominal);
      setSkinfoldThigh(latestAssessment.skinfoldThigh);
      setSkinfoldChest(latestAssessment.skinfoldChest);
      setProtocol(latestAssessment.protocol || 'pollock_3');
    }
    setNotes('');
    setShowAddForm(!showAddForm);
  };

  // Open Edit Assessment
  const handleStartEdit = (a: Anthropometry) => {
    setEditingAssessmentId(a.id);
    setDate(a.date);
    setWeight(a.weight);
    setHeight(a.height);
    setWaist(a.waist);
    setAbdomen(a.abdomen);
    setHip(a.hip);
    setArmRelaxed(a.armRelaxed);
    setArmContracted(a.armContracted);
    setThigh(a.thigh);
    setChest(a.chest);
    setCalf(a.calf);
    setSkinfoldTriceps(a.skinfoldTriceps);
    setSkinfoldSubscapular(a.skinfoldSubscapular);
    setSkinfoldSuprailiac(a.skinfoldSuprailiac);
    setSkinfoldAbdominal(a.skinfoldAbdominal);
    setSkinfoldThigh(a.skinfoldThigh);
    setSkinfoldChest(a.skinfoldChest);
    setProtocol(a.protocol || 'pollock_3');
    setManualFatPercent(a.bodyFatPercentage);
    setNotes(a.notes || '');
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingAssessmentId(null);
    setShowAddForm(false);
    setNotes('');
  };

  // Chart data formatted
  const chartData = useMemo(() => {
    return assessments.map((a) => {
      let formattedDate = a.date;
      try {
        const [y, m, d] = a.date.split('-');
        formattedDate = `${d}/${m}`;
      } catch (e) {}

      return {
        date: formattedDate,
        fullDate: a.date,
        weight: a.weight,
        bmi: a.bmi,
        fatPercent: a.bodyFatPercentage || null,
        fatMass: a.fatMassKg || null,
        leanMass: a.leanMassKg || null,
        waist: a.waist || null,
        abdomen: a.abdomen || null,
        hip: a.hip || null,
        arm: a.armContracted || a.armRelaxed || null,
        thigh: a.thigh || null,
      };
    });
  }, [assessments]);

  const handleSaveAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weight || !height) return;

    setSaving(true);
    try {
      const fatPct = calculatedFatPercent > 0 ? calculatedFatPercent : undefined;
      const fatMassKg = fatPct ? Math.round(((weight * fatPct) / 100) * 10) / 10 : undefined;
      const leanMassKg = fatMassKg ? Math.round((weight - fatMassKg) * 10) / 10 : undefined;

      const assessmentData: Anthropometry = {
        id: editingAssessmentId || `anthro-${Date.now()}`,
        patientId: patient.id,
        date,
        weight: Number(weight),
        height: Number(height),
        bmi: currentBMI.bmi,
        bodyFatPercentage: fatPct,
        fatMassKg,
        leanMassKg,
        waist: waist ? Number(waist) : undefined,
        abdomen: abdomen ? Number(abdomen) : undefined,
        hip: hip ? Number(hip) : undefined,
        armRelaxed: armRelaxed ? Number(armRelaxed) : undefined,
        armContracted: armContracted ? Number(armContracted) : undefined,
        thigh: thigh ? Number(thigh) : undefined,
        chest: chest ? Number(chest) : undefined,
        calf: calf ? Number(calf) : undefined,
        skinfoldTriceps: skinfoldTriceps ? Number(skinfoldTriceps) : undefined,
        skinfoldSubscapular: skinfoldSubscapular ? Number(skinfoldSubscapular) : undefined,
        skinfoldSuprailiac: skinfoldSuprailiac ? Number(skinfoldSuprailiac) : undefined,
        skinfoldAbdominal: skinfoldAbdominal ? Number(skinfoldAbdominal) : undefined,
        skinfoldThigh: skinfoldThigh ? Number(skinfoldThigh) : undefined,
        skinfoldChest: skinfoldChest ? Number(skinfoldChest) : undefined,
        protocol,
        notes: notes.trim() || undefined,
      };

      await onAddAssessment(assessmentData);
      setShowAddForm(false);
      setEditingAssessmentId(null);
      setNotes('');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Quick Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
            <Scale className="w-5 h-5 text-emerald-600" />
            <span>Avaliação Antropométrica & Composição Corporal</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Histórico temporal de medidas, dobras cutâneas e gráficos de evolução
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-xs font-bold rounded-xl shadow-sm shadow-emerald-600/20 transition-all cursor-pointer"
        >
          {showAddForm && !editingAssessmentId ? <ChevronUp className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          <span>{showAddForm && !editingAssessmentId ? 'Fechar Formulário' : 'Nova Avaliação Física'}</span>
        </button>
      </div>

      {/* KPI Cards: Current Status & Progress */}
      {latestAssessment && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {/* Weight */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider">Peso Atual</span>
              <Scale className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-800">{latestAssessment.weight}</span>
              <span className="text-xs font-bold text-slate-400">kg</span>
            </div>
            {previousAssessment && (
              <div className="mt-2 flex items-center gap-1 text-[11px] font-semibold">
                {latestAssessment.weight < previousAssessment.weight ? (
                  <span className="text-emerald-600 flex items-center gap-0.5">
                    <TrendingDown className="w-3.5 h-3.5" />
                    <span>{(previousAssessment.weight - latestAssessment.weight).toFixed(1)}kg</span>
                  </span>
                ) : (
                  <span className="text-blue-600 flex items-center gap-0.5">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>+{(latestAssessment.weight - previousAssessment.weight).toFixed(1)}kg</span>
                  </span>
                )}
                <span className="text-slate-400 font-normal">desde a última</span>
              </div>
            )}
          </div>

          {/* BMI */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider">IMC</span>
              <Ruler className="w-4 h-4 text-teal-600" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-800">{latestAssessment.bmi}</span>
              <span className="text-xs font-bold text-slate-400">kg/m²</span>
            </div>
            <div className="mt-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                {calculateBMI(latestAssessment.weight, latestAssessment.height).classification}
              </span>
            </div>
          </div>

          {/* Body Fat */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider">% Gordura</span>
              <Percent className="w-4 h-4 text-amber-500" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-800">
                {latestAssessment.bodyFatPercentage ? `${latestAssessment.bodyFatPercentage}%` : '--'}
              </span>
            </div>
            {latestAssessment.fatMassKg && latestAssessment.leanMassKg && (
              <p className="mt-2 text-[11px] text-slate-500 font-medium">
                Massa Magra: <strong className="text-slate-700">{latestAssessment.leanMassKg}kg</strong>
              </p>
            )}
          </div>

          {/* Abdomen / Waist */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider">Abdômen</span>
              <Activity className="w-4 h-4 text-rose-500" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-800">
                {latestAssessment.abdomen || latestAssessment.waist || '--'}
              </span>
              <span className="text-xs font-bold text-slate-400">cm</span>
            </div>
            {previousAssessment && (previousAssessment.abdomen || previousAssessment.waist) && (
              <p className="mt-2 text-[11px] text-emerald-600 font-semibold flex items-center gap-0.5">
                <TrendingDown className="w-3.5 h-3.5" />
                <span>
                  {(
                    (previousAssessment.abdomen || previousAssessment.waist || 0) -
                    (latestAssessment.abdomen || latestAssessment.waist || 0)
                  ).toFixed(1)}
                  cm de redução
                </span>
              </p>
            )}
          </div>
        </div>
      )}

      {/* Add / Edit Assessment Form Collapsible */}
      {showAddForm && (
        <form
          onSubmit={handleSaveAssessment}
          className="bg-white p-6 rounded-2xl border-2 border-emerald-500 shadow-lg space-y-6 animate-in slide-in-from-top-4 duration-200"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              {editingAssessmentId ? <Edit2 className="w-4 h-4 text-emerald-600" /> : <Plus className="w-4 h-4 text-emerald-600" />}
              <span>{editingAssessmentId ? `Editar Avaliação Física (${date})` : 'Registrar Nova Avaliação Antropométrica'}</span>
            </h4>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Paciente: {patient.name}</span>
              {editingAssessmentId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
                  title="Cancelar Edição"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Dados Gerais: Data, Peso, Altura */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Data da Avaliação *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Peso Atual (kg) *
              </label>
              <input
                type="number"
                step="0.1"
                required
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Estatura / Altura (cm) *
              </label>
              <input
                type="number"
                step="0.5"
                required
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 font-bold"
              />
            </div>
          </div>

          {/* Real-time Calculated Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <span className="text-[11px] text-slate-500 font-medium">IMC Calculado:</span>
              <p className="font-bold text-slate-800 text-sm">
                {currentBMI.bmi} kg/m²{' '}
                <span className="text-xs font-semibold text-emerald-700">({currentBMI.classification})</span>
              </p>
            </div>

            <div>
              <span className="text-[11px] text-slate-500 font-medium">Relação Cintura-Quadril:</span>
              <p className="font-bold text-slate-800 text-sm">
                {currentWHR ? `${currentWHR.ratio} (${currentWHR.risk})` : 'Preencha cintura e quadril'}
              </p>
            </div>

            <div>
              <span className="text-[11px] text-slate-500 font-medium">% Gordura Calculado:</span>
              <p className="font-bold text-amber-600 text-sm">
                {calculatedFatPercent > 0 ? `${calculatedFatPercent}%` : '--'}
              </p>
            </div>
          </div>

          {/* Perímetros e Circunferências (cm) */}
          <div className="space-y-3">
            <h5 className="font-bold text-slate-700 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-600" />
              <span>Perímetros Corporais (cm)</span>
            </h5>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Cintura (menor curvatura)</label>
                <input
                  type="number"
                  step="0.5"
                  value={waist || ''}
                  onChange={(e) => setWaist(e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="Ex: 78"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Abdômen (cicatriz umbilical)</label>
                <input
                  type="number"
                  step="0.5"
                  value={abdomen || ''}
                  onChange={(e) => setAbdomen(e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="Ex: 86"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Quadril (maior perímetro)</label>
                <input
                  type="number"
                  step="0.5"
                  value={hip || ''}
                  onChange={(e) => setHip(e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="Ex: 104"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Braço Relaxado</label>
                <input
                  type="number"
                  step="0.5"
                  value={armRelaxed || ''}
                  onChange={(e) => setArmRelaxed(e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="Ex: 29"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Braço Contraído</label>
                <input
                  type="number"
                  step="0.5"
                  value={armContracted || ''}
                  onChange={(e) => setArmContracted(e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="Ex: 31"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Coxa Medial</label>
                <input
                  type="number"
                  step="0.5"
                  value={thigh || ''}
                  onChange={(e) => setThigh(e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="Ex: 58"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Tórax / Peitoral</label>
                <input
                  type="number"
                  step="0.5"
                  value={chest || ''}
                  onChange={(e) => setChest(e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="Ex: 95"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Panturrilha</label>
                <input
                  type="number"
                  step="0.5"
                  value={calf || ''}
                  onChange={(e) => setCalf(e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="Ex: 36"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Protocolo & Dobras Cutâneas (mm) */}
          <div className="space-y-3 bg-amber-50/40 p-4 rounded-xl border border-amber-200/60">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h5 className="font-bold text-amber-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Percent className="w-3.5 h-3.5 text-amber-600" />
                <span>Composição Corporal & Dobras Cutâneas (mm)</span>
              </h5>

              <select
                value={protocol}
                onChange={(e) => setProtocol(e.target.value as any)}
                className="text-xs px-2.5 py-1 rounded-lg border border-amber-300 bg-white font-semibold text-amber-900"
              >
                <option value="pollock_3">Protocolo Pollock 3 Dobras (Padrão Ouro)</option>
                <option value="bioimpedance">Bioimpedância / Manual</option>
                <option value="manual">% Gordura Direto (Manual)</option>
              </select>
            </div>

            {protocol === 'bioimpedance' || protocol === 'manual' ? (
              <div className="max-w-xs">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  % de Gordura Corporal ({protocol === 'bioimpedance' ? 'BIA' : 'Manual'})
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={manualFatPercent || ''}
                  onChange={(e) => setManualFatPercent(e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="Ex: 18.5"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-bold"
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 pt-1">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">
                    Tríceps {patient.gender === 'female' && <strong className="text-amber-700">*</strong>}
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={skinfoldTriceps || ''}
                    onChange={(e) => setSkinfoldTriceps(e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="mm"
                    className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">
                    Supra-ilíaca {patient.gender === 'female' && <strong className="text-amber-700">*</strong>}
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={skinfoldSuprailiac || ''}
                    onChange={(e) => setSkinfoldSuprailiac(e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="mm"
                    className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">
                    Coxa Medial <strong className="text-amber-700">*</strong>
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={skinfoldThigh || ''}
                    onChange={(e) => setSkinfoldThigh(e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="mm"
                    className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">
                    Abdômen {patient.gender === 'male' && <strong className="text-amber-700">*</strong>}
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={skinfoldAbdominal || ''}
                    onChange={(e) => setSkinfoldAbdominal(e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="mm"
                    className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">
                    Peitoral {patient.gender === 'male' && <strong className="text-amber-700">*</strong>}
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={skinfoldChest || ''}
                    onChange={(e) => setSkinfoldChest(e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="mm"
                    className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">Subescapular</label>
                  <input
                    type="number"
                    step="0.5"
                    value={skinfoldSubscapular || ''}
                    onChange={(e) => setSkinfoldSubscapular(e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="mm"
                    className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Anotações da avaliação */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Observações da Avaliação
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Paciente relata boa aderência, retenção hídrica reduzida..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={handleCancelEdit}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{saving ? 'Salvando...' : editingAssessmentId ? 'Salvar Alterações da Avaliação' : 'Salvar Avaliação Física'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Evolution Charts */}
      {chartData.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Weight & Lean Mass Evolution */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <h4 className="font-bold text-slate-800 text-sm mb-4 flex items-center justify-between">
              <span>Evolução de Peso & Massa (kg)</span>
              <span className="text-[11px] font-normal text-slate-400">{assessments.length} avaliações</span>
            </h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis domain={['dataMin - 2', 'dataMax + 2']} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Area
                    type="monotone"
                    dataKey="weight"
                    name="Peso Total (kg)"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#weightGrad)"
                  />
                  {chartData.some((d) => d.leanMass) && (
                    <Line
                      type="monotone"
                      dataKey="leanMass"
                      name="Massa Magra (kg)"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Body Fat % and Circumferences */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <h4 className="font-bold text-slate-800 text-sm mb-4 flex items-center justify-between">
              <span>Evolução de Medidas & % Gordura</span>
              <span className="text-[11px] font-normal text-slate-400">Centímetros / Percentual</span>
            </h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Line
                    type="monotone"
                    dataKey="fatPercent"
                    name="% Gordura Corporal"
                    stroke="#f59e0b"
                    strokeWidth={2.5}
                    dot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="abdomen"
                    name="Abdômen (cm)"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="waist"
                    name="Cintura (cm)"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center">
          <p className="text-xs text-slate-400">Nenhuma avaliação física cadastrada ainda.</p>
        </div>
      )}

      {/* Assessments History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h4 className="font-bold text-slate-800 text-sm">Histórico de Avaliações</h4>
          <span className="text-xs text-slate-400">{assessments.length} registros</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Data</th>
                <th className="py-3 px-4">Peso</th>
                <th className="py-3 px-4">IMC</th>
                <th className="py-3 px-4">% Gordura</th>
                <th className="py-3 px-4">Abdômen</th>
                <th className="py-3 px-4">Cintura</th>
                <th className="py-3 px-4">Quadril</th>
                <th className="py-3 px-4">Observações</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {assessments.map((a) => {
                const bmiData = calculateBMI(a.weight, a.height);
                return (
                  <tr key={a.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-800 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{a.date}</span>
                    </td>
                    <td className="py-3 px-4 font-bold">{a.weight} kg</td>
                    <td className="py-3 px-4">
                      <span className="font-bold">{a.bmi}</span>{' '}
                      <span className="text-[10px] text-slate-400">({bmiData.classification})</span>
                    </td>
                    <td className="py-3 px-4 font-bold text-amber-600">
                      {a.bodyFatPercentage ? `${a.bodyFatPercentage}%` : '--'}
                    </td>
                    <td className="py-3 px-4">{a.abdomen ? `${a.abdomen} cm` : '--'}</td>
                    <td className="py-3 px-4">{a.waist ? `${a.waist} cm` : '--'}</td>
                    <td className="py-3 px-4">{a.hip ? `${a.hip} cm` : '--'}</td>
                    <td className="py-3 px-4 max-w-xs truncate text-slate-500 italic">
                      {a.notes || '-'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleStartEdit(a)}
                          className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                          title="Editar avaliação"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Deseja excluir esta avaliação?')) {
                              onDeleteAssessment(a.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Excluir avaliação"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
