import { supabase } from './supabase';
import { getCurrentUser, DEMO_USER } from './auth';
import type {
  Patient,
  Anamnesis,
  Anthropometry,
  DietPlan,
  Appointment,
  Supplement,
  EvolutionPhoto,
  ClinicProfile
} from '../types';
import {
  INITIAL_PATIENTS,
  INITIAL_ANAMNESIS,
  INITIAL_ANTHROPOMETRY,
  INITIAL_DIET_PLANS,
  INITIAL_APPOINTMENTS,
  INITIAL_SUPPLEMENTS,
  INITIAL_EVOLUTION_PHOTOS,
  INITIAL_CLINIC_PROFILE
} from '../data/mockData';

// Helper to generate RFC4122 UUID v4
export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function isUUID(str?: string | null): boolean {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
}

export function ensureUUID(str?: string | null): string {
  if (str && isUUID(str)) return str;
  if (str === 'pat-raphael' || str === 'raphael') return '00000000-0000-4000-8000-000000000001';
  if (str === 'pat-1' || str === 'camila') return '00000000-0000-4000-8000-000000000002';
  return generateUUID();
}

// Helper to get active user ID
export function getActiveUserId(): string {
  const user = getCurrentUser();
  return user ? user.id : DEMO_USER.id;
}

// Get user-isolated storage key
function getUserKey(base: string, userId?: string): string {
  const uid = userId || getActiveUserId();
  return `nutriplan_${uid}_${base}`;
}

// Helper to read local storage with tenant-aware fallback
function getLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw !== null) {
      return JSON.parse(raw);
    }
  } catch (e) {}
  return fallback;
}

