import type { Patient, Anamnesis, Anthropometry, DietPlan, Appointment, Supplement, EvolutionPhoto, ClinicProfile } from '../types';

export const INITIAL_CLINIC_PROFILE: ClinicProfile = {
  nutritionistName: '',
  crn: '',
  clinicName: '',
  email: '',
  phone: '',
  address: '',
  instagram: ''
};

export const INITIAL_PATIENTS: Patient[] = [];

export const INITIAL_ANAMNESIS: Record<string, Anamnesis> = {};

export const INITIAL_ANTHROPOMETRY: Record<string, Anthropometry[]> = {};

export const INITIAL_DIET_PLANS: Record<string, DietPlan[]> = {};

export const INITIAL_APPOINTMENTS: Appointment[] = [];

export const INITIAL_SUPPLEMENTS: Record<string, Supplement[]> = {};

export const INITIAL_EVOLUTION_PHOTOS: Record<string, EvolutionPhoto[]> = {};
