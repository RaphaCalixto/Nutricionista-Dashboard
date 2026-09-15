export type Gender = 'male' | 'female';

export type PatientGoal = 
  | 'weight_loss' 
  | 'hypertrophy' 
  | 'maintenance' 
  | 'health_clinical' 
  | 'performance' 
  | 'pregnancy_lactation';

export interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  birthDate: string; // YYYY-MM-DD
  gender: Gender;
  occupation?: string;
  goal: PatientGoal;
  status: 'active' | 'inactive';
  photoUrl?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Anamnesis {
  id: string;
  patientId: string;
  mainComplaint: string;
  clinicalHistory: {
    pathologies: string[];
    familyHistory: string[];
    medications: string;
    surgeries: string;
    bowelHabits: string;
  };
  lifestyle: {
    sleepHours: number;
    stressLevel: 'low' | 'moderate' | 'high';
    smoking: boolean;
    alcohol: string;
    physicalActivity: string;
    activityFrequency: string;
  };
  dietaryHistory: {
    waterIntakeMl: number;
    preferredFoods: string;
    dislikedFoods: string;
    allergies: string[];
    foodIntolerances: string[];
    appetite: string;
    recall24h: string;
    weekendHabits: string;
  };
  updatedAt: string;
}

export interface Anthropometry {
  id: string;
  patientId: string;
  date: string; // YYYY-MM-DD
  weight: number; // kg
  height: number; // cm
  bmi: number;
  bodyFatPercentage?: number;
  fatMassKg?: number;
  leanMassKg?: number;
  // Circumferences in cm
  waist?: number;
  abdomen?: number;
  hip?: number;
  armRelaxed?: number;
  armContracted?: number;
  thigh?: number;
  chest?: number;
  calf?: number;
  // Skinfolds in mm
  skinfoldTriceps?: number;
  skinfoldSubscapular?: number;
  skinfoldSuprailiac?: number;
  skinfoldAbdominal?: number;
  skinfoldThigh?: number;
  skinfoldChest?: number;
  protocol: 'pollock_3' | 'pollock_7' | 'faulkner' | 'bioimpedance' | 'manual';
  notes?: string;
}

export interface EnergyCalculation {
  id?: string;
  patientId: string;
  formula: 'mifflin' | 'harris_benedict' | 'cunningham' | 'schofield';
  bmr: number; // TMB (kcal)
  activityFactor: number;
  tdee: number; // GET (kcal)
  goalAdjustmentCalories: number;
  targetCalories: number;
  proteinGrams: number;
  proteinGPerKg: number;
  proteinPercent: number;
  carbGrams: number;
  carbPercent: number;
  fatGrams: number;
  fatPercent: number;
}

export interface FoodItem {
  id: string;
  name: string;
  category: string;
  baseQty: number;
  baseUnit: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  sodium?: number;
  potassium?: number;
  calcium?: number;
  iron?: number;
  vitaminC?: number;
  source: 'taco' | 'openfoodfacts' | 'usda' | 'custom';
  commonPortions?: {
    name: string;
    weightGrams: number;
  }[];
}

export interface DietMealItem {
  id: string;
  foodId: string;
  foodName: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  notes?: string;
  substitutes?: string[];
}

export interface DietMeal {
  id: string;
  name: string;
  time: string; // HH:mm
  order: number;
  items: DietMealItem[];
  notes?: string;
}

export interface DietPlan {
  id: string;
  patientId: string;
  title: string;
  description?: string;
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFats: number;
  meals: DietMeal[];
  guidelines?: string[];
  waterTargetMl?: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export type AppointmentStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
export type AppointmentType = 'first_consultation' | 'follow_up' | 'evaluation' | 'online';

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  durationMinutes: number;
  type: AppointmentType;
  status: AppointmentStatus;
  price?: number;
  paid?: boolean;
  notes?: string;
  meetUrl?: string;
  createdAt: string;
}

export interface Supplement {
  id: string;
  patientId: string;
  name: string;
  dosage: string;
  timing: string;
  instructions: string;
  active: boolean;
  createdAt: string;
}

export interface EvolutionPhoto {
  id: string;
  patientId: string;
  date: string; // YYYY-MM-DD
  angle: 'front' | 'side' | 'back' | 'other';
  photoUrl: string;
  weight?: number;
  notes?: string;
  createdAt: string;
}

export interface ClinicProfile {
  nutritionistName: string;
  crn: string;
  clinicName: string;
  email: string;
  phone: string;
  address: string;
  logoUrl?: string;
  instagram?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  createdAt: string;
}

export interface AuthSession {
  user: User;
  token?: string;
}

