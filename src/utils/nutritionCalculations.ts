import { Gender } from '../types';

export function calculateAge(birthDateStr: string): number {
  if (!birthDateStr) return 30;
  const birth = new Date(birthDateStr);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return isNaN(age) || age <= 0 ? 30 : age;
}

export function calculateBMI(weightKg: number, heightCm: number): {
  bmi: number;
  classification: string;
  colorClass: string;
} {
  if (!weightKg || !heightCm || heightCm <= 0) {
    return { bmi: 0, classification: 'Dados insuficientes', colorClass: 'text-slate-500' };
  }
  const heightM = heightCm / 100;
  const bmi = Math.round((weightKg / (heightM * heightM)) * 10) / 10;

  let classification = 'Normal (Eutrofia)';
  let colorClass = 'text-emerald-600 bg-emerald-50 border-emerald-200';

  if (bmi < 18.5) {
    classification = 'Abaixo do peso';
    colorClass = 'text-amber-600 bg-amber-50 border-amber-200';
  } else if (bmi >= 18.5 && bmi < 24.9) {
    classification = 'Peso saudável (Eutrófico)';
    colorClass = 'text-emerald-600 bg-emerald-50 border-emerald-200';
  } else if (bmi >= 25 && bmi < 29.9) {
    classification = 'Sobrepeso (Pré-obesidade)';
    colorClass = 'text-yellow-600 bg-yellow-50 border-yellow-200';
  } else if (bmi >= 30 && bmi < 34.9) {
    classification = 'Obesidade Grau I';
    colorClass = 'text-orange-600 bg-orange-50 border-orange-200';
  } else if (bmi >= 35 && bmi < 39.9) {
    classification = 'Obesidade Grau II (Severa)';
    colorClass = 'text-red-600 bg-red-50 border-red-200';
  } else {
    classification = 'Obesidade Grau III (Mórbida)';
    colorClass = 'text-rose-700 bg-rose-50 border-rose-200';
  }

  return { bmi, classification, colorClass };
}

export function calculateWHR(waistCm: number, hipCm: number, gender: Gender): {
  ratio: number;
  risk: string;
  riskLevel: 'low' | 'moderate' | 'high';
} {
  if (!waistCm || !hipCm || hipCm <= 0) {
    return { ratio: 0, risk: 'Sem dados', riskLevel: 'low' };
  }
  const ratio = Math.round((waistCm / hipCm) * 100) / 100;
  const isMale = gender === 'male';

  if (isMale) {
    if (ratio < 0.90) return { ratio, risk: 'Baixo risco cardiovascular', riskLevel: 'low' };
    if (ratio <= 0.99) return { ratio, risk: 'Risco moderado', riskLevel: 'moderate' };
    return { ratio, risk: 'Alto risco cardiovascular', riskLevel: 'high' };
  } else {
    if (ratio < 0.80) return { ratio, risk: 'Baixo risco cardiovascular', riskLevel: 'low' };
    if (ratio <= 0.85) return { ratio, risk: 'Risco moderado', riskLevel: 'moderate' };
    return { ratio, risk: 'Alto risco cardiovascular', riskLevel: 'high' };
  }
}

// Pollock 3 Skinfolds formula:
// Homens: Peitoral, Abdômen, Coxa
// Mulheres: Tríceps, Supra-ilíaca, Coxa
export function calculateBodyFatPollock3(
  gender: Gender,
  age: number,
  sumSkinfoldsMm: number
): number {
  if (!sumSkinfoldsMm || sumSkinfoldsMm <= 0) return 0;

  let bodyDensity = 0;
  if (gender === 'male') {
    bodyDensity =
      1.10938 -
      0.0008267 * sumSkinfoldsMm +
      0.0000016 * Math.pow(sumSkinfoldsMm, 2) -
      0.0002574 * age;
  } else {
    bodyDensity =
      1.0994921 -
      0.0009929 * sumSkinfoldsMm +
      0.0000023 * Math.pow(sumSkinfoldsMm, 2) -
      0.0001392 * age;
  }

  // Siri equation: %Gordura = [(4.95 / Densidade) - 4.50] * 100
  const fatPercent = (4.95 / bodyDensity - 4.5) * 100;
  return Math.max(3, Math.min(60, Math.round(fatPercent * 10) / 10));
}

// Calculate Basal Metabolic Rate (TMB)
export function calculateBMR(
  formula: 'mifflin' | 'harris_benedict' | 'cunningham' | 'schofield',
  weightKg: number,
  heightCm: number,
  age: number,
  gender: Gender,
  leanMassKg?: number
): number {
  if (!weightKg || weightKg <= 0) return 1500;

  const isMale = gender === 'male';

  switch (formula) {
    case 'mifflin': {
      // Mifflin-St Jeor
      const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
      return Math.round(isMale ? base + 5 : base - 161);
    }
    case 'harris_benedict': {
      // Revised Harris-Benedict
      if (isMale) {
        return Math.round(88.362 + 13.397 * weightKg + 4.799 * heightCm - 5.677 * age);
      } else {
        return Math.round(447.593 + 9.247 * weightKg + 3.098 * heightCm - 4.33 * age);
      }
    }
    case 'cunningham': {
      // Cunningham (requires lean mass)
      const lbm = leanMassKg && leanMassKg > 0 ? leanMassKg : weightKg * (isMale ? 0.8 : 0.75);
      return Math.round(500 + 22 * lbm);
    }
    case 'schofield':
    default: {
      if (isMale) {
        if (age < 30) return Math.round(15.057 * weightKg + 672.2);
        if (age < 60) return Math.round(11.472 * weightKg + 873.1);
        return Math.round(11.711 * weightKg + 587.7);
      } else {
        if (age < 30) return Math.round(14.818 * weightKg + 486.6);
        if (age < 60) return Math.round(8.126 * weightKg + 845.6);
        return Math.round(9.082 * weightKg + 658.5);
      }
    }
  }
}

// Recommended water intake in ml
export function calculateWaterRecommendation(
  weightKg: number,
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'intense' = 'moderate'
): number {
  if (!weightKg || weightKg <= 0) return 2000;
  let mlPerKg = 35;
  if (activityLevel === 'light') mlPerKg = 35;
  if (activityLevel === 'moderate') mlPerKg = 40;
  if (activityLevel === 'intense') mlPerKg = 45;

  return Math.round((weightKg * mlPerKg) / 50) * 50; // Rounded to nearest 50ml
}
