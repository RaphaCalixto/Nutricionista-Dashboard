-- ==========================================================
-- NUTRIPLAN PRO - SUPABASE DATABASE SCHEMA
-- Cole este script no SQL Editor do Supabase para criar as tabelas
-- ==========================================================

-- Habilitar extensão UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABELA DE PACIENTES
CREATE TABLE IF NOT EXISTS public.patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    birth_date DATE,
    gender VARCHAR(20) NOT NULL DEFAULT 'female',
    occupation VARCHAR(150),
    goal VARCHAR(50) NOT NULL DEFAULT 'weight_loss',
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    photo_url TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABELA DE ANAMNESE CLÍNICA
CREATE TABLE IF NOT EXISTS public.anamnesis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    main_complaint TEXT,
    clinical_history JSONB DEFAULT '{}'::jsonb,
    lifestyle JSONB DEFAULT '{}'::jsonb,
    dietary_history JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABELA DE AVALIAÇÕES ANTROPOMÉTRICAS
CREATE TABLE IF NOT EXISTS public.anthropometry (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    weight NUMERIC(5,2) NOT NULL,
    height NUMERIC(5,2) NOT NULL,
    bmi NUMERIC(4,1) NOT NULL,
    body_fat_percentage NUMERIC(4,1),
    fat_mass_kg NUMERIC(5,2),
    lean_mass_kg NUMERIC(5,2),
    waist NUMERIC(5,2),
    abdomen NUMERIC(5,2),
    hip NUMERIC(5,2),
    arm_relaxed NUMERIC(5,2),
    arm_contracted NUMERIC(5,2),
    thigh NUMERIC(5,2),
    chest NUMERIC(5,2),
    calf NUMERIC(5,2),
    skinfold_triceps NUMERIC(4,1),
    skinfold_subscapular NUMERIC(4,1),
    skinfold_suprailiac NUMERIC(4,1),
    skinfold_abdominal NUMERIC(4,1),
    skinfold_thigh NUMERIC(4,1),
    skinfold_chest NUMERIC(4,1),
    protocol VARCHAR(50) DEFAULT 'pollock_3',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TABELA DE PLANOS ALIMENTARES
CREATE TABLE IF NOT EXISTS public.diet_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    target_calories NUMERIC(6,1) NOT NULL,
    target_protein NUMERIC(6,1) NOT NULL,
    target_carbs NUMERIC(6,1) NOT NULL,
    target_fats NUMERIC(6,1) NOT NULL,
    meals JSONB NOT NULL DEFAULT '[]'::jsonb,
    guidelines TEXT[] DEFAULT '{}',
    water_target_ml INTEGER DEFAULT 2500,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. TABELA DE AGENDA DE CONSULTAS
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL,
    patient_name VARCHAR(255) NOT NULL,
    patient_phone VARCHAR(50),
    date DATE NOT NULL,
    time VARCHAR(10) NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    type VARCHAR(50) NOT NULL DEFAULT 'follow_up',
    status VARCHAR(30) NOT NULL DEFAULT 'scheduled',
    price NUMERIC(8,2) DEFAULT 0,
    paid BOOLEAN DEFAULT FALSE,
    notes TEXT,
    meet_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. TABELA DE PRESCRIÇÃO DE SUPLEMENTOS
CREATE TABLE IF NOT EXISTS public.supplements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    dosage VARCHAR(100) NOT NULL,
    timing VARCHAR(100) NOT NULL,
    instructions TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. TABELA DE ALIMENTOS PERSONALIZADOS
CREATE TABLE IF NOT EXISTS public.custom_foods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    base_qty NUMERIC(6,1) DEFAULT 100,
    base_unit VARCHAR(20) DEFAULT 'g',
    calories NUMERIC(6,1) NOT NULL,
    protein NUMERIC(6,1) DEFAULT 0,
    carbs NUMERIC(6,1) DEFAULT 0,
    fats NUMERIC(6,1) DEFAULT 0,
    fiber NUMERIC(6,1) DEFAULT 0,
    sodium NUMERIC(6,1) DEFAULT 0,
    common_portions JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_patients_goal ON public.patients(goal);
CREATE INDEX IF NOT EXISTS idx_anthropometry_patient ON public.anthropometry(patient_id);
CREATE INDEX IF NOT EXISTS idx_diet_plans_patient ON public.diet_plans(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments(date);

-- Habilitar RLS e criar políticas públicas para chave anônima
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anamnesis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anthropometry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diet_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_foods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public full access patients" ON public.patients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access anamnesis" ON public.anamnesis FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access anthropometry" ON public.anthropometry FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access diet_plans" ON public.diet_plans FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access appointments" ON public.appointments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access supplements" ON public.supplements FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access custom_foods" ON public.custom_foods FOR ALL USING (true) WITH CHECK (true);
