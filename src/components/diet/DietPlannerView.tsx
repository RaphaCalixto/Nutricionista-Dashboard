import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  UtensilsCrossed,
  Plus,
  Trash2,
  Search,
  Check,
  Save,
  Printer,
  ChevronDown,
  Sparkles,
  Info,
  Clock,
  Apple,
  Sliders,
  Flame,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Edit2,
  Scale,
  X
} from 'lucide-react';
import { Patient, DietPlan, DietMeal, DietMealItem, FoodItem, EnergyCalculation } from '../../types';
import { searchFoods, calculateItemNutrients, saveCustomFood, getCustomFoods } from '../../services/foodService';
import { TACO_FOODS } from '../../data/tacoFoods';

// Helper to guarantee "Gramas (g)" is ALWAYS the first option and other measures below
export function getOrderedPortions(food?: FoodItem | null): { name: string; weightGrams: number }[] {
  const defaultGrams = { name: 'Gramas (g)', weightGrams: 1 };
  if (!food || !food.commonPortions || food.commonPortions.length === 0) {
    return [defaultGrams];
  }
  const gramsPortion = food.commonPortions.find(
    (p) => p.name.toLowerCase().includes('gramas') || p.name === 'g' || p.weightGrams === 1
  );
  const otherPortions = food.commonPortions.filter(
    (p) => !p.name.toLowerCase().includes('gramas') && p.name !== 'g' && p.weightGrams !== 1
  );
  return [gramsPortion || defaultGrams, ...otherPortions];
}

interface DietPlannerViewProps {
  patients: Patient[];
  selectedPatient?: Patient | null;
  initialPlan?: DietPlan | null;
  initialEnergyCalc?: EnergyCalculation | null;
  onSavePlan: (plan: DietPlan) => Promise<void>;
  onPrintPlan: (patient: Patient, plan: DietPlan) => void;
  onSelectPatientChange?: (patient: Patient) => void;
  onBack?: () => void;
}

