import React from 'react';
import { ArrowLeft, Printer, Download, Sparkles, Phone, Mail, MapPin, Droplet } from 'lucide-react';
import { Patient, DietPlan, ClinicProfile } from '../../types';
import { calculateAge } from '../../utils/nutritionCalculations';

interface PrintableDietViewProps {
  patient: Patient;
  plan: DietPlan;
  clinicProfile: ClinicProfile;
  onBack: () => void;
}

export const PrintableDietView: React.FC<PrintableDietViewProps> = ({
  patient,
  plan,
  clinicProfile,
  onBack,
}) => {
  const age = calculateAge(patient.birthDate);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top action bar (hidden during print) */}
      <div className="no-print flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-emerald-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao Sistema</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-xs font-bold rounded-xl shadow-sm shadow-emerald-600/20 transition-all"
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
              VET / Meta Calórica
            </span>
            <strong className="text-emerald-800 font-bold text-sm">{plan.targetCalories} kcal</strong>
          </div>

          <div>
            <span className="text-slate-400 uppercase font-bold text-[10px] tracking-wider block">
              Data de Elaboração
            </span>
            <span className="font-medium text-slate-600">{plan.createdAt.split('T')[0]}</span>
          </div>
        </div>

        {/* Plan Title & Notes */}
        <div>
          <h2 className="text-lg font-black text-slate-900">{plan.title}</h2>
          {plan.description && <p className="text-xs text-slate-600 mt-1 italic">"{plan.description}"</p>}
        </div>

        {/* Meals Section */}
        <div className="space-y-6">
          {plan.meals.map((meal, idx) => (
            <div
              key={meal.id}
              className="border border-slate-200 rounded-xl overflow-hidden break-inside-avoid shadow-2xs"
            >
              <div className="bg-slate-100/80 px-4 py-2.5 flex items-center justify-between border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <h3 className="font-bold text-slate-900 text-sm">{meal.name}</h3>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {meal.time}
                </span>
              </div>

              <div className="p-4 space-y-3">
                <ul className="space-y-2 text-xs divide-y divide-slate-100">
                  {meal.items.map((item) => (
                    <li key={item.id} className="pt-2 first:pt-0">
                      <div className="flex items-baseline justify-between">
                        <div>
                          <strong className="text-slate-800 font-bold">{item.foodName}</strong>
                          <span className="text-emerald-700 font-semibold ml-2">
                            — {item.quantity} {item.unit}
                          </span>
                        </div>
                      </div>

                      {item.substitutes && item.substitutes.length > 0 && (
                        <p className="text-[11px] text-slate-500 mt-1 pl-3 border-l-2 border-slate-200">
                          <strong>Opções de Substituição:</strong> {item.substitutes.join(' | ')}
                        </p>
                      )}
                      {item.notes && (
                        <p className="text-[11px] text-slate-400 italic mt-0.5">{item.notes}</p>
                      )}
                    </li>
                  ))}
                </ul>

                {meal.notes && (
                  <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-500 italic">
                    <strong>Orientação:</strong> {meal.notes}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Guidelines & Water intake */}
        <div className="border border-slate-200 rounded-xl p-5 space-y-3 break-inside-avoid bg-slate-50/50">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Recomendações e Condutas Gerais</span>
          </h3>

          {plan.waterTargetMl && (
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-800 bg-blue-50 p-2.5 rounded-lg border border-blue-200">
              <Droplet className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                Meta hídrica diária recomendada: <strong>{plan.waterTargetMl} ml de água</strong> ao longo do dia.
              </span>
            </div>
          )}

          {plan.guidelines && plan.guidelines.length > 0 && (
            <ul className="text-xs text-slate-700 space-y-1.5 list-disc list-inside">
              {plan.guidelines.map((g, i) => (
                <li key={i} className="leading-relaxed">
                  {g}
                </li>
              ))}
            </ul>
          )}
        </div>

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
