import React from 'react';
import { ArrowLeft, Printer, Pill, Sparkles, Clock, CheckCircle2 } from 'lucide-react';
import type { Patient, Supplement, ClinicProfile } from '../../types';
import { calculateAge } from '../../utils/nutritionCalculations';

interface PrintableSupplementsViewProps {
  patient: Patient;
  supplements: Supplement[];
  clinicProfile: ClinicProfile;
  onBack: () => void;
}

export const PrintableSupplementsView: React.FC<PrintableSupplementsViewProps> = ({
  patient,
  supplements,
  clinicProfile,
  onBack,
}) => {
  const age = calculateAge(patient.birthDate);
  const activeSupplements = supplements.filter((s) => s.active !== false);
  const today = new Date().toLocaleDateString('pt-BR');

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
              Tipo de Documento
            </span>
            <strong className="text-emerald-800 font-bold text-sm">Prescrição de Suplementação</strong>
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
            <Pill className="w-5 h-5 text-emerald-600" />
            <span>Prescrição e Orientação de Suplementação Nutricional</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Prescrição individualizada formulada com base nas necessidades clínicas, metabólicas e rotina de treinos.
          </p>
        </div>

        {/* Supplements List */}
        {activeSupplements.length === 0 ? (
          <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-xl">
            <p className="text-xs text-slate-500 font-medium">Nenhum suplemento ativo cadastrado no momento.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeSupplements.map((sup, idx) => (
              <div
                key={sup.id}
                className="border border-slate-200 rounded-xl overflow-hidden break-inside-avoid shadow-2xs"
              >
                <div className="bg-slate-100/80 px-4 py-2.5 flex items-center justify-between border-b border-slate-200">
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm">{sup.name}</h3>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{sup.timing}</span>
                  </span>
                </div>

                <div className="p-4 space-y-2 text-xs">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                      Dosagem / Posologia:
                    </span>
                    <strong className="text-slate-900 font-bold text-sm bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                      {sup.dosage}
                    </strong>
                  </div>

                  {sup.instructions && (
                    <div className="pt-2 border-t border-slate-100">
                      <span className="text-slate-500 font-semibold block text-[11px] mb-0.5">
                        Instruções e Modo de Uso:
                      </span>
                      <p className="text-slate-700 leading-relaxed bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                        {sup.instructions}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* General Guidelines for Supplementation */}
        <div className="border border-slate-200 rounded-xl p-5 space-y-3 break-inside-avoid bg-slate-50/50">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Orientações Gerais de Uso e Segurança</span>
          </h3>
          <ul className="text-xs text-slate-700 space-y-1.5 list-disc list-inside leading-relaxed">
            <li>Não altere as dosagens prescritas sem prévia orientação nutricional.</li>
            <li>Mantenha os suplementos em local seco, fresco e ao abrigo da luz solar direta.</li>
            <li>A suplementação tem caráter complementar e não substitui uma alimentação equilibrada.</li>
            <li>Em caso de reações adversas ou desconfortos gastrointestinais, suspenda o uso e informe a nutricionista.</li>
          </ul>
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
