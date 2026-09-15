import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Link, Camera, Check, Trash2, Calendar, Scale, Edit2 } from 'lucide-react';
import type { EvolutionPhoto, Patient } from '../../types';

interface EvolutionPhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  onSave: (photo: EvolutionPhoto) => Promise<void>;
  photoToEdit?: EvolutionPhoto | null;
  defaultWeight?: number;
}

export const EvolutionPhotoModal: React.FC<EvolutionPhotoModalProps> = ({
  isOpen,
  onClose,
  patient,
  onSave,
  photoToEdit,
  defaultWeight,
}) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [angle, setAngle] = useState<'front' | 'side' | 'back' | 'other'>('front');
  const [weight, setWeight] = useState<number | undefined>(defaultWeight || 76);
  const [notes, setNotes] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoMode, setPhotoMode] = useState<'upload' | 'url'>('upload');
  const [saving, setSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (photoToEdit) {
      setDate(photoToEdit.date);
      setAngle(photoToEdit.angle);
      setWeight(photoToEdit.weight);
      setNotes(photoToEdit.notes || '');
      setPhotoUrl(photoToEdit.photoUrl);
    } else {
      setDate(new Date().toISOString().split('T')[0]);
      setAngle('front');
      setWeight(defaultWeight || 76);
      setNotes('');
      setPhotoUrl('');
    }
  }, [photoToEdit, defaultWeight, isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Por favor, selecione um arquivo de imagem.');
        return;
      }
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
    if (!photoUrl) {
      alert('Por favor, faça upload de uma foto ou insira a URL.');
      return;
    }

    setSaving(true);
    try {
      const data: EvolutionPhoto = {
        id: photoToEdit?.id || `photo-${Date.now()}`,
        patientId: patient.id,
        date,
        angle,
        photoUrl,
        weight: weight ? Number(weight) : undefined,
        notes: notes.trim() || undefined,
        createdAt: photoToEdit?.createdAt || new Date().toISOString(),
      };
      await onSave(data);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              {photoToEdit ? <Edit2 className="w-5 h-5" /> : <Camera className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">
                {photoToEdit ? 'Editar / Trocar Foto de Evolução' : 'Adicionar Foto de Evolução'}
              </h3>
              <p className="text-xs text-slate-500">
                {photoToEdit ? 'Altere a foto, data, peso ou notas' : `Registre fotos de Antes/Depois de ${patient.name}`}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {/* Data & Ângulo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Data do Registro *
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Ângulo da Foto *
              </label>
              <select
                value={angle}
                onChange={(e) => setAngle(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-semibold"
              >
                <option value="front">Frente (Frontal)</option>
                <option value="side">Perfil / Lado</option>
                <option value="back">Costas (Posterior)</option>
                <option value="other">Outro Ângulo / Detalhe</option>
              </select>
            </div>
          </div>

          {/* Peso no Dia */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Peso Atual no Dia da Foto (kg)
            </label>
            <div className="relative">
              <Scale className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="number"
                step="0.1"
                value={weight || ''}
                onChange={(e) => setWeight(e.target.value ? Number(e.target.value) : undefined)}
                placeholder="Ex: 76.0"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 font-bold text-slate-800"
              />
            </div>
          </div>

          {/* Upload ou URL da Foto */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                {photoToEdit ? 'Trocar Imagem' : 'Arquivo da Imagem *'}
              </label>

              <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200 text-[11px] font-semibold">
                <button
                  type="button"
                  onClick={() => setPhotoMode('upload')}
                  className={`px-2 py-0.5 rounded-md transition-colors flex items-center gap-1 ${
                    photoMode === 'upload' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  <Upload className="w-3 h-3" />
                  <span>Upload</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPhotoMode('url')}
                  className={`px-2 py-0.5 rounded-md transition-colors flex items-center gap-1 ${
                    photoMode === 'url' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  <Link className="w-3 h-3" />
                  <span>URL</span>
                </button>
              </div>
            </div>

            {photoUrl ? (
              <div className="space-y-2">
                <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-emerald-200">
                  <img
                    src={photoUrl}
                    alt="Preview"
                    className="w-16 h-20 rounded-lg object-cover border border-slate-200 shrink-0"
                  />
                  <div className="flex-1 min-w-0 text-xs">
                    <p className="font-bold text-slate-800">{photoToEdit ? 'Foto Atual / Selecionada' : 'Foto Carregada'}</p>
                    <p className="text-[11px] text-emerald-700 font-medium">Clique no botão abaixo para trocar se desejar</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPhotoUrl('')}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                    title="Remover e escolher outra"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5 text-slate-500" />
                    <span>Escolher outro arquivo</span>
                  </button>
                </div>
              </div>
            ) : photoMode === 'upload' ? (
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
                  className="border-2 border-dashed border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/40 p-5 rounded-xl text-center cursor-pointer transition-all flex flex-col items-center gap-1.5 group"
                >
                  <div className="w-9 h-9 rounded-full bg-white text-emerald-600 shadow-xs flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Upload className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-700 group-hover:text-emerald-700">
                    Selecione a foto do paciente
                  </span>
                  <span className="text-[10px] text-slate-400">PNG, JPG ou JPEG</span>
                </div>
              </div>
            ) : (
              <input
                type="url"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="https://exemplo.com/foto-evolucao.jpg"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
              />
            )}
          </div>

          {/* Anotações */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Observações / Notas da Foto
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Foto tirada após 30 dias de treino intenso e dieta hipocalórica..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 resize-none"
            />
          </div>

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
              <span>{saving ? 'Salvando...' : photoToEdit ? 'Salvar Alterações' : 'Salvar Foto de Evolução'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