// Helper to write local storage
function setLocal<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error saving to localStorage [${key}]`, e);
  }
}

// Check Supabase connection health
export async function checkSupabaseConnection(): Promise<{ connected: boolean; message: string }> {
  try {
    const timeoutPromise = new Promise<{ connected: boolean; message: string }>((_, reject) =>
      setTimeout(() => reject(new Error('Timeout de conexão')), 4000)
    );

    const checkPromise = (async () => {
      const { error } = await supabase.from('patients').select('id').limit(1);
      if (error) {
        return { connected: false, message: `Erro Supabase: ${error.message}` };
      }
      return { connected: true, message: 'Supabase conectado e sincronizado com sucesso!' };
    })();

    return await Promise.race([checkPromise, timeoutPromise]);
  } catch (err: any) {
    return {
      connected: false,
      message: 'Modo local ativo.'
    };
  }
}

// Helper to extract and encode user ownership in metadata
export interface UserRecordMetadata {
  ownerId: string;
  notes?: string;
}

export function encodeUserMetadata(userId: string, rawNotes?: string | null): string {
  const payload: UserRecordMetadata = {
    ownerId: userId,
    notes: rawNotes || '',
  };
  return `__NUTRI_META__${JSON.stringify(payload)}`;
}

export function decodeUserMetadata(rawNotes?: string | null): { ownerId: string | null; cleanNotes: string } {
  if (!rawNotes) return { ownerId: null, cleanNotes: '' };
  if (typeof rawNotes === 'string' && rawNotes.startsWith('__NUTRI_META__')) {
    try {
      const jsonStr = rawNotes.substring('__NUTRI_META__'.length);
      const parsed = JSON.parse(jsonStr) as UserRecordMetadata;
      return {
        ownerId: parsed.ownerId || null,
        cleanNotes: parsed.notes || '',
      };
    } catch (e) {}
  }
  return { ownerId: null, cleanNotes: rawNotes };
}

// ==================== PATIENTS API ====================
export async function getPatients(): Promise<Patient[]> {
  const userId = getActiveUserId();
  const isDemo = userId === DEMO_USER.id;
  const storageKey = getUserKey('patients', userId);

  try {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .order('name');

    if (!error && data) {
      // Filter strictly by the active logged-in user
      const userPatients = data.filter((p: any) => {
        const { ownerId } = decodeUserMetadata(p.notes);
        // If owner is explicitly set, must match userId
        if (ownerId) return ownerId === userId;
        // If owner is not set (legacy row), only the default demo user sees it
        return isDemo;
      });

      const mapped: Patient[] = userPatients.map((p: any) => {
        const { cleanNotes } = decodeUserMetadata(p.notes);
        return {
          id: p.id,
          name: p.name,
          email: p.email || '',
          phone: p.phone || '',
          birthDate: p.birth_date || '',
          gender: p.gender || 'female',
          occupation: p.occupation || '',
          goal: p.goal || 'weight_loss',
          status: p.status || 'active',
          photoUrl: p.photo_url || '',
          notes: cleanNotes,
          createdAt: p.created_at || new Date().toISOString(),
          updatedAt: p.updated_at || new Date().toISOString(),
        };
      });

      setLocal(storageKey, mapped);
      return mapped;
    }
  } catch (e) {}

  return getLocal<Patient[]>(storageKey, isDemo ? INITIAL_PATIENTS : []);
}

export async function savePatient(patient: Partial<Patient> & { name: string }): Promise<Patient> {
  const userId = getActiveUserId();
  const isDemo = userId === DEMO_USER.id;
  const storageKey = getUserKey('patients', userId);
  const current = getLocal<Patient[]>(storageKey, isDemo ? INITIAL_PATIENTS : []);
  const now = new Date().toISOString();
  let savedPatient: Patient;

  const validId = ensureUUID(patient.id);

  if (patient.id && current.some(p => p.id === patient.id)) {
    savedPatient = {
      ...(current.find(p => p.id === patient.id) as Patient),
      ...patient,
      id: validId,
      updatedAt: now,
    } as Patient;
    const updated = current.map(p => (p.id === patient.id ? savedPatient : p));
    setLocal(storageKey, updated);
  } else {
    savedPatient = {
      id: validId,
      name: patient.name,
      email: patient.email || '',
      phone: patient.phone || '',
      birthDate: patient.birthDate || '1995-01-01',
      gender: patient.gender || 'female',
      occupation: patient.occupation || '',
      goal: patient.goal || 'weight_loss',
      status: patient.status || 'active',
      photoUrl: patient.photoUrl || '',
      notes: patient.notes || '',
      createdAt: now,
      updatedAt: now,
    };
    setLocal(storageKey, [savedPatient, ...current]);
  }

  try {
    const encodedNotes = encodeUserMetadata(userId, savedPatient.notes);
    await supabase.from('patients').upsert({
      id: savedPatient.id,
      name: savedPatient.name,
      email: savedPatient.email || null,
      phone: savedPatient.phone || null,
      birth_date: savedPatient.birthDate || null,
      gender: savedPatient.gender,
      occupation: savedPatient.occupation || null,
      goal: savedPatient.goal,
      status: savedPatient.status,
      photo_url: savedPatient.photoUrl || null,
      notes: encodedNotes,
      updated_at: savedPatient.updatedAt,
    });
  } catch (e) {}

  return savedPatient;
}

export async function deletePatient(id: string): Promise<void> {
  const userId = getActiveUserId();
  const storageKey = getUserKey('patients', userId);
  const current = getLocal<Patient[]>(storageKey, []);
  setLocal(storageKey, current.filter(p => p.id !== id));
  try {
    await supabase.from('patients').delete().eq('id', id);
  } catch (e) {}
}

// ==================== ANAMNESIS API ====================
export async function getAnamnesis(patientId: string): Promise<Anamnesis | null> {
  const userId = getActiveUserId();
  const isDemo = userId === DEMO_USER.id;
  const storageKey = getUserKey('anamnesis', userId);

  try {
    const { data, error } = await supabase.from('anamnesis').select('*').eq('patient_id', patientId).maybeSingle();
    if (!error && data) {
      return {
        id: data.id,
        patientId: data.patient_id,
        mainComplaint: data.main_complaint || '',
        clinicalHistory: data.clinical_history || {},
        lifestyle: data.lifestyle || {},
        dietaryHistory: data.dietary_history || {},
        updatedAt: data.updated_at || new Date().toISOString(),
      };
    }
  } catch (e) {}

  const all = getLocal<Record<string, Anamnesis>>(storageKey, isDemo ? INITIAL_ANAMNESIS : {});
  return all[patientId] || null;
}

export async function saveAnamnesis(anamnesis: Anamnesis): Promise<Anamnesis> {
  const userId = getActiveUserId();
  const isDemo = userId === DEMO_USER.id;
  const storageKey = getUserKey('anamnesis', userId);
  const all = getLocal<Record<string, Anamnesis>>(storageKey, isDemo ? INITIAL_ANAMNESIS : {});
  
  const updated = {
    ...anamnesis,
    updatedAt: new Date().toISOString(),
  };
  all[anamnesis.patientId] = updated;
  setLocal(storageKey, all);

  try {
    await supabase.from('anamnesis').upsert({
      patient_id: updated.patientId,
      main_complaint: updated.mainComplaint,
      clinical_history: updated.clinicalHistory,
      lifestyle: updated.lifestyle,
      dietary_history: updated.dietaryHistory,
      updated_at: updated.updatedAt,
    });
  } catch (e) {}

  return updated;
}

// ==================== ANTHROPOMETRY API ====================
export async function getAnthropometry(patientId: string): Promise<Anthropometry[]> {
  const userId = getActiveUserId();
  const isDemo = userId === DEMO_USER.id;
  const storageKey = getUserKey('anthropometry', userId);

  try {
    const { data, error } = await supabase
      .from('anthropometry')
      .select('*')
      .eq('patient_id', patientId)
      .order('date', { ascending: true });
    if (!error && data && data.length > 0) {
      const mapped: Anthropometry[] = data.map((a: any) => ({
        id: a.id,
        patientId: a.patient_id,
        date: a.date,
        weight: Number(a.weight),
        height: Number(a.height),
        bmi: Number(a.bmi),
        bodyFatPercentage: a.body_fat_percentage ? Number(a.body_fat_percentage) : undefined,
        fatMassKg: a.fat_mass_kg ? Number(a.fat_mass_kg) : undefined,
        leanMassKg: a.lean_mass_kg ? Number(a.lean_mass_kg) : undefined,
        waist: a.waist ? Number(a.waist) : undefined,
        abdomen: a.abdomen ? Number(a.abdomen) : undefined,
        hip: a.hip ? Number(a.hip) : undefined,
        armRelaxed: a.arm_relaxed ? Number(a.arm_relaxed) : undefined,
        armContracted: a.arm_contracted ? Number(a.arm_contracted) : undefined,
        thigh: a.thigh ? Number(a.thigh) : undefined,
        chest: a.chest ? Number(a.chest) : undefined,
        calf: a.calf ? Number(a.calf) : undefined,
        skinfoldTriceps: a.skinfold_triceps ? Number(a.skinfold_triceps) : undefined,
        skinfoldSubscapular: a.skinfold_subscapular ? Number(a.skinfold_subscapular) : undefined,
        skinfoldSuprailiac: a.skinfold_suprailiac ? Number(a.skinfold_suprailiac) : undefined,
        skinfoldAbdominal: a.skinfold_abdominal ? Number(a.skinfold_abdominal) : undefined,
        skinfoldThigh: a.skinfold_thigh ? Number(a.skinfold_thigh) : undefined,
        skinfoldChest: a.skinfold_chest ? Number(a.skinfold_chest) : undefined,
        protocol: a.protocol || 'pollock_3',
        notes: a.notes || '',
      }));
      return mapped;
    }
  } catch (e) {}

  const all = getLocal<Record<string, Anthropometry[]>>(storageKey, isDemo ? INITIAL_ANTHROPOMETRY : {});
  return all[patientId] || [];
}

export async function addAnthropometry(entry: Anthropometry): Promise<Anthropometry> {
  const userId = getActiveUserId();
  const isDemo = userId === DEMO_USER.id;
  const storageKey = getUserKey('anthropometry', userId);
  const all = getLocal<Record<string, Anthropometry[]>>(storageKey, isDemo ? INITIAL_ANTHROPOMETRY : {});
  
  const patientList = all[entry.patientId] || [];
  const validId = ensureUUID(entry.id);
  const newEntry = {
    ...entry,
    id: validId
  };
  const exists = patientList.some((a) => a.id === newEntry.id);
  const updatedList = exists
    ? patientList.map((a) => (a.id === newEntry.id ? newEntry : a))
    : [...patientList, newEntry];

  all[entry.patientId] = updatedList.sort((a, b) => a.date.localeCompare(b.date));
  setLocal(storageKey, all);

  try {
    await supabase.from('anthropometry').upsert({
      id: newEntry.id,
      patient_id: entry.patientId,
      date: entry.date,
      weight: entry.weight,
      height: entry.height,
      bmi: entry.bmi,
      body_fat_percentage: entry.bodyFatPercentage || null,
      fat_mass_kg: entry.fatMassKg || null,
      lean_mass_kg: entry.leanMassKg || null,
      waist: entry.waist || null,
      abdomen: entry.abdomen || null,
      hip: entry.hip || null,
      arm_relaxed: entry.armRelaxed || null,
      arm_contracted: entry.armContracted || null,
      thigh: entry.thigh || null,
      chest: entry.chest || null,
      calf: entry.calf || null,
      skinfold_triceps: entry.skinfoldTriceps || null,
      skinfold_subscapular: entry.skinfoldSubscapular || null,
      skinfold_suprailiac: entry.skinfoldSuprailiac || null,
      skinfold_abdominal: entry.skinfoldAbdominal || null,
      skinfold_thigh: entry.skinfoldThigh || null,
      skinfold_chest: entry.skinfoldChest || null,
      protocol: entry.protocol,
      notes: entry.notes || null,
    });
  } catch (e) {}

  return newEntry;
}

export async function deleteAnthropometry(patientId: string, id: string): Promise<void> {
  const userId = getActiveUserId();
  const storageKey = getUserKey('anthropometry', userId);
  const all = getLocal<Record<string, Anthropometry[]>>(storageKey, {});
  if (all[patientId]) {
    all[patientId] = all[patientId].filter(a => a.id !== id);
    setLocal(storageKey, all);
  }
  try {
    await supabase.from('anthropometry').delete().eq('id', id);
  } catch (e) {}
}

// ==================== DIET PLANS API ====================
export async function getDietPlans(patientId: string): Promise<DietPlan[]> {
  const userId = getActiveUserId();
  const isDemo = userId === DEMO_USER.id;
  const storageKey = getUserKey('diet_plans', userId);

  try {
    const { data, error } = await supabase
      .from('diet_plans')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });
    if (!error && data && data.length > 0) {
      const mapped: DietPlan[] = data.map((d: any) => ({
        id: d.id,
        patientId: d.patient_id,
        title: d.title,
        description: d.description || '',
        targetCalories: Number(d.target_calories),
        targetProtein: Number(d.target_protein),
        targetCarbs: Number(d.target_carbs),
        targetFats: Number(d.target_fats),
        meals: d.meals || [],
        guidelines: d.guidelines || [],
        waterTargetMl: d.water_target_ml || 2500,
        active: Boolean(d.active),
        createdAt: d.created_at,
        updatedAt: d.updated_at,
      }));
      return mapped;
    }
  } catch (e) {}

  const all = getLocal<Record<string, DietPlan[]>>(storageKey, isDemo ? INITIAL_DIET_PLANS : {});
  return all[patientId] || [];
}

export async function saveDietPlan(plan: DietPlan): Promise<DietPlan> {
  const userId = getActiveUserId();
  const isDemo = userId === DEMO_USER.id;
  const storageKey = getUserKey('diet_plans', userId);
  const all = getLocal<Record<string, DietPlan[]>>(storageKey, isDemo ? INITIAL_DIET_PLANS : {});
  
  const patientPlans = all[plan.patientId] || [];
  const now = new Date().toISOString();
  const validId = ensureUUID(plan.id);
  
  let savedPlan: DietPlan;
  if (patientPlans.some(p => p.id === plan.id)) {
    savedPlan = { ...plan, id: validId, updatedAt: now };
    all[plan.patientId] = patientPlans.map(p => (p.id === plan.id ? savedPlan : p));
  } else {
    savedPlan = { ...plan, id: validId, createdAt: now, updatedAt: now };
    all[plan.patientId] = [savedPlan, ...patientPlans];
  }
  setLocal(storageKey, all);

  try {
    await supabase.from('diet_plans').upsert({
      id: savedPlan.id,
      patient_id: savedPlan.patientId,
      title: savedPlan.title,
      description: savedPlan.description || '',
      target_calories: savedPlan.targetCalories || 2000,
      target_protein: savedPlan.targetProtein || 150,
      target_carbs: savedPlan.targetCarbs || 200,
      target_fats: savedPlan.targetFats || 60,
      meals: savedPlan.meals || [],
      guidelines: savedPlan.guidelines || [],
      water_target_ml: savedPlan.waterTargetMl || 2500,
      active: savedPlan.active !== false,
      updated_at: savedPlan.updatedAt,
    });
  } catch (e) {}

  return savedPlan;
}

export async function deleteDietPlan(patientId: string, planId: string): Promise<void> {
  const userId = getActiveUserId();
  const storageKey = getUserKey('diet_plans', userId);
  const all = getLocal<Record<string, DietPlan[]>>(storageKey, {});
  if (all[patientId]) {
    all[patientId] = all[patientId].filter(p => p.id !== planId);
    setLocal(storageKey, all);
  }
  try {
    await supabase.from('diet_plans').delete().eq('id', planId);
  } catch (e) {}
}

// ==================== APPOINTMENTS API ====================
export async function getAppointments(): Promise<Appointment[]> {
  const userId = getActiveUserId();
  const isDemo = userId === DEMO_USER.id;
  const storageKey = getUserKey('appointments', userId);

  try {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .order('date', { ascending: true });

    if (!error && data) {
      // Filter strictly by the active logged-in user
      const userAppointments = data.filter((a: any) => {
        const { ownerId } = decodeUserMetadata(a.notes);
        if (ownerId) return ownerId === userId;
        return isDemo;
      });

      const mapped: Appointment[] = userAppointments.map((a: any) => {
        const { cleanNotes } = decodeUserMetadata(a.notes);
        return {
          id: a.id,
          patientId: a.patient_id,
          patientName: a.patient_name,
          patientPhone: a.patient_phone || '',
          date: a.date,
          time: a.time,
          durationMinutes: a.duration_minutes || 60,
          type: a.type || 'follow_up',
          status: a.status || 'scheduled',
          price: a.price ? Number(a.price) : 0,
          paid: Boolean(a.paid),
          notes: cleanNotes,
          meetUrl: a.meet_url || '',
          createdAt: a.created_at,
        };
      });

      setLocal(storageKey, mapped);
      return mapped;
    }
  } catch (e) {}

  return getLocal<Appointment[]>(storageKey, isDemo ? INITIAL_APPOINTMENTS : []);
}

export async function saveAppointment(appointment: Partial<Appointment> & { patientName: string; date: string; time: string }): Promise<Appointment> {
  const userId = getActiveUserId();
  const isDemo = userId === DEMO_USER.id;
  const storageKey = getUserKey('appointments', userId);
  const current = getLocal<Appointment[]>(storageKey, isDemo ? INITIAL_APPOINTMENTS : []);
  const now = new Date().toISOString();
  const validId = ensureUUID(appointment.id);
  let saved: Appointment;

  if (appointment.id && current.some(a => a.id === appointment.id)) {
    saved = {
      ...(current.find(a => a.id === appointment.id) as Appointment),
      ...appointment,
      id: validId,
    } as Appointment;
    const updated = current.map(a => (a.id === appointment.id ? saved : a));
    setLocal(storageKey, updated);
  } else {
    saved = {
      id: validId,
      patientId: appointment.patientId || '',
      patientName: appointment.patientName,
      patientPhone: appointment.patientPhone || '',
      date: appointment.date,
      time: appointment.time,
      durationMinutes: appointment.durationMinutes || 60,
      type: appointment.type || 'follow_up',
      status: appointment.status || 'scheduled',
      price: appointment.price || 0,
      paid: appointment.paid || false,
      notes: appointment.notes || '',
      meetUrl: appointment.meetUrl || '',
      createdAt: now,
    };
    setLocal(storageKey, [...current, saved]);
  }

  try {
    const encodedNotes = encodeUserMetadata(userId, saved.notes);
    await supabase.from('appointments').upsert({
      id: saved.id,
      patient_id: isUUID(saved.patientId) ? saved.patientId : null,
      patient_name: saved.patientName,
      patient_phone: saved.patientPhone || null,
      date: saved.date,
      time: saved.time,
      duration_minutes: saved.durationMinutes,
      type: saved.type,
      status: saved.status,
      price: saved.price,
      paid: saved.paid,
      notes: encodedNotes,
      meet_url: saved.meetUrl || null,
    });
  } catch (e) {}

  return saved;
}

export async function deleteAppointment(id: string): Promise<void> {
  const userId = getActiveUserId();
  const storageKey = getUserKey('appointments', userId);
  const current = getLocal<Appointment[]>(storageKey, []);
  setLocal(storageKey, current.filter(a => a.id !== id));
  try {
    await supabase.from('appointments').delete().eq('id', id);
  } catch (e) {}
}

// ==================== SUPPLEMENTS API ====================
export async function getSupplements(patientId: string): Promise<Supplement[]> {
  const userId = getActiveUserId();
  const isDemo = userId === DEMO_USER.id;
  const storageKey = getUserKey('supplements', userId);

  try {
    const { data, error } = await supabase.from('supplements').select('*').eq('patient_id', patientId);
    if (!error && data && data.length > 0) {
      return data.map((s: any) => ({
        id: s.id,
        patientId: s.patient_id,
        name: s.name,
        dosage: s.dosage,
        timing: s.timing,
        instructions: s.instructions || '',
        active: Boolean(s.active),
        createdAt: s.created_at,
      }));
    }
  } catch (e) {}

  const all = getLocal<Record<string, Supplement[]>>(storageKey, isDemo ? INITIAL_SUPPLEMENTS : {});
  return all[patientId] || [];
}

export async function saveSupplement(supplement: Supplement): Promise<Supplement> {
  const userId = getActiveUserId();
  const isDemo = userId === DEMO_USER.id;
  const storageKey = getUserKey('supplements', userId);
  const all = getLocal<Record<string, Supplement[]>>(storageKey, isDemo ? INITIAL_SUPPLEMENTS : {});
  
  const patientList = all[supplement.patientId] || [];
  const now = new Date().toISOString();
  const validId = ensureUUID(supplement.id);
  let saved: Supplement;

  if (patientList.some(s => s.id === supplement.id)) {
    saved = { ...supplement, id: validId };
    all[supplement.patientId] = patientList.map(s => (s.id === supplement.id ? saved : s));
  } else {
    saved = { ...supplement, id: validId, createdAt: now };
    all[supplement.patientId] = [...patientList, saved];
  }
  setLocal(storageKey, all);

  try {
    await supabase.from('supplements').upsert({
      id: saved.id,
      patient_id: saved.patientId,
      name: saved.name,
      dosage: saved.dosage,
      timing: saved.timing,
      instructions: saved.instructions || null,
      active: saved.active !== false,
    });
  } catch (e) {}

  return saved;
}

export async function deleteSupplement(patientId: string, id: string): Promise<void> {
  const userId = getActiveUserId();
  const storageKey = getUserKey('supplements', userId);
  const all = getLocal<Record<string, Supplement[]>>(storageKey, {});
  if (all[patientId]) {
    all[patientId] = all[patientId].filter(s => s.id !== id);
    setLocal(storageKey, all);
  }
  try {
    await supabase.from('supplements').delete().eq('id', id);
  } catch (e) {}
}

// ==================== EVOLUTION PHOTOS API ====================
export async function getEvolutionPhotos(patientId: string): Promise<EvolutionPhoto[]> {
  const userId = getActiveUserId();
  const isDemo = userId === DEMO_USER.id;
  const storageKey = getUserKey('photos', userId);
  const all = getLocal<Record<string, EvolutionPhoto[]>>(storageKey, isDemo ? INITIAL_EVOLUTION_PHOTOS : {});
  return all[patientId] || [];
}

export async function saveEvolutionPhoto(photo: EvolutionPhoto): Promise<EvolutionPhoto> {
  const userId = getActiveUserId();
  const isDemo = userId === DEMO_USER.id;
  const storageKey = getUserKey('photos', userId);
  const all = getLocal<Record<string, EvolutionPhoto[]>>(storageKey, isDemo ? INITIAL_EVOLUTION_PHOTOS : {});
  
  const patientList = all[photo.patientId] || [];
  const now = new Date().toISOString();
  let saved: EvolutionPhoto;

  if (patientList.some(p => p.id === photo.id)) {
    saved = photo;
    all[photo.patientId] = patientList.map(p => (p.id === photo.id ? saved : p));
  } else {
    saved = { ...photo, id: photo.id || `photo-${Date.now()}`, createdAt: now };
    all[photo.patientId] = [...patientList, saved].sort((a, b) => a.date.localeCompare(b.date));
  }
  setLocal(storageKey, all);
  return saved;
}

export async function deleteEvolutionPhoto(patientId: string, id: string): Promise<void> {
  const userId = getActiveUserId();
  const storageKey = getUserKey('photos', userId);
  const all = getLocal<Record<string, EvolutionPhoto[]>>(storageKey, {});
  if (all[patientId]) {
    all[patientId] = all[patientId].filter(p => p.id !== id);
    setLocal(storageKey, all);
  }
}

// ==================== CLINIC PROFILE API ====================
export function getClinicProfile(): ClinicProfile {
  const user = getCurrentUser();
  const userId = user ? user.id : DEMO_USER.id;
  const isDemo = userId === DEMO_USER.id;
  const storageKey = getUserKey('clinic', userId);

  const defaultNewProfile: ClinicProfile = {
    nutritionistName: user?.name || 'Raphael',
    crn: '',
    clinicName: 'NutriPlan Pro',
    email: user?.email || 'raphacalixto10@gmail.com',
    phone: '',
    address: '',
    instagram: '',
  };

  return getLocal<ClinicProfile>(storageKey, isDemo ? INITIAL_CLINIC_PROFILE : defaultNewProfile);
}

export function saveClinicProfile(profile: ClinicProfile): ClinicProfile {
  const userId = getActiveUserId();
  const storageKey = getUserKey('clinic', userId);
  setLocal(storageKey, profile);
  return profile;
}
