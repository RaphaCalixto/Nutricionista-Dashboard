import React from 'react';
import {
  ArrowLeft,
  Printer,
  User,
  Activity,
  FileText,
  UtensilsCrossed,
  Pill,
  Droplet,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import type {
  Patient,
  Anamnesis,
  Anthropometry,
  DietPlan,
  Supplement,
  ClinicProfile
} from '../../types';
import {
  calculateAge,
  calculateBMI,
  calculateWaterRecommendation
} from '../../utils/nutritionCalculations';

interface PrintableOverviewViewProps {
  patient: Patient;
  anamnesis: Anamnesis | null;
  anthropometryList: Anthropometry[];
  dietPlans: DietPlan[];
  supplements: Supplement[];
  clinicProfile: ClinicProfile;
  onBack: () => void;
}

export const PrintableOverviewView: React.FC<PrintableOverviewViewProps> = ({
  patient,
  anamnesis,
  anthropometryList = [],
  dietPlans = [],
  supplements = [],
  clinicProfile,
  onBack,
}) => {
  const age = calculateAge(patient.birthDate);
  const latestAssessment = anthropometryList[anthropometryList.length - 1];
  const activePlan = dietPlans.find((p) => p.active) || dietPlans[0];
  const activeSupplements = supplements.filter((s) => s.active !== false);
  const today = new Date().toLocaleDateString('pt-BR');

  const bmiData = latestAssessment
    ? calculateBMI(latestAssessment.weight, latestAssessment.height)
    : null;

  const waterTarget = latestAssessment
    ? calculateWaterRecommendation(latestAssessment.weight)
    : activePlan?.waterTargetMl || 2500;

  const goalLabels: Record<string, string> = {
    weight_loss: 'Emagrecimento / Redução de Gordura',
    hypertrophy: 'Hipertrofia / Ganho de Massa Muscular',
    maintenance: 'Manutenção do Peso / Saúde',
    health_clinical: 'Saúde Clínica / Reeducação Alimentar',
    performance: 'Performance Esportiva',
    pregnancy_lactation: 'Gestação & Lactação',
  };

  const handlePrint = () => {
    window.print();
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
              Objetivo Nutricional
            </span>
            <strong className="text-emerald-800 font-bold text-sm">
              {goalLabels[patient.goal] || patient.goal}
            </strong>
          </div>

          <div>
            <span className="text-slate-400 uppercase font-bold text-[10px] tracking-wider block">
              Data de Emissão
            </span>
            <span className="font-medium text-slate-600">{today}</span>
          </div>
        </div>

        {/* Document Title */}
        <div>
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <User className="w-5 h-5 text-emerald-600" />
            <span>Prontuário Nutricional Geral & Dossiê Clínico</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Consolidação do diagnóstico clínico, estado antropométrico, plano alimentar e prescrições ativas.
          </p>
        </div>

        {/* 1. Diagnóstico Antropométrico Atual */}
        <div className="border border-slate-200 rounded-xl overflow-hidden break-inside-avoid shadow-2xs">
          <div className="bg-slate-100/80 px-4 py-2.5 border-b border-slate-200 flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-sm">1. Estado Nutricional & Antropometria Atual</h3>
          </div>
          <div className="p-4">
            {latestAssessment ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Peso Atual</span>
                  <span className="text-xl font-black text-slate-900 mt-0.5 block">{latestAssessment.weight} kg</span>
                  <span className="text-[10px] text-slate-500">Altura: {latestAssessment.height} cm</span>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">IMC</span>
                  <span className="text-xl font-black text-slate-900 mt-0.5 block">{latestAssessment.bmi}</span>
                  {bmiData && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded">
                      {bmiData.classification}
                    </span>
                  )}
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">% Gordura</span>
                  <span className="text-xl font-black text-slate-900 mt-0.5 block">
                    {latestAssessment.bodyFatPercentage ? `${latestAssessment.bodyFatPercentage}%` : '--'}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Gorda: {latestAssessment.fatMassKg ? `${latestAssessment.fatMassKg}kg` : '--'}
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Massa Magra</span>
                  <span className="text-xl font-black text-emerald-700 mt-0.5 block">
                    {latestAssessment.leanMassKg ? `${latestAssessment.leanMassKg} kg` : '--'}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Cintura: {latestAssessment.waist ? `${latestAssessment.waist} cm` : '--'}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">Nenhuma avaliação antropométrica registrada até o momento.</p>
            )}
          </div>
        </div>

        {/* 2. Resumo da Anamnese Clínica */}
        <div className="border border-slate-200 rounded-xl overflow-hidden break-inside-avoid shadow-2xs">
          <div className="bg-slate-100/80 px-4 py-2.5 border-b border-slate-200 flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-sm">2. Resumo Clínico & Queixas</h3>
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="sm:col-span-2">
              <span className="text-slate-400 font-bold uppercase text-[10px] block mb-0.5">
                Queixa Principal:
              </span>
              <p className="text-slate-800 font-medium italic">
                {anamnesis?.mainComplaint ? `"${anamnesis.mainComplaint}"` : 'Não informada'}
              </p>
            </div>

            <div>
              <span className="text-slate-400 font-bold uppercase text-[10px] block mb-0.5">
                Patologias / Condições:
              </span>
              <p className="text-slate-800">
                {anamnesis?.clinicalHistory.pathologies && anamnesis.clinicalHistory.pathologies.length > 0
                  ? anamnesis.clinicalHistory.pathologies.join(', ')
                  : 'Nenhuma patologia relatada'}
              </p>
            </div>

            <div>
              <span className="text-slate-400 font-bold uppercase text-[10px] block mb-0.5">
                Medicamentos em Uso:
              </span>
              <p className="text-slate-800">
                {anamnesis?.clinicalHistory.medications || 'Nenhum medicamento contínuo'}
              </p>
            </div>

            <div>
              <span className="text-rose-600 font-bold uppercase text-[10px] block mb-0.5 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                <span>Alergias Alimentares:</span>
              </span>
              <p className="text-rose-700 font-medium">
                {anamnesis?.dietaryHistory.allergies && anamnesis.dietaryHistory.allergies.length > 0
                  ? anamnesis.dietaryHistory.allergies.join(', ')
                  : 'Nenhuma alergia conhecida'}
              </p>
            </div>

            <div>
              <span className="text-amber-600 font-bold uppercase text-[10px] block mb-0.5 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                <span>Intolerâncias:</span>
              </span>
              <p className="text-amber-700 font-medium">
                {anamnesis?.dietaryHistory.foodIntolerances && anamnesis.dietaryHistory.foodIntolerances.length > 0
                  ? anamnesis.dietaryHistory.foodIntolerances.join(', ')
                  : 'Nenhuma intolerância conhecida'}
              </p>
            </div>
          </div>
        </div>

        {/* 3. Plano Alimentar Ativo */}
        <div className="border border-slate-200 rounded-xl overflow-hidden break-inside-avoid shadow-2xs">
          <div className="bg-slate-100/80 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold text-slate-900 text-sm">3. Plano Alimentar Prescrito</h3>
            </div>
            {activePlan && (
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                {activePlan.title} ({activePlan.targetCalories} kcal)
              </span>
            )}
          </div>
          <div className="p-4 text-xs">
            {activePlan ? (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <span className="text-slate-400 uppercase font-bold text-[10px] block">Proteínas</span>
                    <strong className="text-slate-900 text-sm">{activePlan.targetProtein}g</strong>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <span className="text-slate-400 uppercase font-bold text-[10px] block">Carboidratos</span>
                    <strong className="text-slate-900 text-sm">{activePlan.targetCarbs}g</strong>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <span className="text-slate-400 uppercase font-bold text-[10px] block">Lipídios (Gorduras)</span>
                    <strong className="text-slate-900 text-sm">{activePlan.targetFats}g</strong>
                  </div>
                </div>

                <div className="pt-2">
                  <span className="text-slate-400 font-bold uppercase text-[10px] block mb-1">
                    Refeições Planejadas ({activePlan.meals.length}):
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {activePlan.meals.map((m) => (
                      <span key={m.id} className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md text-[11px] font-medium border border-slate-200">
                        {m.name} ({m.time}) • {m.items.length} itens
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-slate-400 italic">Nenhum plano alimentar ativo cadastrado.</p>
            )}
          </div>
        </div>

        {/* 4. Suplementação Prescrita Ativa */}
        <div className="border border-slate-200 rounded-xl overflow-hidden break-inside-avoid shadow-2xs">
          <div className="bg-slate-100/80 px-4 py-2.5 border-b border-slate-200 flex items-center gap-2">
            <Pill className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-sm">4. Prescrição de Suplementos</h3>
          </div>
          <div className="p-4 text-xs">
            {activeSupplements.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {activeSupplements.map((sup) => (
                  <div key={sup.id} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-start justify-between">
                    <div>
                      <strong className="text-slate-900 block font-bold">{sup.name}</strong>
                      <span className="text-slate-500 text-[11px]">{sup.dosage}</span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {sup.timing}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 italic">Nenhum suplemento ativo prescrito no momento.</p>
            )}
          </div>
        </div>

        {/* Meta Hídrica Recomendada */}
        <div className="flex items-center gap-3 bg-blue-50/70 p-4 rounded-xl border border-blue-200 text-xs text-blue-900 break-inside-avoid">
          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
            <Droplet className="w-4 h-4" />
          </div>
          <div>
            <strong className="block text-slate-900 font-bold">Meta de Hidratação Diária Recomendada:</strong>
            <p className="text-slate-700 text-[11px]">
              Ingestão mínima de <strong>{waterTarget} ml de água</strong> distribuídos uniformemente ao longo do dia.
            </p>
          </div>
        </div>

        {/* Footer & Signature Line */}
        <div className="pt-12 text-center break-inside-avoid space-y-1 flex flex-col items-center">
          {clinicProfile.signatureUrl && (
            <div className="mb-1 flex justify-center">
              <img
                src={clinicProfile.signatureUrl}
                alt="Assinatura"
                className="max-h-20 max-w-64 object-contain"
              />
            </div>
          )}
          <div className="w-64 border-b border-slate-400 mx-auto mb-2" />
          <p className="font-bold text-sm text-slate-800">{clinicProfile.nutritionistName}</p>
          <p className="text-xs text-slate-500 font-medium">Nutricionista • {clinicProfile.crn}</p>
        </div>

      </div>
    </div>
  );
};
