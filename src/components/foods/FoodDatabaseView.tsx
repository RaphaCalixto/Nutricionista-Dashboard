import React, { useState, useMemo, useEffect } from 'react';
import {
  Apple,
  Search,
  Plus,
  Filter,
  Sparkles,
  Info,
  ChevronRight,
  Database
} from 'lucide-react';
import { FoodItem } from '../../types';
import { TACO_FOODS } from '../../data/tacoFoods';
import { getCustomFoods, searchFoods, fetchCustomFoods } from '../../services/foodService';
import { CustomFoodModal } from '../modals/CustomFoodModal';

export const FoodDatabaseView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [foods, setFoods] = useState<FoodItem[]>([...getCustomFoods(), ...TACO_FOODS]);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    fetchCustomFoods().then((cf) => {
      setFoods([...cf, ...TACO_FOODS]);
    }).catch(() => {});
  }, []);

  // Debounced search
  useEffect(() => {
    let active = true;
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await searchFoods(searchTerm, true);
        if (active) setFoods(res);
      } finally {
        if (active) setSearching(false);
      }
    }, 250);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [searchTerm]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    TACO_FOODS.forEach((f) => set.add(f.category));
    return ['all', ...Array.from(set)];
  }, []);

  const filteredFoods = useMemo(() => {
    if (selectedCategory === 'all') return foods;
    return foods.filter((f) => f.category === selectedCategory);
  }, [foods, selectedCategory]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2.5">
            <Apple className="w-6 h-6 text-emerald-600" />
            <span>Tabela Nutricional de Alimentos (TACO & API)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Consulte valores calóricos, macronutrientes e micronutrientes por 100g de centenas de alimentos
          </p>
        </div>

        <button
          onClick={() => setIsCustomModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm shadow-emerald-600/20 active:scale-[0.98] transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Alimento Próprio</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar alimento por nome, ingrediente ou categoria..."
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 text-[11px] font-semibold flex items-center gap-1 mr-1">
            <Filter className="w-3 h-3" /> Categoria:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white font-bold shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              {cat === 'all' ? 'Todas as Categorias' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Foods Table / Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700">
            Mostrando {filteredFoods.length} alimentos
          </span>
          <span className="text-[11px] text-slate-400 font-medium">Valores baseados em 100g do alimento</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Alimento</th>
                <th className="py-3 px-4">Categoria</th>
                <th className="py-3 px-4">Calorias (kcal)</th>
                <th className="py-3 px-4">Proteínas (g)</th>
                <th className="py-3 px-4">Carboidratos (g)</th>
                <th className="py-3 px-4">Gorduras (g)</th>
                <th className="py-3 px-4">Fibras (g)</th>
                <th className="py-3 px-4">Fonte</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredFoods.map((food) => (
                <tr key={food.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-800">
                    <div>{food.name}</div>
                    {food.commonPortions && food.commonPortions.length > 0 && (
                      <div className="text-[10px] font-normal text-slate-400 mt-0.5">
                        Porção comum: {food.commonPortions[0].name}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4 text-slate-500">{food.category}</td>
                  <td className="py-3 px-4 font-black text-slate-900">{food.calories} kcal</td>
                  <td className="py-3 px-4 font-semibold text-blue-700">{food.protein} g</td>
                  <td className="py-3 px-4 font-semibold text-emerald-700">{food.carbs} g</td>
                  <td className="py-3 px-4 font-semibold text-amber-700">{food.fats} g</td>
                  <td className="py-3 px-4 text-slate-600">{food.fiber} g</td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                        food.source === 'taco'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : food.source === 'custom'
                          ? 'bg-purple-50 text-purple-800 border-purple-200'
                          : 'bg-blue-50 text-blue-800 border-blue-200'
                      }`}
                    >
                      {food.source === 'taco' ? 'TACO' : food.source === 'custom' ? 'Próprio' : 'API'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <CustomFoodModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        onFoodAdded={(newFood) => setFoods([newFood, ...foods])}
      />
    </div>
  );
};
