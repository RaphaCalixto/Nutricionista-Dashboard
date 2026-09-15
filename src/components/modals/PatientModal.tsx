import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  User,
  Phone,
  Mail,
  Calendar,
  Target,
  Briefcase,
  FileText,
  Check,
  Upload,
  Image as ImageIcon,
  Link,
  Trash2
} from 'lucide-react';
import type { Patient, PatientGoal, Gender } from '../../types';

interface PatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (patient: Partial<Patient> & { name: string }) => Promise<void>;
  patientToEdit?: Patient | null;
}

export const PatientModal: React.FC<PatientModalProps> = ({
  isOpen,
  onClose,
  onSave,
  patientToEdit,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('1995-01-01');
  const [gender, setGender] = useState<Gender>('female');
  const [occupation, setOccupation] = useState('');
  const [goal, setGoal] = useState<PatientGoal>('weight_loss');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [notes, setNotes] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoMode, setPhotoMode] = useState<'upload' | 'url'>('upload');
  const [saving, setSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (patientToEdit) {
      setName(patientToEdit.name);
      setEmail(patientToEdit.email);
      setPhone(patientToEdit.phone);
      setBirthDate(patientToEdit.birthDate);
      setGender(patientToEdit.gender);
      setOccupation(patientToEdit.occupation || '');
      setGoal(patientToEdit.goal);
      setStatus(patientToEdit.status);
      setNotes(patientToEdit.notes || '');
      setPhotoUrl(patientToEdit.photoUrl || '');
    } else {
      setName('');
      setEmail('');
      setPhone('');
      setBirthDate('1995-01-01');
      setGender('female');
      setOccupation('');
      setGoal('weight_loss');
      setStatus('active');
      setNotes('');
      setPhotoUrl('');
    }
  }, [patientToEdit, isOpen]);

  if (!isOpen) return null;

  // Handle local file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate image type
      if (!file.type.startsWith('image/')) {
        alert('Por favor, selecione um arquivo de imagem válido.');
        return;
      }
      // Compress / read as data URL
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPhotoUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    try {
      await onSave({
        id: patientToEdit?.id,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        birthDate,
        gender,
        occupation: occupation.trim(),
        goal,
        status,
        notes: notes.trim(),
        photoUrl: photoUrl.trim() || undefined,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">
                {patientToEdit ? 'Editar Paciente' : 'Novo Paciente'}
              </h3>
              <p className="text-xs text-slate-500">Preencha os dados do prontuário do paciente</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Nome completo */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Nome Completo *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Camila Silva Santos"
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Telefone / WhatsApp & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                WhatsApp / Telefone *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(11) 98765-4321"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                E-mail
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="paciente@email.com"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>

          {/* Data de Nascimento & Gênero */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Data de Nascimento
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Gênero Biológico (para cálculos)
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setGender('female')}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all ${
                    gender === 'female'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Feminino
                </button>
                <button
                  type="button"
                  onClick={() => setGender('male')}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all ${
                    gender === 'male'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Masculino
                </button>
              </div>
            </div>
          </div>

          {/* Objetivo Principal & Profissão */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Objetivo Nutricional
              </label>
              <div className="relative">
                <Target className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <select
                  value={goal}
                  onChange={(e) => setGoal(e.target.value as PatientGoal)}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-white font-semibold"
                >
                  <option value="weight_loss">Emagrecimento / Perda de Gordura</option>
                  <option value="hypertrophy">Hipertrofia / Ganho de Massa</option>
                  <option value="maintenance">Manutenção & Reeducação Alimentar</option>
                  <option value="health_clinical">Saúde Clínica / Patologias</option>
                  <option value="performance">Performance Esportiva</option>
                  <option value="pregnancy_lactation">Gestação / Lactação</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Profissão / Ocupação
              </label>
              <div className="relative">
                <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  placeholder="Ex: Arquiteta, Estudante"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Status de Atendimento
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-white"
            >
              <option value="active">Ativo (Em Acompanhamento)</option>
              <option value="inactive">Inativo / Alta Nutricional</option>
            </select>
          </div>

          {/* Foto do Paciente: Upload do Arquivo OU URL */}
          <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
                <span>Foto do Paciente (Opcional)</span>
              </label>

              {/* Mode Toggle */}
              <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200 text-[11px] font-semibold">
                <button
                  type="button"
                  onClick={() => setPhotoMode('upload')}
                  className={`px-2 py-0.5 rounded-md transition-colors flex items-center gap-1 ${
                    photoMode === 'upload'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Upload className="w-3 h-3" />
                  <span>Upload</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPhotoMode('url')}
                  className={`px-2 py-0.5 rounded-md transition-colors flex items-center gap-1 ${
                    photoMode === 'url'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Link className="w-3 h-3" />
                  <span>URL</span>
                </button>
              </div>
            </div>

            {/* Photo preview if present */}
            {photoUrl ? (
              <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-emerald-200">
                <img
                  src={photoUrl}
                  alt="Preview"
                  className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-800">Foto selecionada</p>
                  <p className="text-[11px] text-emerald-700 font-medium truncate">
                    {photoUrl.startsWith('data:') ? 'Imagem carregada com sucesso' : photoUrl}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPhotoUrl('')}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                  title="Remover foto"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : photoMode === 'upload' ? (
              /* Upload File Box */
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/40 p-4 rounded-xl text-center cursor-pointer transition-all flex flex-col items-center gap-1.5 group"
                >
                  <div className="w-8 h-8 rounded-full bg-white text-emerald-600 shadow-xs flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Upload className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-700 group-hover:text-emerald-700">
                    Clique para escolher uma foto do computador ou celular
                  </span>
                  <span className="text-[10px] text-slate-400">PNG, JPG ou JPEG até 5MB</span>
                </div>
              </div>
            ) : (
              /* URL Input Box */
              <div className="relative">
                <Link className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="https://exemplo.com/foto.jpg"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              </div>
            )}
          </div>

          {/* Observações Iniciais */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Observações Iniciais / Resumo do Caso
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex: Paciente busca perder 5kg, treina às 18h, queixa de compulsão por doces..."
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none"
              />
            </div>
          </div>

          {/* Footer buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] rounded-xl transition-all shadow-sm shadow-emerald-600/20 flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{saving ? 'Salvando...' : patientToEdit ? 'Atualizar Paciente' : 'Cadastrar Paciente'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
