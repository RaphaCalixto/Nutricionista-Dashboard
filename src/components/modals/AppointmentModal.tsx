import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, Phone, Check, DollarSign, Video } from 'lucide-react';
import { Appointment, Patient, AppointmentType, AppointmentStatus } from '../../types';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (appointment: Partial<Appointment> & { patientName: string; date: string; time: string }) => Promise<void>;
  patients: Patient[];
  appointmentToEdit?: Appointment | null;
  initialDate?: string;
}

export const AppointmentModal: React.FC<AppointmentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  patients,
  appointmentToEdit,
  initialDate,
}) => {
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [date, setDate] = useState(initialDate || new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('09:00');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [type, setType] = useState<AppointmentType>('follow_up');
  const [status, setStatus] = useState<AppointmentStatus>('scheduled');
  const [price, setPrice] = useState<number>(250);
  const [paid, setPaid] = useState<boolean>(false);
  const [notes, setNotes] = useState('');
  const [meetUrl, setMeetUrl] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (appointmentToEdit) {
      setSelectedPatientId(appointmentToEdit.patientId || '');
      setPatientName(appointmentToEdit.patientName);
      setPatientPhone(appointmentToEdit.patientPhone);
      setDate(appointmentToEdit.date);
      setTime(appointmentToEdit.time);
      setDurationMinutes(appointmentToEdit.durationMinutes);
      setType(appointmentToEdit.type);
      setStatus(appointmentToEdit.status);
      setPrice(appointmentToEdit.price || 0);
      setPaid(Boolean(appointmentToEdit.paid));
      setNotes(appointmentToEdit.notes || '');
      setMeetUrl(appointmentToEdit.meetUrl || '');
    } else {
      if (patients.length > 0) {
        setSelectedPatientId(patients[0].id);
        setPatientName(patients[0].name);
        setPatientPhone(patients[0].phone);
      } else {
        setSelectedPatientId('');
        setPatientName('');
        setPatientPhone('');
      }
      setDate(initialDate || new Date().toISOString().split('T')[0]);
      setTime('09:00');
      setDurationMinutes(60);
      setType('follow_up');
      setStatus('scheduled');
      setPrice(250);
      setPaid(false);
      setNotes('');
      setMeetUrl('');
    }
  }, [appointmentToEdit, initialDate, isOpen, patients]);

  if (!isOpen) return null;

  const handlePatientSelectChange = (patientId: string) => {
    setSelectedPatientId(patientId);
    const found = patients.find((p) => p.id === patientId);
    if (found) {
      setPatientName(found.name);
      setPatientPhone(found.phone);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim() || !date || !time) return;

    setSaving(true);
    try {
      await onSave({
        id: appointmentToEdit?.id,
        patientId: selectedPatientId || undefined,
        patientName: patientName.trim(),
        patientPhone: patientPhone.trim(),
        date,
        time,
        durationMinutes,
        type,
        status,
        price,
        paid,
        notes: notes.trim() || undefined,
        meetUrl: meetUrl.trim() || undefined,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">
                {appointmentToEdit ? 'Editar Consulta' : 'Agendar Nova Consulta'}
              </h3>
              <p className="text-xs text-slate-500">Defina os detalhes e horário do atendimento</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {/* Patient Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Selecionar Paciente Cadastrado
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                value={selectedPatientId}
                onChange={(e) => handlePatientSelectChange(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-semibold focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">-- Outro / Paciente Novo --</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.phone})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Nome e Telefone se for avulso */}
          {!selectedPatientId && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Nome do Paciente *</label>
                <input
                  type="text"
                  required
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="Nome do paciente"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">WhatsApp / Telefone</label>
                <input
                  type="text"
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                  placeholder="(11) 98765-4321"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          )}

          {/* Data, Horário e Duração */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Data *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Horário *
              </label>
              <input
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Duração (min)
              </label>
              <select
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
              >
                <option value={30}>30 min</option>
                <option value={45}>45 min</option>
                <option value={60}>60 min (Padrão)</option>
                <option value={90}>90 min</option>
              </select>
            </div>
          </div>

          {/* Tipo e Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Tipo de Consulta
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as AppointmentType)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-semibold"
              >
                <option value="first_consultation">Primeira Consulta (Completa)</option>
                <option value="follow_up">Retorno / Acompanhamento</option>
                <option value="evaluation">Avaliação Antropométrica</option>
                <option value="online">Consulta Online (Videoconferência)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as AppointmentStatus)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-bold text-slate-800"
              >
                <option value="scheduled">Agendada</option>
                <option value="confirmed">Confirmada</option>
                <option value="completed">Realizada</option>
                <option value="cancelled">Cancelada</option>
                <option value="no_show">Não compareceu</option>
              </select>
            </div>
          </div>

          {/* Valor da Consulta & Status de Pagamento */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Valor da Consulta (R$)</label>
              <div className="relative">
                <DollarSign className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full pl-8 pr-2 py-1.5 text-xs rounded-lg border border-slate-300 font-bold text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Status do Pagamento</label>
              <button
                type="button"
                onClick={() => setPaid(!paid)}
                className={`w-full py-1.5 text-xs font-bold rounded-lg border transition-all ${
                  paid
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : 'bg-white text-slate-600 border-slate-300'
                }`}
              >
                {paid ? '✓ Pago' : 'Pendente de Pagamento'}
              </button>
            </div>
          </div>

          {/* Link da Reunião se for Online */}
          {type === 'online' && (
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1 flex items-center gap-1">
                <Video className="w-3.5 h-3.5 text-blue-500" />
                <span>Link da Videochamada (Google Meet / Zoom)</span>
              </label>
              <input
                type="url"
                value={meetUrl}
                onChange={(e) => setMeetUrl(e.target.value)}
                placeholder="https://meet.google.com/xyz-abcd-efg"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          )}

          {/* Anotações */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Observações / Lembretes da Consulta
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Trazer últimos exames de sangue em jejum..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 resize-none"
            />
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] rounded-xl shadow-xs flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{saving ? 'Salvando...' : appointmentToEdit ? 'Atualizar Consulta' : 'Agendar Consulta'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
