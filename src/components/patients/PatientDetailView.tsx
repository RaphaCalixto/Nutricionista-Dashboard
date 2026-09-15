import React, { useState } from 'react';
import {
  ArrowLeft,
  User,
  Phone,
  Calendar,
  Activity,
  FileText,
  UtensilsCrossed,
  Pill,
  Flame,
  ExternalLink,
  Edit2,
  Droplet,
  Printer,
  Camera,
  Plus,
  Trash2
} from 'lucide-react';
import type {
  Patient,
  Anamnesis,
  Anthropometry,
  DietPlan,
  Supplement,
  Appointment,
  EvolutionPhoto,
  EnergyCalculation
} from '../../types';
import { calculateAge, calculateBMI, calculateWaterRecommendation } from '../../utils/nutritionCalculations';
import { AnamnesisForm } from './AnamnesisForm';
import { AnthropometryModule } from './AnthropometryModule';
import { EnergyCalculatorModal } from './EnergyCalculatorModal';
import { BeforeAfterModule } from './BeforeAfterModule';
import { SupplementModal } from '../modals/SupplementModal';
import { AppointmentModal } from '../modals/AppointmentModal';

interface PatientDetailViewProps {
  patient: Patient;
  patients?: Patient[];
  onBack: () => void;
  onEditPatient: (patient: Patient) => void;
  onOpenDietPlanner: (patient: Patient, plan?: DietPlan, energyCalc?: EnergyCalculation) => void;
  onPrintDietPlan: (patient: Patient, plan: DietPlan) => void;
  // Data props
  anamnesis: Anamnesis | null;
  onSaveAnamnesis: (data: Anamnesis) => Promise<void>;
  anthropometryList: Anthropometry[];
  onAddAnthropometry: (data: Anthropometry) => Promise<void>;
  onDeleteAnthropometry: (id: string) => Promise<void>;
  dietPlans: DietPlan[];
  supplements: Supplement[];
  onSaveSupplement?: (sup: Supplement) => Promise<void>;
  onDeleteSupplement?: (patientId: string, id: string) => Promise<void>;
  appointments: Appointment[];
  onSaveAppointment?: (data: Partial<Appointment> & { patientName: string; date: string; time: string }) => Promise<void>;
  onDeleteAppointment?: (id: string) => Promise<void>;
  photos: EvolutionPhoto[];
  onAddPhoto: (photo: EvolutionPhoto) => Promise<void>;
  onDeletePhoto: (id: string) => Promise<void>;
}

type TabKey = 'overview' | 'anamnesis' | 'anthropometry' | 'diet_plans' | 'supplements' | 'appointments' | 'before_after';

