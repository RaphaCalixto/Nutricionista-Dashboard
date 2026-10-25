import React from 'react';
import { ArrowLeft, Printer, Activity, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { Patient, Anthropometry, ClinicProfile } from '../../types';
import { calculateAge, calculateBMI, calculateWHR } from '../../utils/nutritionCalculations';

interface PrintableAnthropometryViewProps {
  patient: Patient;
  assessment?: Anthropometry;
  history?: Anthropometry[];
  clinicProfile: ClinicProfile;
  onBack: () => void;
}

export const PrintableAnthropometryView: React.FC<PrintableAnthropometryViewProps> = ({
  patient,
  assessment,
  history = [],
  clinicProfile,
  onBack,
}) => {
  const age = calculateAge(patient.birthDate);
  const current = assessment || history[history.length - 1];
  const sortedHistory = [...history].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const bmiData = current ? calculateBMI(current.weight, current.height) : null;
  const whrData =
    current && current.waist && current.hip
      ? calculateWHR(current.waist, current.hip, patient.gender)
      : null;

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
            <strong className="text-emerald-800 font-bold text-sm">Avaliação Antropométrica</strong>
          </div>

          <div>
            <span className="text-slate-400 uppercase font-bold text-[10px] tracking-wider block">
              Data da Avaliação
            </span>
            <span className="font-medium text-slate-600">
              {current ? current.date : new Date().toLocaleDateString('pt-BR')}
            </span>
          </div>
        </div>

        {/* Document Title */}
        <div>
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-600" />
            <span>Relatório de Composição Corporal & Antropometria</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Diagnóstico antropométrico, distribuição de massa corporal e evolução das medidas físicas.
          </p>
        </div>

        {!current ? (
          <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-xl">
            <p className="text-xs text-slate-500 font-medium">Nenhuma avaliação antropométrica registrada.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Primary KPI Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="text-slate-400 uppercase font-bold text-[10px] tracking-wider block">
                  Peso Corporal
                </span>
                <div className="text-2xl font-black text-slate-900 mt-1">
                  {current.weight} <span className="text-xs font-normal text-slate-500">kg</span>
                </div>
                <span className="text-[11px] text-slate-500 font-medium">Altura: {current.height} cm</span>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="text-slate-400 uppercase font-bold text-[10px] tracking-wider block">
                  Índice de Massa Corporal (IMC)
                </span>
                <div className="text-2xl font-black text-slate-900 mt-1">
                  {current.bmi} <span className="text-xs font-normal text-slate-500">kg/m²</span>
                </div>
                {bmiData && (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                    {bmiData.classification}
                  </span>
                )}
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="text-slate-400 uppercase font-bold text-[10px] tracking-wider block">
                  Percentual de Gordura (%G)
                </span>
                <div className="text-2xl font-black text-slate-900 mt-1">
                  {current.bodyFatPercentage ? `${current.bodyFatPercentage}%` : '--'}
                </div>
                <span className="text-[11px] text-slate-500 font-medium">
                  Protocolo: {current.protocol || 'bioimpedance'}
                </span>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="text-slate-400 uppercase font-bold text-[10px] tracking-wider block">
                  Massa Magra / Gorda
                </span>
                <div className="text-sm font-bold text-slate-900 mt-1">
                  Magra: <strong className="text-emerald-700">{current.leanMassKg ? `${current.leanMassKg}kg` : '--'}</strong>
                </div>
                <div className="text-sm font-bold text-slate-700">
                  Gorda: <strong className="text-amber-700">{current.fatMassKg ? `${current.fatMassKg}kg` : '--'}</strong>
                </div>
              </div>
            </div>

            {/* Circumferences Section */}
            <div className="border border-slate-200 rounded-xl overflow-hidden break-inside-avoid shadow-2xs">
              <div className="bg-slate-100/80 px-4 py-2.5 border-b border-slate-200">
                <h3 className="font-bold text-slate-900 text-sm">Circunferências Corporais (cm)</h3>
              </div>
              <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Cintura</span>
                  <strong className="text-slate-900 text-base">{current.waist ? `${current.waist} cm` : '--'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Quadril</span>
                  <strong className="text-slate-900 text-base">{current.hip ? `${current.hip} cm` : '--'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Relação Cintura/Quadril (RCQ)</span>
                  <strong className="text-slate-900 text-base">
                    {whrData ? `${whrData.ratio} (${whrData.risk})` : '--'}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Abdômen</span>
                  <strong className="text-slate-900 text-base">{current.abdomen ? `${current.abdomen} cm` : '--'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Braço Relaxado</span>
                  <strong className="text-slate-900 text-base">{current.armRelaxed ? `${current.armRelaxed} cm` : '--'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Braço Contraído</span>
                  <strong className="text-slate-900 text-base">{current.armContracted ? `${current.armContracted} cm` : '--'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Coxa</span>
                  <strong className="text-slate-900 text-base">{current.thigh ? `${current.thigh} cm` : '--'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Panturrilha</span>
                  <strong className="text-slate-900 text-base">{current.calf ? `${current.calf} cm` : '--'}</strong>
                </div>
              </div>
            </div>

            {/* Skinfolds (if any present) */}
            {(current.skinfoldTriceps || current.skinfoldAbdominal || current.skinfoldSubscapular) && (
              <div className="border border-slate-200 rounded-xl overflow-hidden break-inside-avoid shadow-2xs">
                <div className="bg-slate-100/80 px-4 py-2.5 border-b border-slate-200">
                  <h3 className="font-bold text-slate-900 text-sm">Dobras Cutâneas (mm)</h3>
                </div>
                <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                  {current.skinfoldTriceps && (
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Tríceps</span>
                      <strong className="text-slate-900 text-base">{current.skinfoldTriceps} mm</strong>
                    </div>
                  )}
                  {current.skinfoldSubscapular && (
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Subescapular</span>
                      <strong className="text-slate-900 text-base">{current.skinfoldSubscapular} mm</strong>
                    </div>
                  )}
                  {current.skinfoldSuprailiac && (
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Suprailíaca</span>
                      <strong className="text-slate-900 text-base">{current.skinfoldSuprailiac} mm</strong>
                    </div>
                  )}
                  {current.skinfoldAbdominal && (
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Abdominal</span>
                      <strong className="text-slate-900 text-base">{current.skinfoldAbdominal} mm</strong>
                    </div>
                  )}
                  {current.skinfoldThigh && (
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Coxa</span>
                      <strong className="text-slate-900 text-base">{current.skinfoldThigh} mm</strong>
                    </div>
                  )}
                  {current.skinfoldChest && (
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Peitoral</span>
                      <strong className="text-slate-900 text-base">{current.skinfoldChest} mm</strong>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Evolution Comparison Table */}
            {sortedHistory.length > 1 && (
              <div className="border border-slate-200 rounded-xl overflow-hidden break-inside-avoid shadow-2xs">
                <div className="bg-slate-100/80 px-4 py-2.5 border-b border-slate-200">
                  <h3 className="font-bold text-slate-900 text-sm">Histórico e Evolução Antropométrica</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-200">
                      <tr>
                        <th className="p-3">Data</th>
                        <th className="p-3">Peso</th>
                        <th className="p-3">IMC</th>
                        <th className="p-3">% Gordura</th>
                        <th className="p-3">Massa Magra</th>
                        <th className="p-3">Cintura</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {sortedHistory.map((item, idx) => {
                        const prev = idx > 0 ? sortedHistory[idx - 1] : null;
                        const weightDiff = prev ? Math.round((item.weight - prev.weight) * 10) / 10 : null;

                        return (
                          <tr key={item.id} className="hover:bg-slate-50/50">
                            <td className="p-3 font-semibold text-slate-900">{item.date}</td>
                            <td className="p-3 font-bold text-slate-800">
                              {item.weight} kg
                              {weightDiff !== null && weightDiff !== 0 && (
                                <span className={`ml-1 text-[10px] font-bold ${weightDiff < 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                                  ({weightDiff > 0 ? `+${weightDiff}` : weightDiff})
                                </span>
                              )}
                            </td>
                            <td className="p-3 text-slate-700">{item.bmi}</td>
                            <td className="p-3 text-slate-700">{item.bodyFatPercentage ? `${item.bodyFatPercentage}%` : '--'}</td>
                            <td className="p-3 text-slate-700">{item.leanMassKg ? `${item.leanMassKg} kg` : '--'}</td>
                            <td className="p-3 text-slate-700">{item.waist ? `${item.waist} cm` : '--'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Notes if any */}
            {current.notes && (
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 text-xs text-slate-700 break-inside-avoid">
                <strong className="block text-slate-900 mb-1">Observações da Avaliação:</strong>
                <p className="leading-relaxed">{current.notes}</p>
              </div>
            )}
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
