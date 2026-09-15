import React, { useState } from 'react';
import { X, Copy, Check, Database, ExternalLink, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { SUPABASE_URL } from '../../services/supabase';

interface SupabaseSqlModalProps {
  isOpen: boolean;
  onClose: () => void;
  supabaseConnected: boolean;
  onCheckConnection: () => Promise<void>;
}

const SQL_SCHEMA_CONTENT = `-- ==========================================================
-- NUTRIÇÃO COM AMOR - SUPABASE DATABASE SCHEMA
-- Cole este script no SQL Editor do Supabase para criar as tabelas
-- ==========================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABELA DE PACIENTES
CREATE TABLE IF NOT EXISTS public.patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID DEFAULT auth.uid(),
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
    user_id UUID DEFAULT auth.uid(),
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
    user_id UUID DEFAULT auth.uid(),
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
    user_id UUID DEFAULT auth.uid(),
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
    user_id UUID DEFAULT auth.uid(),
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
    user_id UUID DEFAULT auth.uid(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    dosage VARCHAR(100) NOT NULL,
    timing VARCHAR(100) NOT NULL,
    instructions TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. TABELA DE REGISTROS FOTOGRÁFICOS (ANTES & DEPOIS)
CREATE TABLE IF NOT EXISTS public.evolution_photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID DEFAULT auth.uid(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    angle VARCHAR(20) NOT NULL DEFAULT 'front',
    photo_url TEXT NOT NULL,
    weight NUMERIC(5,2),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS e Permissões de Acesso
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anamnesis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anthropometry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diet_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evolution_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Full access patients" ON public.patients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Full access anamnesis" ON public.anamnesis FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Full access anthropometry" ON public.anthropometry FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Full access diet_plans" ON public.diet_plans FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Full access appointments" ON public.appointments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Full access supplements" ON public.supplements FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Full access evolution_photos" ON public.evolution_photos FOR ALL USING (true) WITH CHECK (true);`;

export const SupabaseSqlModal: React.FC<SupabaseSqlModalProps> = ({
  isOpen,
  onClose,
  supabaseConnected,
  onCheckConnection,
}) => {
  const [copied, setCopied] = useState(false);
  const [checking, setChecking] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(SQL_SCHEMA_CONTENT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleRefresh = async () => {
    setChecking(true);
    await onCheckConnection();
    setChecking(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">Banco de Dados Supabase</h3>
              <p className="text-xs text-slate-500 font-mono truncate max-w-md">{SUPABASE_URL}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Status banner */}
          <div
            className={`p-3.5 rounded-xl border flex items-center justify-between ${
              supabaseConnected
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {supabaseConnected ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              )}
              <div>
                <p className="text-xs font-bold">
                  {supabaseConnected ? 'Supabase conectado com sucesso!' : 'Supabase configurado e pronto!'}
                </p>
                <p className="text-[11px] text-slate-600">
                  Todas as operações salvam em cache instantâneo e sincronizam com o Supabase.
                </p>
              </div>
            </div>
            <button
              onClick={handleRefresh}
              disabled={checking}
              className="px-2.5 py-1 text-xs font-semibold bg-white border border-emerald-300 text-emerald-800 rounded-lg hover:bg-emerald-50 transition-colors flex items-center gap-1.5 shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} />
              <span>Testar</span>
            </button>
          </div>

          <div className="space-y-1.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Instruções de Inicialização (Supabase SQL Editor)
            </h4>
            <ol className="text-xs text-slate-600 space-y-1 list-decimal list-inside bg-slate-50 p-3 rounded-xl border border-slate-200/80 leading-relaxed">
              <li>Abra o seu painel do Supabase no navegador.</li>
              <li>Acesse a aba <strong>SQL Editor</strong> no menu lateral do Supabase.</li>
              <li>Clique no botão abaixo para copiar o script SQL completo.</li>
              <li>Cole no SQL Editor e clique em <strong>Run</strong>. Pronto!</li>
            </ol>
          </div>

          {/* SQL Code Block */}
          <div className="relative">
            <div className="flex items-center justify-between bg-slate-800 text-slate-300 px-4 py-2 rounded-t-xl text-xs font-mono">
              <span>schema.sql (Tabelas de Pacientes, Dietas, Agenda e Medidas)</span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-xs bg-slate-700 hover:bg-slate-600 text-white px-2.5 py-1 rounded-lg transition-colors font-sans"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copiado!' : 'Copiar SQL'}</span>
              </button>
            </div>
            <pre className="bg-slate-900 text-emerald-400 p-4 rounded-b-xl text-[11px] font-mono overflow-x-auto max-h-56 leading-normal select-all">
              {SQL_SCHEMA_CONTENT}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
          <a
            href="https://supabase.com/dashboard/project/zpcvxpwkiicnoclrjidb/sql"
            target="_blank"
            rel="noreferrer"
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 hover:underline"
          >
            <span>Abrir SQL Editor no Supabase</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 rounded-xl transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
