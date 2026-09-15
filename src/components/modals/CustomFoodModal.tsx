import React, { useState } from 'react';
import { X, Apple, Plus, Check } from 'lucide-react';
import { FoodItem } from '../../types';
import { saveCustomFood } from '../../services/foodService';

interface CustomFoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFoodAdded: (food: FoodItem) => void;
}

export const CustomFoodModal: React.FC<CustomFoodModalProps> = ({
  isOpen,
  onClose,
  onFoodAdded,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Personalizados');
  const [calories, setCalories] = useState<number>(100);
  const [protein, setProtein] = useState<number>(0);
  const [carbs, setCarbs] = useState<number>(0);
  const [fats, setFats] = useState<number>(0);
  const [fiber, setFiber] = useState<number>(0);
  const [sodium, setSodium] = useState<number>(0);
  const [portionName, setPortionName] = useState('Porção (100g)');
  const [portionGrams, setPortionGrams] = useState<number>(100);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newFood: FoodItem = {
      id: `custom-${Date.now()}`,
      name: name.trim(),
      category,
      baseQty: 100,
      baseUnit: 'g',
      calories: Number(calories),
      protein: Number(protein),
      carbs: Number(carbs),
      fats: Number(fats),
      fiber: Number(fiber),
      sodium: sodium ? Number(sodium) : undefined,
      source: 'custom',
      commonPortions: [
        { name: portionName, weightGrams: portionGrams },
        { name: 'Gramas (g)', weightGrams: 1 },
      ],
    };

    saveCustomFood(newFood);
    onFoodAdded(newFood);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Apple className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">Cadastrar Alimento / Receita</h3>
              <p className="text-xs text-slate-500">Adicione alimentos próprios à sua tabela nutricional</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Nome do Alimento / Marca / Receita *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Bolo de Banana Fit caseiro, Iogurte Grego Proteico..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Categoria
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
            >
              <option value="Personalizados">Personalizados / Receitas Próprias</option>
              <option value="Cereais e Derivados">Cereais e Derivados</option>
              <option value="Carnes e Ovos">Carnes e Ovos</option>
              <option value="Leites e Derivados">Leites e Derivados</option>
              <option value="Frutas">Frutas</option>
              <option value="Suplementos">Suplementos</option>
              <option value="Doces e Sobremesas Fit">Doces e Sobremesas Fit</option>
            </select>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Informações Nutricionais por 100g
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-600">Calorias (kcal) *</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={calories}
                  onChange={(e) => setCalories(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 font-bold"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-blue-700">Proteínas (g)</label>
                <input
                  type="number"
                  step="0.1"
                  value={protein}
                  onChange={(e) => setProtein(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-emerald-700">Carboidratos (g)</label>
                <input
                  type="number"
                  step="0.1"
                  value={carbs}
                  onChange={(e) => setCarbs(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-amber-700">Gorduras (g)</label>
                <input
                  type="number"
                  step="0.1"
                  value={fats}
                  onChange={(e) => setFats(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600">Fibras (g)</label>
                <input
                  type="number"
                  step="0.1"
                  value={fiber}
                  onChange={(e) => setFiber(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600">Sódio (mg)</label>
                <input
                  type="number"
                  value={sodium}
                  onChange={(e) => setSodium(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300"
                />
              </div>
            </div>
          </div>

          {/* Medida caseira padrão */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Medida Caseira Padrão</label>
              <input
                type="text"
                value={portionName}
                onChange={(e) => setPortionName(e.target.value)}
                placeholder="Ex: 1 fatia média (60g)"
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Peso da Porção (g)</label>
              <input
                type="number"
                value={portionGrams}
                onChange={(e) => setPortionGrams(Number(e.target.value))}
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 font-bold"
              />
            </div>
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
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] rounded-xl shadow-xs flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Salvar Alimento</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
