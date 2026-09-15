import { FoodItem } from '../types';

export const TACO_FOODS: FoodItem[] = [
  // CEREAIS E DERIVADOS
  {
    id: 'taco-1',
    name: 'Arroz branco cozido',
    category: 'Cereais e Derivados',
    baseQty: 100,
    baseUnit: 'g',
    calories: 128,
    protein: 2.5,
    carbs: 28.1,
    fats: 0.2,
    fiber: 1.6,
    sodium: 1,
    potassium: 35,
    source: 'taco',
    commonPortions: [
      { name: 'Colher de sopa (25g)', weightGrams: 25 },
      { name: 'Colher de servir (50g)', weightGrams: 50 },
      { name: 'Xícara de chá (150g)', weightGrams: 150 },
      { name: 'Gramas (g)', weightGrams: 1 }
    ]
  },
  {
    id: 'taco-2',
    name: 'Arroz integral cozido',
    category: 'Cereais e Derivados',
    baseQty: 100,
    baseUnit: 'g',
    calories: 124,
    protein: 2.6,
    carbs: 25.8,
    fats: 1.0,
    fiber: 2.7,
    sodium: 1,
    potassium: 75,
    source: 'taco',
    commonPortions: [
      { name: 'Colher de sopa (25g)', weightGrams: 25 },
      { name: 'Colher de servir (50g)', weightGrams: 50 },
      { name: 'Xícara de chá (150g)', weightGrams: 150 },
      { name: 'Gramas (g)', weightGrams: 1 }
    ]
  },
  {
    id: 'taco-3',
    name: 'Aveia em flocos',
    category: 'Cereais e Derivados',
    baseQty: 100,
    baseUnit: 'g',
    calories: 394,
    protein: 13.9,
    carbs: 66.6,
    fats: 8.5,
    fiber: 9.1,
    sodium: 5,
    potassium: 337,
    source: 'taco',
    commonPortions: [
      { name: 'Colher de sopa (15g)', weightGrams: 15 },
      { name: 'Colher de sobremesa (10g)', weightGrams: 10 },
      { name: 'Xícara de chá (80g)', weightGrams: 80 },
      { name: 'Gramas (g)', weightGrams: 1 }
    ]
  },
  {
    id: 'taco-4',
    name: 'Farelo de aveia',
    category: 'Cereais e Derivados',
    baseQty: 100,
    baseUnit: 'g',
    calories: 246,
    protein: 17.3,
    carbs: 66.2,
    fats: 7.0,
    fiber: 15.4,
    sodium: 4,
    source: 'taco',
    commonPortions: [
      { name: 'Colher de sopa (10g)', weightGrams: 10 },
      { name: 'Gramas (g)', weightGrams: 1 }
    ]
  },
  {
    id: 'taco-5',
    name: 'Pão de forma tradicional',
    category: 'Pães e Massas',
    baseQty: 100,
    baseUnit: 'g',
    calories: 265,
    protein: 8.0,
    carbs: 50.0,
    fats: 3.2,
    fiber: 2.3,
    sodium: 480,
    source: 'taco',
    commonPortions: [
      { name: 'Fatia (25g)', weightGrams: 25 },
      { name: '2 fatias (50g)', weightGrams: 50 },
      { name: 'Gramas (g)', weightGrams: 1 }
    ]
  },
  {
    id: 'taco-6',
    name: 'Pão de forma 100% integral',
    category: 'Pães e Massas',
    baseQty: 100,
    baseUnit: 'g',
    calories: 240,
    protein: 11.5,
    carbs: 43.0,
    fats: 2.8,
    fiber: 6.9,
    sodium: 390,
    source: 'taco',
    commonPortions: [
      { name: 'Fatia (25g)', weightGrams: 25 },
      { name: '2 fatias (50g)', weightGrams: 50 },
      { name: 'Gramas (g)', weightGrams: 1 }
    ]
  },
  {
    id: 'taco-7',
    name: 'Pão francês',
    category: 'Pães e Massas',
    baseQty: 100,
    baseUnit: 'g',
    calories: 300,
    protein: 8.0,
    carbs: 58.6,
    fats: 3.1,
    fiber: 2.3,
    sodium: 648,
    source: 'taco',
    commonPortions: [
      { name: 'Unidade inteira (50g)', weightGrams: 50 },
      { name: 'Metade (25g)', weightGrams: 25 },
      { name: 'Gramas (g)', weightGrams: 1 }
    ]
  },
  {
    id: 'taco-8',
    name: 'Tapioca (goma hidratada pronta)',
    category: 'Cereais e Derivados',
    baseQty: 100,
    baseUnit: 'g',
    calories: 240,
    protein: 0.1,
    carbs: 60.0,
    fats: 0.1,
    fiber: 0.2,
    sodium: 2,
    source: 'taco',
    commonPortions: [
      { name: 'Colher de sopa (20g)', weightGrams: 20 },
      { name: 'Disco médio pronto (60g)', weightGrams: 60 },
      { name: 'Disco grande pronto (100g)', weightGrams: 100 },
      { name: 'Gramas (g)', weightGrams: 1 }
    ]
  },
  {
    id: 'taco-9',
    name: 'Macarrão cozido (espaguete/penne)',
    category: 'Pães e Massas',
    baseQty: 100,
    baseUnit: 'g',
    calories: 140,
    protein: 5.0,
    carbs: 28.5,
    fats: 0.7,
    fiber: 1.8,
    sodium: 1,
    source: 'taco',
    commonPortions: [
      { name: 'Pegador / Escumadeira (60g)', weightGrams: 60 },
      { name: 'Prato fundo raso (150g)', weightGrams: 150 },
      { name: 'Gramas (g)', weightGrams: 1 }
    ]
  },
  {
    id: 'taco-10',
    name: 'Batata doce cozida',
    category: 'Tubérculos e Raízes',
    baseQty: 100,
    baseUnit: 'g',
    calories: 77,
    protein: 0.6,
    carbs: 18.4,
    fats: 0.1,
    fiber: 2.2,
    potassium: 148,
    source: 'taco',
    commonPortions: [
      { name: 'Unidade pequena (80g)', weightGrams: 80 },
      { name: 'Unidade média (150g)', weightGrams: 150 },
      { name: 'Rodela média (30g)', weightGrams: 30 },
      { name: 'Gramas (g)', weightGrams: 1 }
    ]
  },
  {
    id: 'taco-11',
    name: 'Batata inglesa cozida',
    category: 'Tubérculos e Raízes',
    baseQty: 100,
    baseUnit: 'g',
    calories: 52,
    protein: 1.2,
    carbs: 11.9,
    fats: 0.1,
    fiber: 1.3,
    potassium: 161,
    source: 'taco',
    commonPortions: [
      { name: 'Unidade média (140g)', weightGrams: 140 },
      { name: 'Colher de sopa de purê (30g)', weightGrams: 30 },
      { name: 'Gramas (g)', weightGrams: 1 }
    ]
  },
  {
    id: 'taco-12',
    name: 'Mandioca / Aipim cozido',
    category: 'Tubérculos e Raízes',
    baseQty: 100,
    baseUnit: 'g',
    calories: 125,
    protein: 0.6,
    carbs: 30.1,
    fats: 0.3,
    fiber: 1.6,
    source: 'taco',
    commonPortions: [
      { name: 'Pedaço médio (90g)', weightGrams: 90 },
      { name: 'Gramas (g)', weightGrams: 1 }
    ]
  },

  // LEGUMINOSAS
  {
    id: 'taco-13',
    name: 'Feijão carioca cozido (50% grão/caldo)',
    category: 'Leguminosas',
    baseQty: 100,
    baseUnit: 'g',
    calories: 76,
    protein: 4.8,
    carbs: 13.6,
    fats: 0.5,
    fiber: 8.5,
    sodium: 2,
    iron: 1.3,
    source: 'taco',
    commonPortions: [
      { name: 'Concha média (130g)', weightGrams: 130 },
      { name: 'Colher de sopa cheia (30g)', weightGrams: 30 },
      { name: 'Concha pequena (80g)', weightGrams: 80 },
      { name: 'Gramas (g)', weightGrams: 1 }
    ]
  },
  {
    id: 'taco-14',
    name: 'Feijão preto cozido',
    category: 'Leguminosas',
    baseQty: 100,
    baseUnit: 'g',
    calories: 77,
    protein: 4.5,
    carbs: 14.0,
    fats: 0.5,
    fiber: 8.4,
    iron: 1.5,
    source: 'taco',
    commonPortions: [
      { name: 'Concha média (130g)', weightGrams: 130 },
      { name: 'Colher de sopa (30g)', weightGrams: 30 },
      { name: 'Gramas (g)', weightGrams: 1 }
    ]
  },
  {
    id: 'taco-15',
    name: 'Grão de bico cozido',
    category: 'Leguminosas',
    baseQty: 100,
    baseUnit: 'g',
    calories: 164,
    protein: 8.9,
    carbs: 27.4,
    fats: 2.6,
    fiber: 7.6,
    source: 'taco',
    commonPortions: [
      { name: 'Colher de sopa (25g)', weightGrams: 25 },
      { name: 'Xícara de chá (150g)', weightGrams: 150 },
      { name: 'Gramas (g)', weightGrams: 1 }
    ]
  },
  {
    id: 'taco-16',
    name: 'Lentilha cozida',
    category: 'Leguminosas',
    baseQty: 100,
    baseUnit: 'g',
    calories: 116,
    protein: 9.0,
    carbs: 20.1,
    fats: 0.4,
    fiber: 7.9,
    source: 'taco',
    commonPortions: [
      { name: 'Concha média (120g)', weightGrams: 120 },
      { name: 'Colher de sopa (25g)', weightGrams: 25 },
      { name: 'Gramas (g)', weightGrams: 1 }
    ]
  },

  // PROTEÍNAS E CARNES
  {
    id: 'taco-17',
    name: 'Peito de frango grelhado sem pele',
    category: 'Carnes e Ovos',
    baseQty: 100,
    baseUnit: 'g',
    calories: 159,
    protein: 32.0,
    carbs: 0.0,
    fats: 2.5,
    fiber: 0.0,
    sodium: 50,
    source: 'taco',
    commonPortions: [
      { name: 'Filé médio (100g)', weightGrams: 100 },
      { name: 'Filé grande (150g)', weightGrams: 150 },
      { name: 'Filé pequeno (70g)', weightGrams: 70 },
      { name: 'Desfiado (colher de sopa) (25g)', weightGrams: 25 },
      { name: 'Gramas (g)', weightGrams: 1 }
    ]
  },
  {
    id: 'taco-18',
    name: 'Ovo de galinha inteiro cozido',
    category: 'Carnes e Ovos',
    baseQty: 100,
    baseUnit: 'g',
    calories: 146,
    protein: 13.3,
    carbs: 0.6,
    fats: 9.5,
    fiber: 0.0,
    sodium: 146,
    source: 'taco',
    commonPortions: [
      { name: '1 unidade grande (50g)', weightGrams: 50 },
      { name: '2 unidades (100g)', weightGrams: 100 },
      { name: '1 unidade média (45g)', weightGrams: 45 },
      { name: 'Gramas (g)', weightGrams: 1 }
    ]
  },
  {
    id: 'taco-19',
    name: 'Clara de ovo cozida',
    category: 'Carnes e Ovos',
    baseQty: 100,
    baseUnit: 'g',
    calories: 52,
    protein: 11.0,
    carbs: 0.7,
    fats: 0.2,
    fiber: 0.0,
    source: 'taco',
    commonPortions: [
      { name: '1 clara (35g)', weightGrams: 35 },
      { name: '2 claras (70g)', weightGrams: 70 },
      { name: '3 claras (105g)', weightGrams: 105 },
      { name: 'Gramas (g)', weightGrams: 1 }
    ]
  },
  {
    id: 'taco-20',
    name: 'Patinho bovino moído / grelhado',
    category: 'Carnes e Ovos',
    baseQty: 100,
    baseUnit: 'g',
    calories: 185,
    protein: 30.5,
    carbs: 0.0,
    fats: 6.0,
    fiber: 0.0,
    iron: 2.8,
    source: 'taco',
    commonPortions: [
      { name: 'Bife médio (100g)', weightGrams: 100 },
      { name: 'Colher de sopa de moído (30g)', weightGrams: 30 },
      { name: 'Porção média (120g)', weightGrams: 120 },
      { name: 'Gramas (g)', weightGrams: 1 }
    ]
  },
  {
    id: 'taco-21',
    name: 'Filé mignon bovino grelhado',
    category: 'Carnes e Ovos',
    baseQty: 100,
    baseUnit: 'g',
    calories: 220,
    protein: 32.8,
    carbs: 0.0,
    fats: 8.8,
    fiber: 0.0,
    source: 'taco',
    commonPortions: [
      { name: 'Bife médio (100g)', weightGrams: 100 },
      { name: 'Medalhão (120g)', weightGrams: 120 },
      { name: 'Gramas (g)', weightGrams: 1 }
    ]
  },
  {
    id: 'taco-22',
    name: 'Tilápia / Peixe branco grelhado',
    category: 'Pescados e Frutos do Mar',
    baseQty: 100,
    baseUnit: 'g',
    calories: 128,
    protein: 26.0,
    carbs: 0.0,
    fats: 2.7,
    fiber: 0.0,
    source: 'taco',
    commonPortions: [
      { name: 'Filé médio (120g)', weightGrams: 120 },
      { name: 'Filé pequeno (80g)', weightGrams: 80 },
      { name: 'Gramas (g)', weightGrams: 1 }
    ]
  },
  {
    id: 'taco-23',
    name: 'Salmão fresco grelhado',
    category: 'Pescados e Frutos do Mar',
    baseQty: 100,
    baseUnit: 'g',
    calories: 206,
    protein: 22.1,
    carbs: 0.0,
    fats: 12.3,
    fiber: 0.0,
    source: 'taco',
    commonPortions: [
      { name: 'Posta média (120g)', weightGrams: 120 },
      { name: 'Filé (150g)', weightGrams: 150 },
      { name: 'Gramas (g)', weightGrams: 1 }
    ]
  },
  {
    id: 'taco-24',
    name: 'Atum ralado em água (conserva)',
    category: 'Pescados e Frutos do Mar',
    baseQty: 100,
    baseUnit: 'g',
    calories: 116,
    protein: 25.5,
    carbs: 0.0,
    fats: 0.8,
    fiber: 0.0,
    sodium: 350,
    source: 'taco',
    commonPortions: [
      { name: 'Lata escorrida (120g)', weightGrams: 120 },
      { name: 'Metade da lata (60g)', weightGrams: 60 },
      { name: 'Colher de sopa (25g)', weightGrams: 25 },
      { name: 'Gramas (g)', weightGrams: 1 }
    ]
  },

  // LATICÍNIOS
  {
    id: 'taco-25',
    name: 'Leite desnatado',
    category: 'Leites e Derivados',
    baseQty: 100,
    baseUnit: 'ml',
    calories: 35,
    protein: 3.4,
    carbs: 5.0,
    fats: 0.1,
    fiber: 0.0,
    calcium: 120,
    source: 'taco',
    commonPortions: [
      { name: 'Copo americano (200ml)', weightGrams: 200 },
      { name: 'Caneca (250ml)', weightGrams: 250 },
      { name: 'ml', weightGrams: 1 }
    ]
  },
  {
    id: 'taco-26',
    name: 'Leite integral',
    category: 'Leites e Derivados',
    baseQty: 100,
    baseUnit: 'ml',
    calories: 61,
    protein: 3.2,
    carbs: 4.8,
    fats: 3.2,
    fiber: 0.0,
    calcium: 118,
    source: 'taco',
    commonPortions: [
      { name: 'Copo americano (200ml)', weightGrams: 200 },
      { name: 'ml', weightGrams: 1 }
    ]
  },
  {
    id: 'taco-27',
    name: 'Iogurte natural desnatado',
    category: 'Leites e Derivados',
    baseQty: 100,
    baseUnit: 'g',
    calories: 43,
    protein: 4.2,
    carbs: 6.0,
    fats: 0.3,
    fiber: 0.0,
    calcium: 150,
    source: 'taco',
    commonPortions: [
      { name: 'Pote individual (160g)', weightGrams: 160 },
      { name: 'Pote individual (170g)', weightGrams: 170 },
      { name: 'Colher de sopa (20g)', weightGrams: 20 },
      { name: 'Gramas (g)', weightGrams: 1 }
    ]
  },
  {
    id: 'taco-28',
    name: 'Queijo cottage',
    category: 'Leites e Derivados',
    baseQty: 100,
    baseUnit: 'g',
    calories: 98,
    protein: 11.0,
    carbs: 3.4,
    fats: 4.3,
    fiber: 0.0,
    source: 'taco',
    commonPortions: [
      { name: 'Colher de sopa (30g)', weightGrams: 30 },
      { name: '2 colheres de sopa (60g)', weightGrams: 60 },
      { name: 'Gramas (g)', weightGrams: 1 }
    ]
  },
  {
    id: 'taco-29',
    name: 'Queijo minas frescal',
    category: 'Leites e Derivados',
    baseQty: 100,
    baseUnit: 'g',
    calories: 227,
    protein: 17.4,
    carbs: 3.2,
    fats: 16.0,
    fiber: 0.0,
    sodium: 400,
    source: 'taco',
    commonPortions: [
      { name: 'Fatia média (30g)', weightGrams: 30 },
      { name: 'Fatia grossa (50g)', weightGrams: 50 },
      { name: 'Gramas (g)', weightGrams: 1 }
    ]
  },
  {
    id: 'taco-30',
    name: 'Queijo muçarela',
    category: 'Leites e Derivados',
    baseQty: 100,
    baseUnit: 'g',
    calories: 280,
    protein: 22.0,
    carbs: 2.2,
    fats: 20.5,
    fiber: 0.0,
    sodium: 580,
    source: 'taco',
    commonPortions: [
      { name: 'Fatia (20g)', weightGrams: 20 },
      { name: '2 fatias (40g)', weightGrams: 40 },
      { name: 'Gramas (g)', weightGrams: 1 }
    ]
  },
  {
    id: 'taco-31',
    name: 'Requeijão cremoso light',
    category: 'Leites e Derivados',
    baseQty: 100,
    baseUnit: 'g',
    calories: 160,
    protein: 9.0,
    carbs: 3.0,
    fats: 12.0,
    fiber: 0.0,
    sodium: 450,
    source: 'taco',
    commonPortions: [
      { name: 'Colher de sopa (30g)', weightGrams: 30 },
      { name: 'Colher de sobremesa (15g)', weightGrams: 15 },
      { name: 'Gramas (g)', weightGrams: 1 }
    ]
  },

  // SUPLEMENTOS E PROTEÍNAS EM PÓ
  {
    id: 'taco-32',
    name: 'Whey Protein Concentrado 80%',
    category: 'Suplementos',
    baseQty: 100,
    baseUnit: 'g',
    calories: 400,
    protein: 80.0,
    carbs: 6.0,
    fats: 6.0,
    fiber: 0.0,
    source: 'taco',
    commonPortions: [
      { name: '1 Scoop / Dosador (30g)', weightGrams: 30 },
      { name: '1.5 Scoop (45g)', weightGrams: 45 },
      { name: 'Gramas (g)', weightGrams: 1 }
    ]
  },
  {
    id: 'taco-33',
    name: 'Whey Protein Isolado 90%',
    category: 'Suplementos',
    baseQty: 100,
    baseUnit: 'g',
    calories: 370,
    protein: 90.0,
    carbs: 1.0,
    fats: 0.8,
    fiber: 0.0,
    source: 'taco',
    commonPortions: [
      { name: '1 Scoop / Dosador (30g)', weightGrams: 30 },
      { name: 'Gramas (g)', weightGrams: 1 }
    ]
  },
  {
    id: 'taco-34',
    name: 'Creatina Monohidratada',
    category: 'Suplementos',
    baseQty: 100,
    baseUnit: 'g',
    calories: 0,
    protein: 0.0,
    carbs: 0.0,
    fats: 0.0,
    fiber: 0.0,
    source: 'taco',
    commonPortions: [
      { name: 'Dose padrão (3g)', weightGrams: 3 },
      { name: 'Dose (5g)', weightGrams: 5 },
      { name: 'Gramas (g)', weightGrams: 1 }
    ]
  },

  // FRUTAS
  {
    id: 'taco-35',
    name: 'Banana prata crua',
    category: 'Frutas',
    baseQty: 100,
    baseUnit: 'g',
    calories: 89,
    protein: 1.3,
    carbs: 22.8,
    fats: 0.1,
    fiber: 2.0,
    potassium: 358,
    source: 'taco',
    commonPortions: [
      { name: 'Unidade média (70g)', weightGrams: 70 },
      { name: 'Unidade grande (100g)', weightGrams: 100 },
      { name: 'Gramas (g)', weightGrams: 1 }
    ]
  },
  {
    id: 'taco-36',
    name: 'Maçã gala com casca',
    category: 'Frutas',
    baseQty: 100,
    baseUnit: 'g',
    calories: 56,
    protein: 0.3,
    carbs: 14.8,
    fats: 0.2,
    fiber: 2.0,
    source: 'taco',
    commonPortions: [
      { name: 'Unidade média (130g)', weightGrams: 130 },
      { name: 'Unidade pequena (90g)', weightGrams: 90 },
      { name: 'Gramas (g)', weightGrams: 1 }
    ]
  },
  {
    id: 'taco-37',
    name: 'Mamão papaia cru',
    category: 'Frutas',
    baseQty: 100,
    baseUnit: 'g',
    calories: 40,
    protein: 0.5,
    carbs: 10.4,
    fats: 0.1,
    fiber: 1.8,
    vitaminC: 61,
    source: 'taco',
    commonPortions: [
      { name: 'Metade de unidade média (140g)', weightGrams: 140 },
      { name: 'Fatia média (100g)', weightGrams: 100 },
      { name: 'Gramas (g)', weightGrams: 1 }
    ]
  },
  {
    id: 'taco-38',
    name: 'Abacate cru',
    category: 'Frutas',
    baseQty: 100,
    baseUnit: 'g',
    calories: 96,
    protein: 1.2,
    carbs: 6.0,
    fats: 8.4,
    fiber: 6.3,
    source: 'taco',
    commonPortions: [
      { name: 'Colher de sopa cheia (40g)', weightGrams: 40 },
      { name: '1/4 de unidade (100g)', weightGrams: 100 },
      { name: 'Gramas (g)', weightGrams: 1 }
    ]
  },
  {
    id: 'taco-39',
    name: 'Morango cru',
    category: 'Frutas',
    baseQty: 100,
    baseUnit: 'g',
    calories: 30,
    protein: 0.9,
    carbs: 6.8,
    fats: 0.3,
    fiber: 1.7,
    vitaminC: 63,
    source: 'taco',
    commonPortions: [
      { name: 'Xícara de morangos (150g)', weightGrams: 150 },
      { name: '5 unidades médias (75g)', weightGrams: 75 },
      { name: 'Gramas (g)', weightGrams: 1 }
    ]
  },
  {
    id: 'taco-40',
    name: 'Laranja pera crua',
    category: 'Frutas',
    baseQty: 100,
    baseUnit: 'g',
    calories: 37,
    protein: 1.0,
    carbs: 8.9,
    fats: 0.1,
    fiber: 1.7,
    vitaminC: 73,
    source: 'taco',
    commonPortions: [
      { name: 'Unidade média (130g)', weightGrams: 130 },
      { name: 'Gramas (g)', weightGrams: 1 }
    ]
  },
  {
    id: 'taco-41',
    name: 'Uva roxa / Thompson',
    category: 'Frutas',
    baseQty: 100,
    baseUnit: 'g',
    calories: 53,
    protein: 0.7,
    carbs: 13.6,
    fats: 0.2,
    fiber: 0.9,
    source: 'taco',
    commonPortions: [
      { name: 'Cacho pequeno (100g)', weightGrams: 100 },
      { name: '10 bagos (50g)', weightGrams: 50 },
      { name: 'Gramas (g)', weightGrams: 1 }
    ]
  },

  // VERDURAS E LEGUMES
  {
    id: 'taco-42',
    name: 'Alface americana / crespa crua',
    category: 'Verduras e Hortaliças',
    baseQty: 100,
    baseUnit: 'g',
    calories: 14,
    protein: 1.3,
    carbs: 2.2,
    fats: 0.2,
    fiber: 1.8,
    source: 'taco',
    commonPortions: [
      { name: 'Prato de sobremesa cheio (50g)', weightGrams: 50 },
      { name: '3 folhas grandes (30g)', weightGrams: 30 },
      { name: 'Gramas (g)', weightGrams: 1 }
    ]
  },
  {
    id: 'taco-43',
    name: 'Tomate cru',
    category: 'Verduras e Hortaliças',
    baseQty: 100,
    baseUnit: 'g',
    calories: 15,
    protein: 1.1,
    carbs: 3.1,
    fats: 0.2,
    fiber: 1.2,
    source: 'taco',
    commonPortions: [
      { name: 'Unidade média (100g)', weightGrams: 100 },
      { name: '3 rodelas (40g)', weightGrams: 40 },
      { name: 'Gramas (g)', weightGrams: 1 }
    ]
  },
  {
    id: 'taco-44',
    name: 'Cenoura crua ralada',
    category: 'Verduras e Hortaliças',
    baseQty: 100,
    baseUnit: 'g',
    calories: 34,
    protein: 1.3,
    carbs: 7.7,
    fats: 0.2,
    fiber: 3.2,
    source: 'taco',
    commonPortions: [
      { name: 'Colher de sopa (20g)', weightGrams: 20 },
      { name: 'Xícara ralada (70g)', weightGrams: 70 },
      { name: 'Gramas (g)', weightGrams: 1 }
    ]
  },
  {
    id: 'taco-45',
    name: 'Brócolis cozido no vapor',
    category: 'Verduras e Hortaliças',
    baseQty: 100,
    baseUnit: 'g',
    calories: 25,
    protein: 2.1,
    carbs: 4.4,
    fats: 0.5,
    fiber: 3.4,
    calcium: 51,
    source: 'taco',
    commonPortions: [
      { name: 'Xícara de flores (80g)', weightGrams: 80 },
      { name: 'Colher de servir (50g)', weightGrams: 50 },
      { name: 'Gramas (g)', weightGrams: 1 }
    ]
  },
  {
    id: 'taco-46',
    name: 'Abobrinha italiana cozida',
    category: 'Verduras e Hortaliças',
    baseQty: 100,
    baseUnit: 'g',
    calories: 15,
    protein: 1.1,
    carbs: 3.0,
    fats: 0.2,
    fiber: 1.6,
    source: 'taco',
    commonPortions: [
      { name: 'Colher de servir (45g)', weightGrams: 45 },
      { name: 'Gramas (g)', weightGrams: 1 }
    ]
  },

  // OLEAGINOSAS E GORDURAS BOAS
  {
    id: 'taco-47',
    name: 'Azeite de oliva extravirgem',
    category: 'Óleos e Gorduras',
    baseQty: 100,
    baseUnit: 'g',
    calories: 884,
    protein: 0.0,
    carbs: 0.0,
    fats: 100.0,
    fiber: 0.0,
    source: 'taco',
    commonPortions: [
      { name: 'Colher de sopa (13ml / 12g)', weightGrams: 12 },
      { name: 'Colher de sobremesa (8g)', weightGrams: 8 },
      { name: 'Colher de chá (4g)', weightGrams: 4 },
      { name: 'Gramas (g)', weightGrams: 1 }
    ]
  },
  {
    id: 'taco-48',
    name: 'Pasta de amendoim integral 100%',
    category: 'Oleaginosas e Sementes',
    baseQty: 100,
    baseUnit: 'g',
    calories: 590,
    protein: 28.0,
    carbs: 18.0,
    fats: 50.0,
    fiber: 7.0,
    source: 'taco',
    commonPortions: [
      { name: 'Colher de sopa rasa (15g)', weightGrams: 15 },
      { name: 'Colher de sopa cheia (30g)', weightGrams: 30 },
      { name: 'Colher de chá (7g)', weightGrams: 7 },
      { name: 'Gramas (g)', weightGrams: 1 }
    ]
  },
  {
    id: 'taco-49',
    name: 'Castanha-do-pará (Castanha-do-Brasil)',
    category: 'Oleaginosas e Sementes',
    baseQty: 100,
    baseUnit: 'g',
    calories: 643,
    protein: 14.5,
    carbs: 15.1,
    fats: 63.5,
    fiber: 7.9,
    source: 'taco',
    commonPortions: [
      { name: '1 unidade (4g)', weightGrams: 4 },
      { name: '2 unidades (8g)', weightGrams: 8 },
      { name: 'Gramas (g)', weightGrams: 1 }
    ]
  },
  {
    id: 'taco-50',
    name: 'Semente de chia',
    category: 'Oleaginosas e Sementes',
    baseQty: 100,
    baseUnit: 'g',
    calories: 486,
    protein: 16.5,
    carbs: 42.1,
    fats: 30.7,
    fiber: 34.4,
    source: 'taco',
    commonPortions: [
      { name: 'Colher de sopa (15g)', weightGrams: 15 },
      { name: 'Colher de sobremesa (10g)', weightGrams: 10 },
      { name: 'Gramas (g)', weightGrams: 1 }
    ]
  }
];
