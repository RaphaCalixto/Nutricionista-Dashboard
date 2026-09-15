import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Flame,
  Zap,
  Target,
  Sliders,
  Check,
  TrendingDown,
  TrendingUp,
  Scale,
  Sparkles,
  PieChart as PieIcon
} from 'lucide-react';
import { Patient, Anthropometry, EnergyCalculation } from '../../types';
import { calculateAge, calculateBMR } from '../../utils/nutritionCalculations';

interface EnergyCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  latestAssessment?: Anthropometry;
  onApplyToDiet: (calc: EnergyCalculation) => void;
}

export const EnergyCalculatorModal: React.FC<EnergyCalculatorModalProps> = ({
  isOpen,
  onClose,
  patient,
  latestAssessment,
  onApplyToDiet,
}) => {
  const age = calculateAge(patient.birthDate);
  const currentWeight = latestAssessment?.weight || 68;
  const currentHeight = latestAssessment?.height || 165;
  const leanMass = latestAssessment?.leanMassKg;

  const [formula, setFormula] = useState<'mifflin' | 'harris_benedict' | 'cunningham' | 'schofield'>('mifflin');
  const [activityFactor, setActivityFactor] = useState<number>(1.55); // Moderado
  const [goalType, setGoalType] = useState<'deficit' | 'surplus' | 'maintenance'>('deficit');
  const [goalAdjustment, setGoalAdjustment] = useState<number>(-400);

  // Macro distribution settings
  const [proteinGPerKg, setProteinGPerKg] = useState<number>(1.8);
  const [fatPercent, setFatPercent] = useState<number>(25);

  // Auto set defaults based on patient goal
  useEffect(() => {
    if (patient.goal === 'weight_loss') {
      setGoalType('deficit');
      setGoalAdjustment(-400);
      setProteinGPerKg(2.0);
      setFatPercent(25);
    } else if (patient.goal === 'hypertrophy') {
      setGoalType('surplus');
      setGoalAdjustment(350);
      setProteinGPerKg(2.0);
      setFatPercent(25);
    } else {
      setGoalType('maintenance');
      setGoalAdjustment(0);
      setProteinGPerKg(1.6);
      setFatPercent(30);
    }
  }, [patient.goal, isOpen]);

  // Calculations
  const bmr = useMemo(() => {
    return calculateBMR(formula, currentWeight, currentHeight, age, patient.gender, leanMass);
  }, [formula, currentWeight, currentHeight, age, patient.gender, leanMass]);

  const tdee = useMemo(() => {
    return Math.round(bmr * activityFactor);
  }, [bmr, activityFactor]);

  const targetCalories = useMemo(() => {
    const adj = goalType === 'maintenance' ? 0 : goalAdjustment;
    return Math.max(1000, tdee + adj);
  }, [tdee, goalType, goalAdjustment]);

  // Macros Calculation
  // 1. Protein: 4 kcal per gram
  const proteinGrams = useMemo(() => {
    return Math.round(currentWeight * proteinGPerKg);
  }, [currentWeight, proteinGPerKg]);

  const proteinCalories = proteinGrams * 4;
  const proteinPercent = Math.round((proteinCalories / targetCalories) * 100);

  // 2. Fat: 9 kcal per gram
  const fatCalories = Math.round((targetCalories * fatPercent) / 100);
  const fatGrams = Math.round(fatCalories / 9);

  // 3. Carbs: remaining calories / 4
  const carbCalories = Math.max(0, targetCalories - (proteinCalories + fatCalories));
  const carbGrams = Math.round(carbCalories / 4);
  const carbPercent = Math.round((carbCalories / targetCalories) * 100);

  if (!isOpen) return null;

  const handleApply = () => {
    const result: EnergyCalculation = {
      patientId: patient.id,
      formula,
      bmr,
      activityFactor,
      tdee,
      goalAdjustmentCalories: goalType === 'maintenance' ? 0 : goalAdjustment,
      targetCalories,
      proteinGrams,
      proteinGPerKg,
      proteinPercent,
      carbGrams,
      carbPercent,
      fatGrams,
      fatPercent,
    };
    onApplyToDiet(result);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-xs">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">
                Calculadora Energética & Macronutrientes
              </h3>
              <p className="text-xs text-slate-500">
                {patient.name} ({currentWeight}kg • {currentHeight}cm • {age} anos)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Step 1: Formula & Activity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Fórmula de TMB (Taxa Basal)
              </label>
              <select
                value={formula}
                onChange={(e) => setFormula(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="mifflin">Mifflin-St Jeor (Padrão Ouro)</option>
                <option value="harris_benedict">Harris-Benedict (Revisada)</option>
                <option value="cunningham">Cunningham (baseada em Massa Magra)</option>
                <option value="schofield">Schofield (FAO/OMS)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Fator de Atividade Física (FA)
              </label>
              <select
                value={activityFactor}
                onChange={(e) => setActivityFactor(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value={1.2}>Sedentário (1.2) - Pouco ou nenhum exercício</option>
                <option value={1.375}>Leve (1.375) - Exercício 1 a 3x/semana</option>
                <option value={1.55}>Moderado (1.55) - Exercício 3 a 5x/semana</option>
                <option value={1.725}>Intenso (1.725) - Treino pesado 6 a 7x/semana</option>
                <option value={1.9}>Atleta / Extremo (1.9) - Treino 2x ao dia</option>
              </select>
            </div>
          </div>

          {/* Energy Summary Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                TMB (Basal)
              </span>
              <p className="text-xl font-black text-slate-800 mt-0.5">{bmr} <span className="text-xs font-normal text-slate-400">kcal</span></p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                GET (Gasto Total)
              </span>
              <p className="text-xl font-black text-slate-800 mt-0.5">{tdee} <span className="text-xs font-normal text-slate-400">kcal</span></p>
            </div>

            <div className="bg-emerald-50 p-3.5 rounded-xl border border-emerald-200 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                VET Alvo (Dieta)
              </span>
              <p className="text-xl font-black text-emerald-800 mt-0.5">{targetCalories} <span className="text-xs font-normal text-emerald-600">kcal</span></p>
            </div>
          </div>

          {/* Step 2: Goal Adjustment (Deficit/Surplus) */}
          <div className="space-y-3 bg-slate-50/60 p-4 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Objetivo Calórico
              </label>
              <div className="flex items-center gap-1.5 bg-white p-1 rounded-lg border border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setGoalType('deficit');
                    setGoalAdjustment(-400);
                  }}
                  className={`px-2.5 py-1 text-xs font-bold rounded-md transition-colors ${
                    goalType === 'deficit' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'text-slate-500'
                  }`}
                >
                  Déficit (Emagrecimento)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setGoalType('maintenance');
                    setGoalAdjustment(0);
                  }}
                  className={`px-2.5 py-1 text-xs font-bold rounded-md transition-colors ${
                    goalType === 'maintenance' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'text-slate-500'
                  }`}
                >
                  Manutenção
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setGoalType('surplus');
                    setGoalAdjustment(350);
                  }}
                  className={`px-2.5 py-1 text-xs font-bold rounded-md transition-colors ${
                    goalType === 'surplus' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'text-slate-500'
                  }`}
                >
                  Superávit (Hipertrofia)
                </button>
              </div>
            </div>

            {goalType !== 'maintenance' && (
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Ajuste Calórico:</span>
                  <strong className={goalType === 'deficit' ? 'text-rose-600' : 'text-blue-600'}>
                    {goalAdjustment > 0 ? `+${goalAdjustment}` : goalAdjustment} kcal/dia
                  </strong>
                </div>
                <input
                  type="range"
                  min={goalType === 'deficit' ? -1000 : 100}
                  max={goalType === 'deficit' ? -100 : 1000}
                  step={50}
                  value={goalAdjustment}
                  onChange={(e) => setGoalAdjustment(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>
            )}
          </div>

          {/* Step 3: Macronutrients Distribution */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-emerald-600" />
              <span>Distribuição de Macronutrientes</span>
            </h4>

            {/* Protein Slider */}
            <div className="space-y-1.5 bg-white p-3 rounded-xl border border-slate-200">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-700">Proteína (g/kg de peso):</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {proteinGPerKg} g/kg ({proteinGrams}g)
                  </span>
                  <span className="text-[11px] text-slate-400">{proteinPercent}% do VET</span>
                </div>
              </div>
              <input
                type="range"
                min={0.8}
                max={3.0}
                step={0.1}
                value={proteinGPerKg}
                onChange={(e) => setProteinGPerKg(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            {/* Fat Slider */}
            <div className="space-y-1.5 bg-white p-3 rounded-xl border border-slate-200">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-700">Lipídios / Gorduras (% do VET):</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    {fatPercent}% ({fatGrams}g)
                  </span>
                  <span className="text-[11px] text-slate-400">{fatCalories} kcal</span>
                </div>
              </div>
              <input
                type="range"
                min={15}
                max={40}
                step={1}
                value={fatPercent}
                onChange={(e) => setFatPercent(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            {/* Carbs Result */}
            <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-200/80 flex justify-between items-center text-xs">
              <div>
                <span className="font-bold text-emerald-900">Carboidratos (Balanço Restante):</span>
                <p className="text-[11px] text-emerald-700">Ajustado automaticamente para fechar as calorias</p>
              </div>
              <div className="text-right">
                <span className="font-black text-emerald-800 text-sm">
                  {carbGrams}g ({carbPercent}%)
                </span>
                <p className="text-[10px] text-emerald-600">{carbCalories} kcal</p>
              </div>
            </div>

            {/* Macro Visual Bar */}
            <div className="h-3 rounded-full overflow-hidden flex shadow-inner bg-slate-100">
              <div style={{ width: `${proteinPercent}%` }} className="bg-blue-500" title={`Proteína: ${proteinPercent}%`} />
              <div style={{ width: `${fatPercent}%` }} className="bg-amber-400" title={`Gordura: ${fatPercent}%`} />
              <div style={{ width: `${carbPercent}%` }} className="bg-emerald-500" title={`Carboidratos: ${carbPercent}%`} />
            </div>
            <div className="flex justify-center gap-4 text-[11px] text-slate-500 font-medium">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Proteína ({proteinPercent}%)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Gorduras ({fatPercent}%)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Carboidratos ({carbPercent}%)
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
          >
            Cancelar
          </button>
          <button
            onClick={handleApply}
            className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] rounded-xl shadow-sm shadow-emerald-600/20 flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" />
            <span>Aplicar Metas ao Montador de Dieta</span>
          </button>
        </div>
      </div>
    </div>
  );
};