export const DietPlannerView: React.FC<DietPlannerViewProps> = ({
  patients,
  selectedPatient: propPatient,
  initialPlan,
  initialEnergyCalc,
  onSavePlan,
  onPrintPlan,
  onSelectPatientChange,
  onBack,
}) => {
  const [currentPatient, setCurrentPatient] = useState<Patient | null>(
    propPatient || (patients.length > 0 ? patients[0] : null)
  );

  const [title, setTitle] = useState(
    initialPlan?.title || 'Plano Alimentar Individualizado'
  );
  const [description, setDescription] = useState(
    initialPlan?.description || 'Plano equilibrado focado em saciedade e atingimento das metas nutricionais.'
  );

  // Target macros
  const [targetCalories, setTargetCalories] = useState<number>(
    initialEnergyCalc?.targetCalories || initialPlan?.targetCalories || 1800
  );
  const [targetProtein, setTargetProtein] = useState<number>(
    initialEnergyCalc?.proteinGrams || initialPlan?.targetProtein || 120
  );
  const [targetCarbs, setTargetCarbs] = useState<number>(
    initialEnergyCalc?.carbGrams || initialPlan?.targetCarbs || 180
  );
  const [targetFats, setTargetFats] = useState<number>(
    initialEnergyCalc?.fatGrams || initialPlan?.targetFats || 50
  );
  const [waterTargetMl, setWaterTargetMl] = useState<number>(
    initialPlan?.waterTargetMl || 2500
  );

  // Guidelines
  const [guidelinesText, setGuidelinesText] = useState(
    initialPlan?.guidelines?.join('\n') ||
      'Mastigue devagar e evite ingestão excessiva de líquidos durante as refeições principais.\nBeba água fracionada ao longo do dia para atingir a meta hídrica.\nPriorize saladas cruas no início das refeições para controle de saciedade.'
  );

  // Meals
  const [meals, setMeals] = useState<DietMeal[]>(
    initialPlan?.meals || [
      {
        id: `m-1-${Date.now()}`,
        name: 'Café da Manhã',
        time: '07:30',
        order: 1,
        items: [],
      },
      {
        id: `m-2-${Date.now()}`,
        name: 'Almoço',
        time: '12:30',
        order: 2,
        items: [],
      },
      {
        id: `m-3-${Date.now()}`,
        name: 'Lanche da Tarde',
        time: '16:30',
        order: 3,
        items: [],
      },
      {
        id: `m-4-${Date.now()}`,
        name: 'Jantar',
        time: '20:00',
        order: 4,
        items: [],
      },
    ]
  );

  // Food Search Modal / State
  const [activeMealIdForSearch, setActiveMealIdForSearch] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);

  // Add Item configuration
  const [itemQuantity, setItemQuantity] = useState<number>(100);
  const [selectedPortionMultiplier, setSelectedPortionMultiplier] = useState<number>(1);
  const [selectedPortionName, setSelectedPortionName] = useState<string>('Gramas (g)');
  const [itemNotes, setItemNotes] = useState('');
  const [substitutesInput, setSubstitutesInput] = useState('');

  // Edit Item Modal State
  const [editingItemState, setEditingItemState] = useState<{
    mealId: string;
    item: DietMealItem;
    food?: FoodItem;
  } | null>(null);
  const [editFoodName, setEditFoodName] = useState('');
  const [editQuantity, setEditQuantity] = useState<number>(1);
  const [editUnit, setEditUnit] = useState<string>('Gramas (g)');
  const [editPortionMultiplier, setEditPortionMultiplier] = useState<number>(1);
  const [editCalories, setEditCalories] = useState<number>(0);
  const [editProtein, setEditProtein] = useState<number>(0);
  const [editCarbs, setEditCarbs] = useState<number>(0);
  const [editFats, setEditFats] = useState<number>(0);
  const [editFiber, setEditFiber] = useState<number>(0);
  const [editNotes, setEditNotes] = useState('');
  const [editSubstitutes, setEditSubstitutes] = useState('');
  const [customMacrosMode, setCustomMacrosMode] = useState<boolean>(false);

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Open Edit Item Modal
  const handleOpenEditItem = (mealId: string, item: DietMealItem) => {
    const tacoFound = TACO_FOODS.find(
      (f) => f.id === item.foodId || f.name.toLowerCase() === item.foodName.toLowerCase()
    );
    const customFound = getCustomFoods().find(
      (f) => f.id === item.foodId || f.name.toLowerCase() === item.foodName.toLowerCase()
    );
    const foundFood = tacoFound || customFound;

    setEditingItemState({ mealId, item, food: foundFood });
    setEditFoodName(item.foodName);
    setEditQuantity(item.quantity);
    setEditUnit(item.unit);
    setEditCalories(item.calories);
    setEditProtein(item.protein);
    setEditCarbs(item.carbs);
    setEditFats(item.fats);
    setEditFiber(item.fiber || 0);
    setEditNotes(item.notes || '');
    setEditSubstitutes(item.substitutes ? item.substitutes.join('; ') : '');
    setCustomMacrosMode(false);

    let multiplier = 1;
    if (foundFood) {
      const ordered = getOrderedPortions(foundFood);
      const matched = ordered.find((p) => p.name === item.unit);
      if (matched) {
        multiplier = matched.weightGrams;
      }
    }
    setEditPortionMultiplier(multiplier);
  };

  // Recalculate on edit quantity / portion change
  const handleEditQuantityChange = (newQty: number, newMultiplier?: number, newUnitName?: string) => {
    setEditQuantity(newQty);
    const multiplier = newMultiplier !== undefined ? newMultiplier : editPortionMultiplier;
    if (newMultiplier !== undefined) setEditPortionMultiplier(newMultiplier);
    if (newUnitName !== undefined) setEditUnit(newUnitName);

    if (customMacrosMode) return;

    const currentFood = editingItemState?.food;
    if (currentFood) {
      const nutrients = calculateItemNutrients(currentFood, newQty, multiplier);
      setEditCalories(nutrients.calories);
      setEditProtein(nutrients.protein);
      setEditCarbs(nutrients.carbs);
      setEditFats(nutrients.fats);
      setEditFiber(nutrients.fiber);
    } else if (editingItemState?.item) {
      const baseQty = editingItemState.item.quantity || 1;
      const factor = newQty / baseQty;
      setEditCalories(Math.round(editingItemState.item.calories * factor * 10) / 10);
      setEditProtein(Math.round(editingItemState.item.protein * factor * 10) / 10);
      setEditCarbs(Math.round(editingItemState.item.carbs * factor * 10) / 10);
      setEditFats(Math.round(editingItemState.item.fats * factor * 10) / 10);
      setEditFiber(Math.round((editingItemState.item.fiber || 0) * factor * 10) / 10);
    }
  };

  // Save edited item
  const handleSaveEditedItem = () => {
    if (!editingItemState) return;

    const updatedItem: DietMealItem = {
      ...editingItemState.item,
      foodName: editFoodName.trim() || editingItemState.item.foodName,
      quantity: Number(editQuantity),
      unit: editUnit,
      calories: Number(editCalories),
      protein: Number(editProtein),
      carbs: Number(editCarbs),
      fats: Number(editFats),
      fiber: Number(editFiber),
      notes: editNotes.trim() || undefined,
      substitutes: editSubstitutes
        ? editSubstitutes.split(';').map((s) => s.trim()).filter(Boolean)
        : undefined,
    };

    setMeals((prev) =>
      prev.map((m) =>
        m.id === editingItemState.mealId
          ? {
              ...m,
              items: m.items.map((i) => (i.id === updatedItem.id ? updatedItem : i)),
            }
          : m
      )
    );

    setEditingItemState(null);
  };

  // Update when propPatient changes
  useEffect(() => {
    if (propPatient) {
      setCurrentPatient(propPatient);
    }
  }, [propPatient]);

  // Update when initialPlan changes
  useEffect(() => {
    if (initialPlan) {
      setTitle(initialPlan.title);
      setDescription(initialPlan.description || '');
      setTargetCalories(initialPlan.targetCalories);
      setTargetProtein(initialPlan.targetProtein);
      setTargetCarbs(initialPlan.targetCarbs);
      setTargetFats(initialPlan.targetFats);
      setWaterTargetMl(initialPlan.waterTargetMl || 2500);
      setGuidelinesText(initialPlan.guidelines?.join('\n') || '');
      setMeals(initialPlan.meals);
    }
  }, [initialPlan]);

  // Update when energyCalc is passed
  useEffect(() => {
    if (initialEnergyCalc) {
      setTargetCalories(initialEnergyCalc.targetCalories);
      setTargetProtein(initialEnergyCalc.proteinGrams);
      setTargetCarbs(initialEnergyCalc.carbGrams);
      setTargetFats(initialEnergyCalc.fatGrams);
    }
  }, [initialEnergyCalc]);

  // Debounced Food Search
  useEffect(() => {
    let active = true;
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await searchFoods(searchQuery);
        if (active) {
          setSearchResults(results);
        }
      } finally {
        if (active) setSearching(false);
      }
    }, 250);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [searchQuery]);

  // Real-time totals of the current diet plan
  const planTotals = useMemo(() => {
    let totalKcal = 0;
    let totalProt = 0;
    let totalCarbs = 0;
    let totalFats = 0;
    let totalFiber = 0;

    meals.forEach((meal) => {
      meal.items.forEach((item) => {
        totalKcal += item.calories || 0;
        totalProt += item.protein || 0;
        totalCarbs += item.carbs || 0;
        totalFats += item.fats || 0;
        totalFiber += item.fiber || 0;
      });
    });

    return {
      calories: Math.round(totalKcal),
      protein: Math.round(totalProt * 10) / 10,
      carbs: Math.round(totalCarbs * 10) / 10,
      fats: Math.round(totalFats * 10) / 10,
      fiber: Math.round(totalFiber * 10) / 10,
    };
  }, [meals]);

  // Real-time calculation for food being added
  const currentItemPreview = useMemo(() => {
    if (!selectedFood) return null;
    return calculateItemNutrients(selectedFood, itemQuantity, selectedPortionMultiplier);
  }, [selectedFood, itemQuantity, selectedPortionMultiplier]);

  // Select food in search modal
  const handleSelectFood = (food: FoodItem) => {
    setSelectedFood(food);
    const orderedPortions = getOrderedPortions(food);
    const defaultPortion = orderedPortions[0]; // Always 'Gramas (g)'
    setSelectedPortionMultiplier(defaultPortion.weightGrams);
    setSelectedPortionName(defaultPortion.name);
    setItemQuantity(100);
  };

  // Add Item to Meal
  const handleConfirmAddItem = () => {
    if (!selectedFood || !activeMealIdForSearch || !currentItemPreview) return;

    const newItem: DietMealItem = {
      id: `item-${Date.now()}`,
      foodId: selectedFood.id,
      foodName: selectedFood.name,
      quantity: itemQuantity,
      unit: selectedPortionName,
      calories: currentItemPreview.calories,
      protein: currentItemPreview.protein,
      carbs: currentItemPreview.carbs,
      fats: currentItemPreview.fats,
      fiber: currentItemPreview.fiber,
      notes: itemNotes.trim() || undefined,
      substitutes: substitutesInput
        ? substitutesInput.split(';').map((s) => s.trim()).filter(Boolean)
        : undefined,
    };

    setMeals((prev) =>
      prev.map((m) => (m.id === activeMealIdForSearch ? { ...m, items: [...m.items, newItem] } : m))
    );

    // Reset item picker
    setSelectedFood(null);
    setItemNotes('');
    setSubstitutesInput('');
    setActiveMealIdForSearch(null);
    setSearchQuery('');
  };

  // Remove Item
  const handleRemoveItem = (mealId: string, itemId: string) => {
    setMeals((prev) =>
      prev.map((m) => (m.id === mealId ? { ...m, items: m.items.filter((i) => i.id !== itemId) } : m))
    );
  };

  // Add Meal
  const handleAddMeal = (mealName: string = 'Nova Refeição', time: string = '15:00') => {
    const newMeal: DietMeal = {
      id: `m-${Date.now()}`,
      name: mealName,
      time,
      order: meals.length + 1,
      items: [],
    };
    setMeals([...meals, newMeal]);
  };

  // Remove Meal
  const handleRemoveMeal = (mealId: string) => {
    setMeals(meals.filter((m) => m.id !== mealId));
  };

  // Save Plan
  const handleSave = async () => {
    if (!currentPatient) {
      alert('Selecione um paciente para salvar a dieta.');
      return;
    }

    setSaving(true);
    setSavedSuccess(false);

    try {
      const plan: DietPlan = {
        id: initialPlan?.id || `diet-${Date.now()}`,
        patientId: currentPatient.id,
        title: title.trim(),
        description: description.trim(),
        targetCalories,
        targetProtein,
        targetCarbs,
        targetFats,
        waterTargetMl,
        guidelines: guidelinesText.split('\n').filter((l) => l.trim().length > 0),
        meals,
        active: true,
        createdAt: initialPlan?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await onSavePlan(plan);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Back Button */}
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-emerald-800 bg-white hover:bg-emerald-50 rounded-xl border border-slate-200 hover:border-emerald-300 shadow-2xs transition-all cursor-pointer w-fit group"
        >
          <ArrowLeft className="w-4 h-4 text-emerald-600 group-hover:-translate-x-0.5 transition-transform" />
          <span>{currentPatient ? `Voltar para o prontuário de ${currentPatient.name}` : 'Voltar'}</span>
        </button>
      )}

      {/* Top Header & Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight">
              Montador de Dietas Inteligente
            </h2>
            <p className="text-xs text-slate-500">
              Busca com base TACO + API e cálculo nutricional em tempo real
            </p>
          </div>
        </div>

        {/* Patient Selector & Primary Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs">
            <span className="font-semibold text-slate-500">Paciente:</span>
            <select
              value={currentPatient?.id || ''}
              onChange={(e) => {
                const found = patients.find((p) => p.id === e.target.value);
                if (found) {
                  setCurrentPatient(found);
                  if (onSelectPatientChange) onSelectPatientChange(found);
                }
              }}
              className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {currentPatient && (
            <button
              onClick={() => {
                const currentPlanObj: DietPlan = {
                  id: initialPlan?.id || 'temp-plan',
                  patientId: currentPatient.id,
                  title,
                  description,
                  targetCalories,
                  targetProtein,
                  targetCarbs,
                  targetFats,
                  waterTargetMl,
                  guidelines: guidelinesText.split('\n').filter((l) => l.trim().length > 0),
                  meals,
                  active: true,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                };
                onPrintPlan(currentPatient, currentPlanObj);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition-all shadow-xs"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              <span>Imprimir / PDF</span>
            </button>
          )}
        </div>
      </div>

      {/* Plan Details & Target Macros Bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Título do Plano Alimentar
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Plano de Emagrecimento - Fase 1"
              className="w-full px-3 py-2 text-sm font-bold text-slate-800 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Descrição / Resumo do Objetivo
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Foco em controle de saciedade, rica em fibras e proteínas..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Live Macro Tracker Dashboard (Target vs Total Dieta) */}
        <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-emerald-600" />
              <span>Balanço Nutricional: Atual vs Meta Alvo</span>
            </span>
            <span className="text-xs text-slate-500">
              {planTotals.calories} de {targetCalories} kcal planejadas
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            {/* Calories */}
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex justify-between text-slate-500 mb-1">
                <span className="font-semibold">Calorias (VET)</span>
                <span className="font-bold text-slate-800">{planTotals.calories} / {targetCalories}</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  style={{ width: `${Math.min(100, (planTotals.calories / (targetCalories || 1)) * 100)}%` }}
                  className={`h-full transition-all ${
                    planTotals.calories > targetCalories + 100
                      ? 'bg-rose-500'
                      : planTotals.calories >= targetCalories - 50
                      ? 'bg-emerald-500'
                      : 'bg-amber-500'
                  }`}
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Dif: {planTotals.calories - targetCalories} kcal
              </p>
            </div>

            {/* Protein */}
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex justify-between text-slate-500 mb-1">
                <span className="font-semibold">Proteínas</span>
                <span className="font-bold text-blue-700">{planTotals.protein}g / {targetProtein}g</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  style={{ width: `${Math.min(100, (planTotals.protein / (targetProtein || 1)) * 100)}%` }}
                  className="h-full bg-blue-500 transition-all"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                {Math.round((planTotals.protein * 4) / (planTotals.calories || 1) * 100)}% das kcal totais
              </p>
            </div>

            {/* Carbs */}
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex justify-between text-slate-500 mb-1">
                <span className="font-semibold">Carboidratos</span>
                <span className="font-bold text-emerald-700">{planTotals.carbs}g / {targetCarbs}g</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  style={{ width: `${Math.min(100, (planTotals.carbs / (targetCarbs || 1)) * 100)}%` }}
                  className="h-full bg-emerald-500 transition-all"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                {Math.round((planTotals.carbs * 4) / (planTotals.calories || 1) * 100)}% das kcal totais
              </p>
            </div>

            {/* Fats */}
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex justify-between text-slate-500 mb-1">
                <span className="font-semibold">Gorduras / Lipídios</span>
                <span className="font-bold text-amber-700">{planTotals.fats}g / {targetFats}g</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  style={{ width: `${Math.min(100, (planTotals.fats / (targetFats || 1)) * 100)}%` }}
                  className="h-full bg-amber-400 transition-all"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Fibras totais: {planTotals.fiber}g
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Meals Container */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
            <span>Refeições do Plano ({meals.length})</span>
          </h3>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleAddMeal('Café da Manhã', '07:30')}
              className="text-xs px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
            >
              + Café
            </button>
            <button
              type="button"
              onClick={() => handleAddMeal('Almoço', '12:30')}
              className="text-xs px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
            >
              + Almoço
            </button>
            <button
              type="button"
              onClick={() => handleAddMeal('Lanche da Tarde', '16:30')}
              className="text-xs px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
            >
              + Lanche
            </button>
            <button
              type="button"
              onClick={() => handleAddMeal('Jantar', '20:00')}
              className="text-xs px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
            >
              + Jantar
            </button>
            <button
              type="button"
              onClick={() => handleAddMeal('Ceia / Pré-Sono', '22:30')}
              className="text-xs px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
            >
              + Ceia
            </button>
          </div>
        </div>

        {/* Meals Cards */}
        {meals.map((meal, mealIndex) => {
          const mealKcal = Math.round(meal.items.reduce((acc, i) => acc + (i.calories || 0), 0));
          const mealProt = Math.round(meal.items.reduce((acc, i) => acc + (i.protein || 0), 0) * 10) / 10;
          const mealCarb = Math.round(meal.items.reduce((acc, i) => acc + (i.carbs || 0), 0) * 10) / 10;
          const mealFat = Math.round(meal.items.reduce((acc, i) => acc + (i.fats || 0), 0) * 10) / 10;

          return (
            <div
              key={meal.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs space-y-3"
            >
              {/* Meal Header */}
              <div className="bg-slate-50/80 p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center">
                    {mealIndex + 1}
                  </span>
                  <input
                    type="text"
                    value={meal.name}
                    onChange={(e) => {
                      const newName = e.target.value;
                      setMeals(meals.map((m) => (m.id === meal.id ? { ...m, name: newName } : m)));
                    }}
                    className="font-bold text-slate-800 text-sm bg-transparent border-b border-transparent hover:border-slate-300 focus:border-emerald-500 focus:outline-none"
                  />
                  <div className="flex items-center gap-1 text-slate-400 bg-white px-2 py-0.5 rounded-md border border-slate-200 text-xs">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="time"
                      value={meal.time}
                      onChange={(e) => {
                        const newTime = e.target.value;
                        setMeals(meals.map((m) => (m.id === meal.id ? { ...m, time: newTime } : m)));
                      }}
                      className="text-xs text-slate-700 font-mono focus:outline-none"
                    />
                  </div>
                </div>

                {/* Subtotals & Actions */}
                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-lg border border-slate-200">
                    <span className="font-bold text-slate-800">{mealKcal} kcal</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-blue-700 font-medium">P: {mealProt}g</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-emerald-700 font-medium">C: {mealCarb}g</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-amber-700 font-medium">G: {mealFat}g</span>
                  </div>

                  <button
                    onClick={() => {
                      setActiveMealIdForSearch(meal.id);
                      setSearchQuery('');
                      setSelectedFood(null);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-xs transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Adicionar Alimento</span>
                  </button>

                  <button
                    onClick={() => handleRemoveMeal(meal.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                    title="Remover refeição"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Items List */}
              <div className="p-4 pt-1">
                {meal.items.length === 0 ? (
                  <div className="text-center py-5 border-2 border-dashed border-slate-100 rounded-xl">
                    <p className="text-xs text-slate-400">
                      Nenhum alimento nesta refeição. Clique em <strong>Adicionar Alimento</strong> para pesquisar na tabela TACO / API.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {meal.items.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 bg-slate-50/70 hover:bg-slate-50 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-colors group"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800 text-sm">{item.foodName}</span>
                            <button
                              type="button"
                              onClick={() => handleOpenEditItem(meal.id, item)}
                              className="font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200 transition-colors cursor-pointer flex items-center gap-1"
                              title="Clique para editar a quantidade / gramas"
                            >
                              <span>{item.quantity} {item.unit}</span>
                              <Edit2 className="w-2.5 h-2.5 opacity-60 group-hover:opacity-100" />
                            </button>
                          </div>

                          {/* Substitutes / Notes */}
                          {item.substitutes && item.substitutes.length > 0 && (
                            <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                              <span className="font-semibold text-slate-600">Substitutos:</span>
                              <span>{item.substitutes.join(' | ')}</span>
                            </p>
                          )}
                          {item.notes && (
                            <p className="text-[11px] text-slate-400 italic mt-0.5">{item.notes}</p>
                          )}
                        </div>

                        {/* Nutrition values & actions */}
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="flex items-center gap-2 text-right mr-1">
                            <span className="font-black text-slate-800">{item.calories} kcal</span>
                            <span className="text-[11px] text-slate-500 font-mono">
                              (P: {item.protein}g | C: {item.carbs}g | G: {item.fats}g)
                            </span>
                          </div>

                          <button
                            onClick={() => handleOpenEditItem(meal.id, item)}
                            className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                            title="Editar alimento / quantidade / gramas"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleRemoveItem(meal.id, item.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Remover alimento"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Save Action Bar (Last Element on Page) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-slate-800">
            Finalizar e Salvar Cardápio
          </h4>
          <p className="text-xs text-slate-500">
            {currentPatient
              ? `Todos os cálculos e refeições serão vinculados ao prontuário de ${currentPatient.name}.`
              : 'Selecione um paciente para salvar este plano.'}
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          {savedSuccess && (
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5 animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Plano salvo com sucesso!</span>
            </span>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !currentPatient}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3 text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-[0.98] rounded-xl shadow-md shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Salvando...' : savedSuccess ? 'Plano Salvo!' : 'Salvar Plano Alimentar'}</span>
          </button>
        </div>
      </div>

      {/* FOOD SEARCH & ADD MODAL */}
      {activeMealIdForSearch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Apple className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Pesquisa Nutricional de Alimentos</h3>
                  <p className="text-[11px] text-slate-500">Tabela TACO + API Online de Alimentos</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setActiveMealIdForSearch(null);
                  setSelectedFood(null);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Search Bar */}
            <div className="p-4 border-b border-slate-100">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Digite o alimento (ex: frango, arroz integral, aveia, ovo, whey, abacate, etc)..."
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Search Results & Portion Config */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* If a food is selected, configure portion */}
              {selectedFood ? (
                <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200 space-y-4 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                        Alimento Selecionado
                      </span>
                      <h4 className="font-black text-slate-800 text-base">{selectedFood.name}</h4>
                      <p className="text-xs text-slate-500">Categoria: {selectedFood.category}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedFood(null)}
                      className="text-xs font-semibold text-emerald-700 hover:underline"
                    >
                      Trocar Alimento
                    </button>
                  </div>

                  {/* Portion & Quantity Selector */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Unidade / Medida Caseira
                      </label>
                      <select
                        value={selectedPortionName}
                        onChange={(e) => {
                          const pName = e.target.value;
                          const ordered = getOrderedPortions(selectedFood);
                          const prevPortion = ordered.find((p) => p.name === selectedPortionName);
                          const newPortion = ordered.find((p) => p.name === pName);
                          setSelectedPortionName(pName);

                          if (newPortion) {
                            setSelectedPortionMultiplier(newPortion.weightGrams);
                            if (newPortion.weightGrams === 1 && prevPortion && prevPortion.weightGrams > 1) {
                              setItemQuantity(itemQuantity * prevPortion.weightGrams);
                            } else if (newPortion.weightGrams > 1 && prevPortion && prevPortion.weightGrams === 1 && itemQuantity >= 20) {
                              setItemQuantity(Math.max(1, Math.round((itemQuantity / newPortion.weightGrams) * 10) / 10));
                            } else if (newPortion.weightGrams > 1 && itemQuantity === 100) {
                              setItemQuantity(1);
                            }
                          } else {
                            setSelectedPortionMultiplier(1);
                          }
                        }}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-semibold cursor-pointer"
                      >
                        {getOrderedPortions(selectedFood).map((p, idx) => (
                          <option key={idx} value={p.name}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Quantidade
                      </label>
                      <input
                        type="number"
                        min={0.1}
                        step={0.5}
                        value={itemQuantity}
                        onChange={(e) => setItemQuantity(Number(e.target.value))}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-black text-slate-800"
                      />
                    </div>
                  </div>

                  {/* Calculated Nutrients Badge Preview */}
                  {currentItemPreview && (
                    <div className="bg-white p-3 rounded-xl border border-emerald-200/80 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-slate-500 text-[11px]">Total ({currentItemPreview.grams}g):</span>
                        <p className="font-black text-slate-800 text-sm">{currentItemPreview.calories} kcal</p>
                      </div>
                      <div className="flex gap-2 font-semibold">
                        <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          Prot: {currentItemPreview.protein}g
                        </span>
                        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Carb: {currentItemPreview.carbs}g
                        </span>
                        <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          Gord: {currentItemPreview.fats}g
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Substitutes */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Opções de Substituição / Alimentos Equivalentes (separar com ponto e vírgula ;)
                    </label>
                    <input
                      type="text"
                      value={substitutesInput}
                      onChange={(e) => setSubstitutesInput(e.target.value)}
                      placeholder="Ex: 120g de batata doce cozida; 1 tapioca média (60g)"
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white"
                    />
                  </div>
                </div>
              ) : (
                /* Results List */
                <div className="space-y-2">
                  {searchResults.map((food) => (
                    <div
                      key={food.id}
                      onClick={() => handleSelectFood(food)}
                      className="p-3 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 transition-all cursor-pointer flex items-center justify-between group"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800 text-xs group-hover:text-emerald-700">
                            {food.name}
                          </span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                              food.source === 'taco'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {food.source === 'taco' ? 'TACO' : 'API'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">{food.category}</p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-bold text-xs text-slate-800">{food.calories} kcal</span>
                        <p className="text-[10px] text-slate-400">
                          P: {food.protein}g | C: {food.carbs}g | G: {food.fats}g (100g)
                        </p>
                      </div>
                    </div>
                  ))}

                  {searchResults.length === 0 && !searching && (
                    <p className="text-center py-6 text-xs text-slate-400">
                      Nenhum alimento encontrado para "{searchQuery}".
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
              <button
                type="button"
                onClick={() => {
                  setActiveMealIdForSearch(null);
                  setSelectedFood(null);
                }}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancelar
              </button>

              {selectedFood && (
                <button
                  type="button"
                  onClick={handleConfirmAddItem}
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] rounded-xl shadow-xs flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Inserir Alimento na Refeição</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* EDIT FOOD ITEM MODAL */}
      {editingItemState && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Edit2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Editar Alimento / Quantidade</h3>
                  <p className="text-[11px] text-slate-500">Ajuste gramas, porções e valores nutricionais</p>
                </div>
              </div>
              <button
                onClick={() => setEditingItemState(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
              {/* Food Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Nome do Alimento
                </label>
                <input
                  type="text"
                  value={editFoodName}
                  onChange={(e) => setEditFoodName(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-bold text-slate-800 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Quantity & Unit Config */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Unidade / Medida Caseira
                  </label>
                  {editingItemState.food ? (
                    <select
                      value={editUnit}
                      onChange={(e) => {
                        const newUnit = e.target.value;
                        const ordered = getOrderedPortions(editingItemState.food);
                        const prevPortion = ordered.find((p) => p.name === editUnit);
                        const newPortion = ordered.find((p) => p.name === newUnit);
                        const multiplier = newPortion ? newPortion.weightGrams : 1;

                        let newQty = editQuantity;
                        if (multiplier === 1 && prevPortion && prevPortion.weightGrams > 1) {
                          newQty = editQuantity * prevPortion.weightGrams;
                        } else if (multiplier > 1 && prevPortion && prevPortion.weightGrams === 1 && editQuantity >= 20) {
                          newQty = Math.max(1, Math.round((editQuantity / multiplier) * 10) / 10);
                        }

                        handleEditQuantityChange(newQty, multiplier, newUnit);
                      }}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-semibold focus:outline-none cursor-pointer"
                    >
                      {getOrderedPortions(editingItemState.food).map((p, idx) => (
                        <option key={idx} value={p.name}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={editUnit}
                      onChange={(e) => setEditUnit(e.target.value)}
                      placeholder="Ex: Gramas (g), scoop (30g), colher"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-semibold"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Quantidade / Gramas
                  </label>
                  <input
                    type="number"
                    step={editUnit === 'g' || editUnit.includes('(g)') ? 5 : 0.5}
                    min={0.1}
                    value={editQuantity}
                    onChange={(e) => handleEditQuantityChange(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs font-black text-slate-800 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Quick Increment buttons */}
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600">
                <span className="text-slate-400 mr-1">Ajuste rápido:</span>
                <button
                  type="button"
                  onClick={() => handleEditQuantityChange(Math.max(1, editQuantity - 10))}
                  className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
                >
                  -10
                </button>
                <button
                  type="button"
                  onClick={() => handleEditQuantityChange(editQuantity + 10)}
                  className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
                >
                  +10
                </button>
                <button
                  type="button"
                  onClick={() => handleEditQuantityChange(Math.max(1, editQuantity - 50))}
                  className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
                >
                  -50
                </button>
                <button
                  type="button"
                  onClick={() => handleEditQuantityChange(editQuantity + 50)}
                  className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
                >
                  +50
                </button>
              </div>

              {/* Live Macros Card */}
              <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700">Valores Nutricionais Calculados</span>
                  <span className="font-black text-slate-800 text-sm">{editCalories} kcal</span>
                </div>

                <div className="grid grid-cols-4 gap-2 text-center text-xs pt-1">
                  <div className="bg-white p-2 rounded-lg border border-blue-200">
                    <span className="text-[10px] text-slate-400 block font-semibold">Proteínas</span>
                    <span className="font-bold text-blue-700">{editProtein}g</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-emerald-200">
                    <span className="text-[10px] text-slate-400 block font-semibold">Carboidratos</span>
                    <span className="font-bold text-emerald-700">{editCarbs}g</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-amber-200">
                    <span className="text-[10px] text-slate-400 block font-semibold">Gorduras</span>
                    <span className="font-bold text-amber-700">{editFats}g</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 block font-semibold">Fibras</span>
                    <span className="font-bold text-slate-700">{editFiber}g</span>
                  </div>
                </div>

                {/* Custom manual macro toggle */}
                <div className="pt-2 border-t border-emerald-200/60">
                  <label className="flex items-center gap-2 cursor-pointer text-[11px] text-slate-600 font-semibold">
                    <input
                      type="checkbox"
                      checked={customMacrosMode}
                      onChange={(e) => setCustomMacrosMode(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Ajustar valores nutricionais manualmente</span>
                  </label>

                  {customMacrosMode && (
                    <div className="grid grid-cols-5 gap-2 pt-2 animate-in fade-in">
                      <div>
                        <label className="text-[10px] text-slate-500">Kcal</label>
                        <input
                          type="number"
                          value={editCalories}
                          onChange={(e) => setEditCalories(Number(e.target.value))}
                          className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500">Prot (g)</label>
                        <input
                          type="number"
                          step={0.1}
                          value={editProtein}
                          onChange={(e) => setEditProtein(Number(e.target.value))}
                          className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500">Carb (g)</label>
                        <input
                          type="number"
                          step={0.1}
                          value={editCarbs}
                          onChange={(e) => setEditCarbs(Number(e.target.value))}
                          className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500">Gord (g)</label>
                        <input
                          type="number"
                          step={0.1}
                          value={editFats}
                          onChange={(e) => setEditFats(Number(e.target.value))}
                          className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500">Fibras (g)</label>
                        <input
                          type="number"
                          step={0.1}
                          value={editFiber}
                          onChange={(e) => setEditFiber(Number(e.target.value))}
                          className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs font-bold"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Substitutes */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Opções de Substituição / Alimentos Equivalentes
                </label>
                <input
                  type="text"
                  value={editSubstitutes}
                  onChange={(e) => setEditSubstitutes(e.target.value)}
                  placeholder="Ex: 120g de batata doce; 1 tapioca média (60g)"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Observações / Modo de Preparo
                </label>
                <input
                  type="text"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Ex: Tomar com 200ml de água gelada, grelhado sem óleo..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50">
              <button
                type="button"
                onClick={() => setEditingItemState(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveEditedItem}
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Salvar Alterações</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
