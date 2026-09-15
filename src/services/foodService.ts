import { FoodItem } from '../types';
import { TACO_FOODS } from '../data/tacoFoods';

const CUSTOM_FOODS_STORAGE_KEY = 'nutriplan_custom_foods';

// Normalize string for accent-insensitive search
export function normalizeSearch(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

export function getCustomFoods(): FoodItem[] {
  try {
    const raw = localStorage.getItem(CUSTOM_FOODS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to load custom foods from storage', e);
    return [];
  }
}

export function saveCustomFood(food: FoodItem): void {
  try {
    const existing = getCustomFoods();
    const updated = [food, ...existing.filter(f => f.id !== food.id)];
    localStorage.setItem(CUSTOM_FOODS_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save custom food', e);
  }
}

export async function searchFoods(query: string, includeOnline: boolean = true): Promise<FoodItem[]> {
  if (!query || query.trim().length === 0) {
    return [...TACO_FOODS.slice(0, 20), ...getCustomFoods().slice(0, 10)];
  }

  const normalizedQuery = normalizeSearch(query);
  const terms = normalizedQuery.split(/\s+/);

  // 1. Search custom foods
  const customFoods = getCustomFoods();
  const customMatches = customFoods.filter(item => {
    const norm = normalizeSearch(item.name + ' ' + item.category);
    return terms.every(t => norm.includes(t));
  });

  // 2. Search local TACO database
  const tacoMatches = TACO_FOODS.filter(item => {
    const norm = normalizeSearch(item.name + ' ' + item.category);
    return terms.every(t => norm.includes(t));
  });

  const localResults = [...customMatches, ...tacoMatches];

  // 3. Online fallback (Open Food Facts Brazilian database API) if needed or if few local results
  if (includeOnline && query.length >= 3) {
    try {
      // Debounced or direct fetch with 2.5s timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      const url = `https://br.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(
        query
      )}&search_simple=1&action=process&json=1&page_size=8&fields=product_name,nutriments,brands,serving_size`;

      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        if (data.products && Array.isArray(data.products)) {
          const onlineFoods: FoodItem[] = data.products
            .filter((p: any) => p.product_name && p.nutriments)
            .map((p: any, idx: number) => {
              const nut = p.nutriments || {};
              const energyKcal = Math.round(
                nut['energy-kcal_100g'] || (nut['energy_100g'] ? nut['energy_100g'] / 4.184 : 0)
              );
              const protein = Math.round((nut['proteins_100g'] || 0) * 10) / 10;
              const carbs = Math.round((nut['carbohydrates_100g'] || 0) * 10) / 10;
              const fats = Math.round((nut['fat_100g'] || 0) * 10) / 10;
              const fiber = Math.round((nut['fiber_100g'] || 0) * 10) / 10;
              const sodium = Math.round((nut['sodium_100g'] || 0) * 1000);

              const brand = p.brands ? ` (${p.brands.split(',')[0]})` : '';

              return {
                id: `off-${p._id || idx}-${Date.now()}`,
                name: `${p.product_name}${brand}`,
                category: 'Industrializados / Online',
                baseQty: 100,
                baseUnit: 'g',
                calories: energyKcal,
                protein,
                carbs,
                fats,
                fiber,
                sodium: sodium > 0 ? sodium : undefined,
                source: 'openfoodfacts' as const,
                commonPortions: [
                  { name: 'Porção (100g)', weightGrams: 100 },
                  { name: 'Colher de sopa (20g)', weightGrams: 20 },
                  { name: 'Gramas (g)', weightGrams: 1 }
                ]
              };
            })
            .filter((f: FoodItem) => f.calories > 0 || f.protein > 0 || f.carbs > 0);

          return [...localResults, ...onlineFoods];
        }
      }
    } catch (e) {
      // Gracefully fall back to local results if offline or timeout
    }
  }

  return localResults;
}

// Calculate nutrients based on chosen quantity and portion
export function calculateItemNutrients(
  food: FoodItem,
  quantity: number,
  portionWeightMultiplier: number = 1
) {
  const totalGrams = quantity * portionWeightMultiplier;
  const factor = totalGrams / (food.baseQty || 100);

  return {
    grams: Math.round(totalGrams * 10) / 10,
    calories: Math.round(food.calories * factor * 10) / 10,
    protein: Math.round(food.protein * factor * 10) / 10,
    carbs: Math.round(food.carbs * factor * 10) / 10,
    fats: Math.round(food.fats * factor * 10) / 10,
    fiber: Math.round(food.fiber * factor * 10) / 10,
    sodium: food.sodium ? Math.round(food.sodium * factor) : 0
  };
}