export const PatientDetailView: React.FC<PatientDetailViewProps> = ({
  patient,
  patients = [patient],
  onBack,
  onEditPatient,
  onOpenDietPlanner,
  onPrintDietPlan,
  anamnesis,
  onSaveAnamnesis,
  anthropometryList,
  onAddAnthropometry,
  onDeleteAnthropometry,
  dietPlans,
  supplements,
  onSaveSupplement,
  onDeleteSupplement,
  appointments,
  onSaveAppointment,
  onDeleteAppointment,
  photos,
  onAddPhoto,
  onDeletePhoto,
}) => {
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [showEnergyModal, setShowEnergyModal] = useState(false);

  // Supplement Modal State
  const [isSupplementModalOpen, setIsSupplementModalOpen] = useState(false);
  const [supplementToEdit, setSupplementToEdit] = useState<Supplement | null>(null);

  // Appointment Modal State
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [appointmentToEdit, setAppointmentToEdit] = useState<Appointment | null>(null);

  const age = calculateAge(patient.birthDate);
  const latestAssessment = anthropometryList[anthropometryList.length - 1];
  const activePlan = dietPlans.find((p) => p.active) || dietPlans[0];
  const patientAppointments = appointments.filter((a) => a.patientId === patient.id);
  const waterTarget = latestAssessment
    ? calculateWaterRecommendation(latestAssessment.weight)
    : 2500;

  const handleWhatsApp = () => {
    const cleanPhone = patient.phone.replace(/\D/g, '');
    const phoneWithCountry = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
    const text = encodeURIComponent(`Olá ${patient.name.split(' ')[0]}, tudo bem?`);
    window.open(`https://wa.me/${phoneWithCountry}?text=${text}`, '_blank');
  };

  const handleApplyEnergyCalc = (calc: EnergyCalculation) => {
    onOpenDietPlanner(patient, undefined, calc);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors w-fit cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para Lista de Pacientes</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowEnergyModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 rounded-xl border border-amber-200 transition-colors cursor-pointer"
          >
            <Flame className="w-4 h-4 text-amber-600" />
            <span>Calculadora Energética</span>
          </button>

          <button
            onClick={() => onOpenDietPlanner(patient)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <UtensilsCrossed className="w-4 h-4" />
            <span>Montar Nova Dieta</span>
          </button>
        </div>
      </div>

      {/* Patient Header Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-800 font-black text-xl flex items-center justify-center overflow-hidden border-2 border-emerald-200 shrink-0">
              {patient.photoUrl ? (
                <img
                  src={patient.photoUrl}
                  alt={patient.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                patient.name
                  .split(' ')
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join('')
              )}
            </div>

            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                  {patient.name}
                </h2>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    patient.status === 'active'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {patient.status === 'active' ? 'Ativo' : 'Inativo'}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-slate-500">
                <span>{age} anos ({patient.birthDate})</span>
                <span>•</span>
                <span>{patient.gender === 'male' ? 'Masculino' : 'Feminino'}</span>
                {patient.occupation && (
                  <>
                    <span>•</span>
                    <span>{patient.occupation}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleWhatsApp}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-200 transition-colors cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>{patient.phone}</span>
              <ExternalLink className="w-3 h-3 ml-0.5" />
            </button>

            <button
              onClick={() => onEditPatient(patient)}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200 cursor-pointer"
              title="Editar dados cadastrais"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation including Antes & Depois */}
        <div className="flex items-center gap-2 overflow-x-auto border-t border-slate-100 mt-6 pt-4 text-xs font-semibold">
          {[
            { id: 'overview', label: 'Visão Geral', icon: <User className="w-4 h-4" /> },
            { id: 'anamnesis', label: 'Anamnese Clínica', icon: <FileText className="w-4 h-4" /> },
            {
              id: 'anthropometry',
              label: `Antropometria (${anthropometryList.length})`,
              icon: <Activity className="w-4 h-4" />,
            },
            {
              id: 'diet_plans',
              label: `Planos Alimentares (${dietPlans.length})`,
              icon: <UtensilsCrossed className="w-4 h-4" />,
            },
            {
              id: 'supplements',
              label: `Suplementação (${supplements.length})`,
              icon: <Pill className="w-4 h-4" />,
            },
            {
              id: 'appointments',
              label: `Consultas (${patientAppointments.length})`,
              icon: <Calendar className="w-4 h-4" />,
            },
            {
              id: 'before_after',
              label: `Antes & Depois (${photos.length})`,
              icon: <Camera className="w-4 h-4" />,
            },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabKey)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Top Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Peso & IMC Atual
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-800">
                  {latestAssessment ? `${latestAssessment.weight}kg` : '--'}
                </span>
                {latestAssessment && (
                  <span className="text-xs text-slate-500 font-semibold">
                    (IMC: {latestAssessment.bmi})
                  </span>
                )}
              </div>
              <p className="text-[11px] text-emerald-600 font-medium pt-1">
                {latestAssessment
                  ? calculateBMI(latestAssessment.weight, latestAssessment.height).classification
                  : 'Nenhuma medição'}
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Gordura Corporal
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-800">
                  {latestAssessment?.bodyFatPercentage ? `${latestAssessment.bodyFatPercentage}%` : '--'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium pt-1">
                {latestAssessment?.leanMassKg ? `Massa Magra: ${latestAssessment.leanMassKg}kg` : '--'}
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Plano Alimentar Ativo
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-emerald-700">
                  {activePlan ? `${activePlan.targetCalories} kcal` : 'Sem plano'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 truncate pt-1">
                {activePlan ? `${activePlan.meals.length} refeições cadastradas` : 'Clique para montar'}
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Droplet className="w-3.5 h-3.5 text-blue-500" /> Meta Hídrica Diária
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-blue-600">{waterTarget} ml</span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium pt-1">
                ~{Math.round(waterTarget / 250)} copos de 250ml ao dia
              </p>
            </div>
          </div>

          {/* Highlights & Active Diet Snippet */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Active Diet Plan Preview */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <UtensilsCrossed className="w-5 h-5 text-emerald-600" />
                  <h4 className="font-bold text-slate-800 text-sm">Plano Alimentar Atual</h4>
                </div>
                {activePlan && (
                  <button
                    onClick={() => onPrintDietPlan(patient, activePlan)}
                    className="text-xs font-semibold text-slate-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Imprimir / PDF</span>
                  </button>
                )}
              </div>

              {activePlan ? (
                <div className="space-y-3">
                  <div>
                    <h5 className="font-bold text-slate-800 text-sm">{activePlan.title}</h5>
                    <p className="text-xs text-slate-500 mt-0.5">{activePlan.description}</p>
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="bg-emerald-50 text-emerald-800 font-bold px-2.5 py-1 rounded-lg border border-emerald-200">
                      {activePlan.targetCalories} kcal
                    </span>
                    <span className="bg-blue-50 text-blue-800 font-semibold px-2.5 py-1 rounded-lg border border-blue-200">
                      Proteínas: {activePlan.targetProtein}g
                    </span>
                    <span className="bg-emerald-50 text-emerald-800 font-semibold px-2.5 py-1 rounded-lg border border-emerald-200">
                      Carboidratos: {activePlan.targetCarbs}g
                    </span>
                    <span className="bg-amber-50 text-amber-800 font-semibold px-2.5 py-1 rounded-lg border border-amber-200">
                      Gorduras: {activePlan.targetFats}g
                    </span>
                  </div>

                  <div className="space-y-2 pt-2">
                    {activePlan.meals.map((meal) => (
                      <div
                        key={meal.id}
                        className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between text-xs"
                      >
                        <div>
                          <strong className="text-slate-800 font-bold">{meal.name}</strong>
                          <span className="text-slate-400 ml-2 font-mono">{meal.time}</span>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {meal.items.map((i) => `${i.foodName} (${i.quantity} ${i.unit})`).join(', ')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => onOpenDietPlanner(patient, activePlan)}
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors text-center cursor-pointer"
                  >
                    Editar este Plano Alimentar
                  </button>
                </div>
              ) : (
                <div className="text-center py-6 space-y-3">
                  <p className="text-xs text-slate-500">Nenhum plano alimentar cadastrado.</p>
                  <button
                    onClick={() => onOpenDietPlanner(patient)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Montar Primeiro Plano
                  </button>
                </div>
              )}
            </div>

            {/* Anamnesis & Clinical Highlights */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-600" />
                  <h4 className="font-bold text-slate-800 text-sm">Resumo da Anamnese</h4>
                </div>
                <button
                  onClick={() => setActiveTab('anamnesis')}
                  className="text-xs font-semibold text-emerald-700 hover:underline cursor-pointer"
                >
                  Ver Completa
                </button>
              </div>

              {anamnesis ? (
                <div className="space-y-3 text-xs">
                  {anamnesis.mainComplaint && (
                    <div>
                      <strong className="text-slate-700 font-bold block mb-0.5">Queixa Principal:</strong>
                      <p className="text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 italic">
                        "{anamnesis.mainComplaint}"
                      </p>
                    </div>
                  )}

                  {anamnesis.lifestyle?.physicalActivity && (
                    <div>
                      <strong className="text-slate-700 font-bold block mb-0.5">Atividade Física:</strong>
                      <p className="text-slate-600">
                        {anamnesis.lifestyle.physicalActivity} ({anamnesis.lifestyle.activityFrequency})
                      </p>
                    </div>
                  )}

                  {anamnesis.dietaryHistory?.preferredFoods && (
                    <div>
                      <strong className="text-slate-700 font-bold block mb-0.5">Alimentos Preferidos:</strong>
                      <p className="text-slate-600">{anamnesis.dietaryHistory.preferredFoods}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6 space-y-3">
                  <p className="text-xs text-slate-500">Anamnese não preenchida ainda.</p>
                  <button
                    onClick={() => setActiveTab('anamnesis')}
                    className="px-4 py-2 bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Preencher Anamnese
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Anamnesis */}
      {activeTab === 'anamnesis' && (
        <AnamnesisForm
          patient={patient}
          initialAnamnesis={anamnesis}
          onSave={onSaveAnamnesis}
        />
      )}

      {/* Tab 3: Anthropometry */}
      {activeTab === 'anthropometry' && (
        <AnthropometryModule
          patient={patient}
          assessments={anthropometryList}
          onAddAssessment={onAddAnthropometry}
          onDeleteAssessment={onDeleteAnthropometry}
        />
      )}

      {/* Tab 4: Diet Plans */}
      {activeTab === 'diet_plans' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200">
            <div>
              <h3 className="font-bold text-slate-800 text-base">Planos Alimentares</h3>
              <p className="text-xs text-slate-500">Histórico de dietas prescritas para {patient.name}</p>
            </div>
            <button
              onClick={() => onOpenDietPlanner(patient)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs cursor-pointer"
            >
              <UtensilsCrossed className="w-4 h-4" />
              <span>Criar Novo Plano Alimentar</span>
            </button>
          </div>

          {dietPlans.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
              <UtensilsCrossed className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-500">Nenhum plano alimentar cadastrado.</p>
              <button
                onClick={() => onOpenDietPlanner(patient)}
                className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Montar Plano Agora
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {dietPlans.map((plan) => (
                <div
                  key={plan.id}
                  className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-800 text-base">{plan.title}</h4>
                        {plan.active && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                            Ativo
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">Criado em {plan.createdAt.split('T')[0]}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onPrintDietPlan(patient, plan)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Imprimir / Gerar PDF</span>
                      </button>
                      <button
                        onClick={() => onOpenDietPlanner(patient, plan)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Editar Plano</span>
                      </button>
                    </div>
                  </div>

                  {plan.description && <p className="text-xs text-slate-600 italic">"{plan.description}"</p>}

                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="bg-emerald-50 text-emerald-900 font-bold px-2.5 py-1 rounded-lg border border-emerald-200">
                      {plan.targetCalories} kcal
                    </span>
                    <span className="bg-blue-50 text-blue-800 font-semibold px-2.5 py-1 rounded-lg border border-blue-200">
                      Proteínas: {plan.targetProtein}g
                    </span>
                    <span className="bg-emerald-50 text-emerald-800 font-semibold px-2.5 py-1 rounded-lg border border-emerald-200">
                      Carboidratos: {plan.targetCarbs}g
                    </span>
                    <span className="bg-amber-50 text-amber-800 font-semibold px-2.5 py-1 rounded-lg border border-amber-200">
                      Gorduras: {plan.targetFats}g
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                    {plan.meals.map((meal) => (
                      <div key={meal.id} className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800">{meal.name}</span>
                          <span className="font-mono text-slate-400 text-[11px]">{meal.time}</span>
                        </div>
                        <ul className="text-slate-600 space-y-1 list-disc list-inside">
                          {meal.items.map((item) => (
                            <li key={item.id} className="text-[11px]">
                              <strong>{item.foodName}</strong> ({item.quantity} {item.unit}) - <span className="text-slate-400">{item.calories} kcal</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Supplements */}
      {activeTab === 'supplements' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-800 text-base">Prescrição de Suplementos</h3>
              <p className="text-xs text-slate-500">Suplementação e fitoterápicos indicados para {patient.name}</p>
            </div>
            {onSaveSupplement && (
              <button
                onClick={() => {
                  setSupplementToEdit(null);
                  setIsSupplementModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar Suplemento</span>
              </button>
            )}
          </div>

          {supplements.length === 0 ? (
            <div className="text-center py-10 space-y-3">
              <Pill className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-400">Nenhum suplemento prescrito ainda.</p>
              {onSaveSupplement && (
                <button
                  onClick={() => {
                    setSupplementToEdit(null);
                    setIsSupplementModalOpen(true);
                  }}
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl cursor-pointer"
                >
                  Prescrever Primeiro Suplemento
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {supplements.map((sup) => (
                <div key={sup.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2 text-xs flex flex-col justify-between group hover:border-emerald-300 transition-colors">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 text-sm">{sup.name}</span>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        {sup.dosage}
                      </span>
                    </div>
                    <p className="text-slate-600"><strong>Horário:</strong> {sup.timing}</p>
                    {sup.instructions && (
                      <p className="text-slate-500 italic bg-white p-2 rounded-lg border border-slate-100">
                        {sup.instructions}
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-200/80 flex items-center justify-end gap-1">
                    {onSaveSupplement && (
                      <button
                        onClick={() => {
                          setSupplementToEdit(sup);
                          setIsSupplementModalOpen(true);
                        }}
                        className="flex items-center gap-1 px-2.5 py-1 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer"
                        title="Editar suplemento"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Editar</span>
                      </button>
                    )}
                    {onDeleteSupplement && (
                      <button
                        onClick={() => {
                          if (confirm(`Deseja excluir a prescrição de "${sup.name}"?`)) {
                            onDeleteSupplement(patient.id, sup.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Excluir suplemento"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 6: Appointments */}
      {activeTab === 'appointments' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-800 text-base">Histórico de Consultas</h3>
              <p className="text-xs text-slate-500">Agendamentos e retornos de {patient.name}</p>
            </div>
            {onSaveAppointment && (
              <button
                onClick={() => {
                  setAppointmentToEdit(null);
                  setIsAppointmentModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Agendar Nova Consulta</span>
              </button>
            )}
          </div>

          {patientAppointments.length === 0 ? (
            <div className="text-center py-10 space-y-3">
              <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-400">Nenhuma consulta registrada para este paciente.</p>
              {onSaveAppointment && (
                <button
                  onClick={() => {
                    setAppointmentToEdit(null);
                    setIsAppointmentModalOpen(true);
                  }}
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl cursor-pointer"
                >
                  Agendar Primeira Consulta
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {patientAppointments.map((apt) => (
                <div key={apt.id} className="p-3.5 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-slate-50/50 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <span className="font-bold text-slate-800">{apt.date} às {apt.time}</span>
                      <span className="text-slate-400 ml-2">
                        ({apt.type === 'first_consultation' ? 'Primeira Consulta' : apt.type === 'follow_up' ? 'Retorno' : apt.type === 'evaluation' ? 'Avaliação' : apt.type === 'online' ? 'Online' : apt.type})
                      </span>
                      {apt.notes && <p className="text-slate-500 text-[11px] mt-0.5">{apt.notes}</p>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <span className="font-bold px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase text-[10px]">
                      {apt.status === 'confirmed' ? 'Confirmada' : apt.status === 'scheduled' ? 'Agendada' : apt.status === 'completed' ? 'Realizada' : apt.status === 'cancelled' ? 'Cancelada' : apt.status}
                    </span>

                    {onSaveAppointment && (
                      <button
                        onClick={() => {
                          setAppointmentToEdit(apt);
                          setIsAppointmentModalOpen(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                        title="Editar consulta"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {onDeleteAppointment && (
                      <button
                        onClick={() => {
                          if (confirm('Deseja excluir esta consulta?')) {
                            onDeleteAppointment(apt.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Excluir consulta"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 7: Antes & Depois (Evolução Fotográfica) */}
      {activeTab === 'before_after' && (
        <BeforeAfterModule
          patient={patient}
          photos={photos}
          onAddPhoto={onAddPhoto}
          onDeletePhoto={onDeletePhoto}
          currentWeight={latestAssessment?.weight}
        />
      )}

      {/* Supplement Modal */}
      {onSaveSupplement && (
        <SupplementModal
          isOpen={isSupplementModalOpen}
          onClose={() => {
            setIsSupplementModalOpen(false);
            setSupplementToEdit(null);
          }}
          patients={patients}
          selectedPatientId={patient.id}
          supplementToEdit={supplementToEdit}
          onSave={onSaveSupplement}
        />
      )}

      {/* Appointment Modal */}
      {onSaveAppointment && (
        <AppointmentModal
          isOpen={isAppointmentModalOpen}
          onClose={() => {
            setIsAppointmentModalOpen(false);
            setAppointmentToEdit(null);
          }}
          patients={patients}
          appointmentToEdit={appointmentToEdit}
          onSave={onSaveAppointment}
        />
      )}

      {/* Energy Calculator Modal */}
      <EnergyCalculatorModal
        isOpen={showEnergyModal}
        onClose={() => setShowEnergyModal(false)}
        patient={patient}
        latestAssessment={latestAssessment}
        onApplyToDiet={handleApplyEnergyCalc}
      />
    </div>
  );
};
