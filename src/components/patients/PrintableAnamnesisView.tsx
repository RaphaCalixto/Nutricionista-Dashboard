import React from 'react';
import { ArrowLeft, Printer, FileText, Heart, Activity, Coffee, AlertCircle } from 'lucide-react';
import type { Patient, Anamnesis, ClinicProfile } from '../../types';
import { calculateAge } from '../../utils/nutritionCalculations';

interface PrintableAnamnesisViewProps {
  patient: Patient;
  anamnesis: Anamnesis;
  clinicProfile: ClinicProfile;
  onBack: () => void;
}

export const PrintableAnamnesisView: React.FC<PrintableAnamnesisViewProps> = ({
  patient,
  anamnesis,
  clinicProfile,
  onBack,
}) => {
  const age = calculateAge(patient.birthDate);
  const today = anamnesis.updatedAt
    ? anamnesis.updatedAt.split('T')[0]
    : new Date().toLocaleDateString('pt-BR');

  const handlePrint = () => {
    window.print();
  };

  const stressLabels: Record<string, string> = {
    low: 'Baixo',
    moderate: 'Moderado',
    high: 'Elevado / Alto',
  };

  return (
    <div className="space-y-6">
      {/* Top action bar (hidden during print) */}
      <div className="no-print flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-emerald-700 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao Sistema</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-xs font-bold rounded-xl shadow-sm shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir / Salvar em PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Sheet (Standard A4 layout) */}
      <div className="bg-white p-8 sm:p-12 rounded-2xl border border-slate-200 shadow-sm max-w-4xl mx-auto text-slate-800 space-y-8 print:border-none print:shadow-none print:p-0">
        
        {/* Clinic Header */}
        <div className="flex items-start justify-between border-b-2 border-emerald-600 pb-6">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span className="text-emerald-600">🌿</span> {clinicProfile.clinicName}
            </h1>
            <p className="text-sm font-bold text-slate-700 mt-1">
              {clinicProfile.nutritionistName} <span className="text-slate-400 font-normal">|</span>{' '}
              <span className="text-emerald-700 font-semibold">{clinicProfile.crn}</span>
            </p>
            <p className="text-xs text-slate-500 mt-0.5">{clinicProfile.address}</p>
          </div>

          <div className="text-right text-xs text-slate-500 space-y-1">
            <p className="font-semibold text-slate-700">{clinicProfile.phone}</p>
            <p>{clinicProfile.email}</p>
            {clinicProfile.instagram && (
              <p className="text-emerald-700 font-medium">{clinicProfile.instagram}</p>
            )}
          </div>
        </div>

        {/* Patient Details Box */}
        <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-200/80 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div>
            <span className="text-slate-400 uppercase font-bold text-[10px] tracking-wider block">
              Paciente
            </span>
            <strong className="text-base text-slate-900 font-bold">{patient.name}</strong>
          </div>

          <div>
            <span className="text-slate-400 uppercase font-bold text-[10px] tracking-wider block">
              Idade / Sexo
            </span>
            <span className="font-semibold text-slate-700">
              {age} anos • {patient.gender === 'male' ? 'Masculino' : 'Feminino'}
            </span>
          </div>

          <div>
            <span className="text-slate-400 uppercase font-bold text-[10px] tracking-wider block">
              Tipo de Documento
            </span>
            <strong className="text-emerald-800 font-bold text-sm">Anamnese Clínica & Nutricional</strong>
          </div>

          <div>
            <span className="text-slate-400 uppercase font-bold text-[10px] tracking-wider block">
              Data de Registro
            </span>
            <span className="font-medium text-slate-600">{today}</span>
          </div>
        </div>

        {/* Document Title */}
        <div>
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600" />
            <span>Ficha de Anamnese Clínica & Perfil do Paciente</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Mapeamento clínico abrangente, rotina de vida, histórico familiar e comportamento alimentar.
          </p>
        </div>

        {/* 1. Main Complaint & Goals */}
        <div className="border border-slate-200 rounded-xl overflow-hidden break-inside-avoid shadow-2xs">
          <div className="bg-slate-100/80 px-4 py-2.5 border-b border-slate-200">
            <h3 className="font-bold text-slate-900 text-sm">1. Queixa Principal & Objetivos do Paciente</h3>
          </div>
          <div className="p-4 text-xs text-slate-700 leading-relaxed">
            {anamnesis.mainComplaint ? (
              <p className="font-medium text-slate-900 italic bg-slate-50 p-3 rounded-lg border border-slate-200">
                "{anamnesis.mainComplaint}"
              </p>
            ) : (
              <p className="text-slate-400">Não informado.</p>
            )}
          </div>
        </div>

        {/* 2. Clinical & Medical History */}
        <div className="border border-slate-200 rounded-xl overflow-hidden break-inside-avoid shadow-2xs">
          <div className="bg-slate-100/80 px-4 py-2.5 border-b border-slate-200 flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-600" />
            <h3 className="font-bold text-slate-900 text-sm">2. Histórico Clínico e Patológico</h3>
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-400 font-bold uppercase text-[10px] block mb-1">
                Patologias / Diagnósticos Conhecidos:
              </span>
              <p className="font-medium text-slate-800">
                {anamnesis.clinicalHistory.pathologies && anamnesis.clinicalHistory.pathologies.length > 0
                  ? anamnesis.clinicalHistory.pathologies.join(', ')
                  : 'Nenhuma patologia relatada'}
              </p>
            </div>

            <div>
              <span className="text-slate-400 font-bold uppercase text-[10px] block mb-1">
                Histórico Familiar:
              </span>
              <p className="font-medium text-slate-800">
                {anamnesis.clinicalHistory.familyHistory && anamnesis.clinicalHistory.familyHistory.length > 0
                  ? anamnesis.clinicalHistory.familyHistory.join(', ')
                  : 'Sem histórico patológico familiar relevante'}
              </p>
            </div>

            <div>
              <span className="text-slate-400 font-bold uppercase text-[10px] block mb-1">
                Medicamentos Contínuos:
              </span>
              <p className="font-medium text-slate-800">
                {anamnesis.clinicalHistory.medications || 'Nenhum medicamento contínuo'}
              </p>
            </div>

            <div>
              <span className="text-slate-400 font-bold uppercase text-[10px] block mb-1">
                Cirurgias Realizadas:
              </span>
              <p className="font-medium text-slate-800">
                {anamnesis.clinicalHistory.surgeries || 'Nenhuma cirurgia prévia'}
              </p>
            </div>

            <div className="sm:col-span-2">
              <span className="text-slate-400 font-bold uppercase text-[10px] block mb-1">
                Funcionamento Intestinal:
              </span>
              <p className="font-medium text-slate-800">
                {anamnesis.clinicalHistory.bowelHabits || 'Não informado'}
              </p>
            </div>
          </div>
        </div>

        {/* 3. Lifestyle & Habits */}
        <div className="border border-slate-200 rounded-xl overflow-hidden break-inside-avoid shadow-2xs">
          <div className="bg-slate-100/80 px-4 py-2.5 border-b border-slate-200 flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-sm">3. Estilo de Vida & Rotina Diária</h3>
          </div>
          <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-400 font-bold uppercase text-[10px] block mb-0.5">Sono Diário</span>
              <strong className="text-slate-900 text-sm">{anamnesis.lifestyle.sleepHours || '--'} horas/noite</strong>
            </div>

            <div>
              <span className="text-slate-400 font-bold uppercase text-[10px] block mb-0.5">Nível de Estresse</span>
              <strong className="text-slate-900 text-sm">
                {stressLabels[anamnesis.lifestyle.stressLevel] || anamnesis.lifestyle.stressLevel}
              </strong>
            </div>

            <div>
              <span className="text-slate-400 font-bold uppercase text-[10px] block mb-0.5">Tabagismo</span>
              <strong className="text-slate-900 text-sm">
                {anamnesis.lifestyle.smoking ? 'Fumante' : 'Não fumante'}
              </strong>
            </div>

            <div>
              <span className="text-slate-400 font-bold uppercase text-[10px] block mb-0.5">Consumo Alcoólico</span>
              <strong className="text-slate-900 text-sm">{anamnesis.lifestyle.alcohol || 'Não consome'}</strong>
            </div>

            <div className="col-span-2 sm:col-span-4 pt-2 border-t border-slate-100">
              <span className="text-slate-400 font-bold uppercase text-[10px] block mb-0.5">
                Atividade Física & Frequência:
              </span>
              <p className="font-medium text-slate-800">
                {anamnesis.lifestyle.physicalActivity || 'Sedentário'}{' '}
                {anamnesis.lifestyle.activityFrequency && `(${anamnesis.lifestyle.activityFrequency})`}
              </p>
            </div>
          </div>
        </div>

        {/* 4. Dietary Habits & Allergies */}
        <div className="border border-slate-200 rounded-xl overflow-hidden break-inside-avoid shadow-2xs">
          <div className="bg-slate-100/80 px-4 py-2.5 border-b border-slate-200 flex items-center gap-2">
            <Coffee className="w-4 h-4 text-amber-600" />
            <h3 className="font-bold text-slate-900 text-sm">4. Hábitos Alimentares & Alergias</h3>
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-400 font-bold uppercase text-[10px] block mb-1">
                Ingestão Hídrica Diária:
              </span>
              <strong className="text-emerald-800 font-bold text-sm">
                {anamnesis.dietaryHistory.waterIntakeMl ? `${anamnesis.dietaryHistory.waterIntakeMl} ml/dia` : '--'}
              </strong>
            </div>

            <div>
              <span className="text-slate-400 font-bold uppercase text-[10px] block mb-1">
                Apetite Habitual:
              </span>
              <strong className="text-slate-800 font-bold text-sm">
                {anamnesis.dietaryHistory.appetite || 'Normal'}
              </strong>
            </div>

            <div>
              <span className="text-rose-500 font-bold uppercase text-[10px] block mb-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                <span>Alergias Alimentares:</span>
              </span>
              <p className="font-semibold text-rose-700">
                {anamnesis.dietaryHistory.allergies && anamnesis.dietaryHistory.allergies.length > 0
                  ? anamnesis.dietaryHistory.allergies.join(', ')
                  : 'Nenhuma alergia conhecida'}
              </p>
            </div>

            <div>
              <span className="text-amber-600 font-bold uppercase text-[10px] block mb-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                <span>Intolerâncias Alimentares:</span>
              </span>
              <p className="font-semibold text-amber-800">
                {anamnesis.dietaryHistory.foodIntolerances && anamnesis.dietaryHistory.foodIntolerances.length > 0
                  ? anamnesis.dietaryHistory.foodIntolerances.join(', ')
                  : 'Nenhuma intolerância conhecida'}
              </p>
            </div>

            <div>
              <span className="text-slate-400 font-bold uppercase text-[10px] block mb-1">
                Alimentos Preferidos:
              </span>
              <p className="text-slate-800">{anamnesis.dietaryHistory.preferredFoods || 'Sem restrições'}</p>
            </div>

            <div>
              <span className="text-slate-400 font-bold uppercase text-[10px] block mb-1">
                Aversões / Alimentos Não Ingeridos:
              </span>
              <p className="text-slate-800">{anamnesis.dietaryHistory.dislikedFoods || 'Nenhuma aversão relatada'}</p>
            </div>
          </div>
        </div>

        {/* 5. Recall 24h & Weekend Habits */}
        {(anamnesis.dietaryHistory.recall24h || anamnesis.dietaryHistory.weekendHabits) && (
          <div className="border border-slate-200 rounded-xl overflow-hidden break-inside-avoid shadow-2xs">
            <div className="bg-slate-100/80 px-4 py-2.5 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-sm">5. Recordatório Alimentar & Fins de Semana</h3>
            </div>
            <div className="p-4 space-y-3 text-xs">
              {anamnesis.dietaryHistory.recall24h && (
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px] block mb-1">
                    Recordatório Alimentar Habitual (24h):
                  </span>
                  <p className="text-slate-700 whitespace-pre-line leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
                    {anamnesis.dietaryHistory.recall24h}
                  </p>
                </div>
              )}

              {anamnesis.dietaryHistory.weekendHabits && (
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px] block mb-1">
                    Hábitos aos Fins de Semana:
                  </span>
                  <p className="text-slate-700 whitespace-pre-line leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
                    {anamnesis.dietaryHistory.weekendHabits}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer & Signature Line */}
        <div className="pt-12 text-center break-inside-avoid space-y-1">
          <div className="w-64 border-b border-slate-400 mx-auto mb-2" />
          <p className="font-bold text-sm text-slate-800">{clinicProfile.nutritionistName}</p>
          <p className="text-xs text-slate-500 font-medium">Nutricionista • {clinicProfile.crn}</p>
        </div>

      </div>
    </div>
  );
};
