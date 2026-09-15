import React, { useState, useMemo } from 'react';
import {
  Camera,
  Plus,
  Trash2,
  Calendar,
  Scale,
  Sparkles,
  ArrowRight,
  TrendingDown,
  Layers,
  Eye,
  Sliders,
  Edit2,
  RefreshCw
} from 'lucide-react';
import type { EvolutionPhoto, Patient } from '../../types';
import { EvolutionPhotoModal } from '../modals/EvolutionPhotoModal';

interface BeforeAfterModuleProps {
  patient: Patient;
  photos: EvolutionPhoto[];
  onAddPhoto: (photo: EvolutionPhoto) => Promise<void>;
  onDeletePhoto: (id: string) => Promise<void>;
  currentWeight?: number;
}

const ANGLE_LABELS: Record<string, string> = {
  front: 'Frente (Frontal)',
  side: 'Perfil / Lado',
  back: 'Costas (Posterior)',
  other: 'Outro',
};

export const BeforeAfterModule: React.FC<BeforeAfterModuleProps> = ({
  patient,
  photos,
  onAddPhoto,
  onDeletePhoto,
  currentWeight,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [photoToEdit, setPhotoToEdit] = useState<EvolutionPhoto | null>(null);
  const [selectedAngleFilter, setSelectedAngleFilter] = useState<string>('all');

  const handleOpenAdd = () => {
    setPhotoToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (photo: EvolutionPhoto) => {
    setPhotoToEdit(photo);
    setIsModalOpen(true);
  };

  // Filter photos by angle
  const filteredPhotos = useMemo(() => {
    if (selectedAngleFilter === 'all') return photos;
    return photos.filter((p) => p.angle === selectedAngleFilter);
  }, [photos, selectedAngleFilter]);

  // Default Before (first photo) & After (latest photo)
  const defaultBefore = filteredPhotos[0] || null;
  const defaultAfter = filteredPhotos.length > 1 ? filteredPhotos[filteredPhotos.length - 1] : null;

  const [beforePhotoId, setBeforePhotoId] = useState<string>('');
  const [afterPhotoId, setAfterPhotoId] = useState<string>('');

  const activeBeforePhoto = useMemo(() => {
    if (beforePhotoId) {
      return photos.find((p) => p.id === beforePhotoId) || defaultBefore;
    }
    return defaultBefore;
  }, [photos, beforePhotoId, defaultBefore]);

  const activeAfterPhoto = useMemo(() => {
    if (afterPhotoId) {
      return photos.find((p) => p.id === afterPhotoId) || defaultAfter;
    }
    return defaultAfter;
  }, [photos, afterPhotoId, defaultAfter]);

  // Weight delta
  const weightDelta = useMemo(() => {
    if (activeBeforePhoto?.weight && activeAfterPhoto?.weight) {
      return activeAfterPhoto.weight - activeBeforePhoto.weight;
    }
    return null;
  }, [activeBeforePhoto, activeAfterPhoto]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
            <Camera className="w-5 h-5 text-emerald-600" />
            <span>Evolução Fotográfica • Antes & Depois</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Compare visualmente a transformação estética e postural de {patient.name}
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-xs font-bold rounded-xl shadow-sm shadow-emerald-600/20 transition-all w-fit cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Adicionar Nova Foto</span>
        </button>
      </div>

      {/* Angle Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-400 text-[11px] font-semibold flex items-center gap-1 mr-1">
          <Layers className="w-3.5 h-3.5" /> Ângulo:
        </span>
        <button
          onClick={() => setSelectedAngleFilter('all')}
          className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            selectedAngleFilter === 'all'
              ? 'bg-emerald-600 text-white shadow-xs font-bold'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          Todos os Ângulos ({photos.length})
        </button>
        <button
          onClick={() => setSelectedAngleFilter('front')}
          className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            selectedAngleFilter === 'front'
              ? 'bg-emerald-600 text-white shadow-xs font-bold'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          Frente ({photos.filter((p) => p.angle === 'front').length})
        </button>
        <button
          onClick={() => setSelectedAngleFilter('side')}
          className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            selectedAngleFilter === 'side'
              ? 'bg-emerald-600 text-white shadow-xs font-bold'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          Perfil / Lado ({photos.filter((p) => p.angle === 'side').length})
        </button>
        <button
          onClick={() => setSelectedAngleFilter('back')}
          className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            selectedAngleFilter === 'back'
              ? 'bg-emerald-600 text-white shadow-xs font-bold'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          Costas ({photos.filter((p) => p.angle === 'back').length})
        </button>
      </div>

      {/* BEFORE & AFTER COMPARATOR */}
      {photos.length >= 2 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              <h4 className="font-bold text-slate-800 text-sm">Comparador Lado a Lado</h4>
            </div>

            {weightDelta !== null && (
              <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200 text-xs">
                <TrendingDown className="w-4 h-4 text-emerald-600" />
                <span className="font-bold text-emerald-900">
                  Diferença: {weightDelta < 0 ? `${weightDelta.toFixed(1)} kg` : `+${weightDelta.toFixed(1)} kg`}
                </span>
              </div>
            )}
          </div>

          {/* Selectors for Before & After */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Before */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-md border border-rose-200">
                  Foto Inicial (Antes)
                </span>
                <select
                  value={activeBeforePhoto?.id || ''}
                  onChange={(e) => setBeforePhotoId(e.target.value)}
                  className="text-xs font-bold text-slate-700 px-2.5 py-1 rounded-lg border border-slate-300 bg-slate-50 focus:outline-none"
                >
                  {filteredPhotos.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.date} {p.weight ? `(${p.weight} kg)` : ''} - {ANGLE_LABELS[p.angle]}
                    </option>
                  ))}
                </select>
              </div>

              {activeBeforePhoto ? (
                <div className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-900/5 group relative aspect-3/4 flex items-center justify-center">
                  <img
                    src={activeBeforePhoto.photoUrl}
                    alt="Antes"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Top Action Quick Buttons */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleOpenEdit(activeBeforePhoto)}
                      className="px-2.5 py-1.5 bg-slate-900/80 hover:bg-emerald-700 backdrop-blur-md text-white rounded-lg text-[11px] font-bold shadow-sm border border-white/20 flex items-center gap-1 transition-all cursor-pointer"
                      title="Editar / Trocar Foto"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Editar / Trocar</span>
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Deseja excluir esta foto de evolução?')) {
                          onDeletePhoto(activeBeforePhoto.id);
                        }
                      }}
                      className="p-1.5 bg-slate-900/80 hover:bg-rose-600 backdrop-blur-md text-white rounded-lg text-[11px] shadow-sm border border-white/20 transition-all cursor-pointer"
                      title="Excluir Foto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Badges overlay */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs bg-slate-900/80 backdrop-blur-md text-white p-2.5 rounded-xl border border-white/15">
                    <span className="font-mono font-bold">{activeBeforePhoto.date}</span>
                    {activeBeforePhoto.weight && (
                      <span className="font-black text-emerald-300">{activeBeforePhoto.weight} kg</span>
                    )}
                  </div>
                </div>
              ) : null}

              {activeBeforePhoto?.notes && (
                <p className="text-xs text-slate-500 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  "{activeBeforePhoto.notes}"
                </p>
              )}
            </div>

            {/* Right: After */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                  Foto Atual (Depois)
                </span>
                <select
                  value={activeAfterPhoto?.id || ''}
                  onChange={(e) => setAfterPhotoId(e.target.value)}
                  className="text-xs font-bold text-slate-700 px-2.5 py-1 rounded-lg border border-slate-300 bg-slate-50 focus:outline-none"
                >
                  {filteredPhotos.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.date} {p.weight ? `(${p.weight} kg)` : ''} - {ANGLE_LABELS[p.angle]}
                    </option>
                  ))}
                </select>
              </div>

              {activeAfterPhoto ? (
                <div className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-900/5 group relative aspect-3/4 flex items-center justify-center">
                  <img
                    src={activeAfterPhoto.photoUrl}
                    alt="Depois"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Top Action Quick Buttons */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleOpenEdit(activeAfterPhoto)}
                      className="px-2.5 py-1.5 bg-slate-900/80 hover:bg-emerald-700 backdrop-blur-md text-white rounded-lg text-[11px] font-bold shadow-sm border border-white/20 flex items-center gap-1 transition-all cursor-pointer"
                      title="Editar / Trocar Foto"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Editar / Trocar</span>
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Deseja excluir esta foto de evolução?')) {
                          onDeletePhoto(activeAfterPhoto.id);
                        }
                      }}
                      className="p-1.5 bg-slate-900/80 hover:bg-rose-600 backdrop-blur-md text-white rounded-lg text-[11px] shadow-sm border border-white/20 transition-all cursor-pointer"
                      title="Excluir Foto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs bg-slate-900/80 backdrop-blur-md text-white p-2.5 rounded-xl border border-white/15">
                    <span className="font-mono font-bold">{activeAfterPhoto.date}</span>
                    {activeAfterPhoto.weight && (
                      <span className="font-black text-emerald-300">{activeAfterPhoto.weight} kg</span>
                    )}
                  </div>
                </div>
              ) : null}

              {activeAfterPhoto?.notes && (
                <p className="text-xs text-slate-500 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  "{activeAfterPhoto.notes}"
                </p>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {/* ALL PHOTOS GALLERY */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h4 className="font-bold text-slate-800 text-sm">Galeria de Registros Fotográficos</h4>
          <span className="text-xs text-slate-400">{filteredPhotos.length} fotos salvas</span>
        </div>

        {filteredPhotos.length === 0 ? (
          <div className="text-center py-12 text-slate-400 space-y-3">
            <Camera className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-xs">Nenhuma foto de evolução cadastrada ainda.</p>
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              Fazer Upload da 1ª Foto
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filteredPhotos.map((photo) => (
              <div
                key={photo.id}
                className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden flex flex-col justify-between group hover:border-emerald-400 hover:shadow-xs transition-all"
              >
                <div className="aspect-3/4 relative overflow-hidden bg-slate-200">
                  <img
                    src={photo.photoUrl}
                    alt={photo.notes || 'Foto evolução'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-900/75 backdrop-blur-xs text-white">
                    {ANGLE_LABELS[photo.angle] || photo.angle}
                  </span>
                </div>

                <div className="p-3 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between font-bold text-slate-800">
                    <span className="flex items-center gap-1 text-[11px]">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {photo.date}
                    </span>
                    {photo.weight && (
                      <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 text-[10px]">
                        {photo.weight} kg
                      </span>
                    )}
                  </div>

                  {photo.notes && (
                    <p className="text-[11px] text-slate-500 line-clamp-2 italic">
                      "{photo.notes}"
                    </p>
                  )}

                  <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between gap-1">
                    <button
                      onClick={() => handleOpenEdit(photo)}
                      className="flex items-center gap-1 px-2 py-1 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer"
                      title="Editar / Trocar Foto"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Editar / Trocar</span>
                    </button>

                    <button
                      onClick={() => {
                        if (confirm('Deseja excluir esta foto de evolução?')) {
                          onDeletePhoto(photo.id);
                        }
                      }}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded-md transition-colors cursor-pointer"
                      title="Excluir foto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <EvolutionPhotoModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setPhotoToEdit(null);
        }}
        patient={patient}
        onSave={onAddPhoto}
        photoToEdit={photoToEdit}
        defaultWeight={currentWeight}
      />
    </div>
  );
};
