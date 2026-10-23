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
  RefreshCw,
  Maximize2,
  X
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
  const [viewMode, setViewMode] = useState<'contain' | 'cover'>('contain');
  const [lightboxPhoto, setLightboxPhoto] = useState<EvolutionPhoto | null>(null);

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
                <div 
                  onClick={() => setLightboxPhoto(activeBeforePhoto)}
                  className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-950 group relative aspect-3/4 flex items-center justify-center cursor-pointer"
                  title="Clique para ver em tela cheia"
                >
                  {/* Ambient blur background for horizontal or different aspect ratio photos */}
                  <img
                    src={activeBeforePhoto.photoUrl}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 w-full h-full object-cover blur-md opacity-35 scale-110 pointer-events-none"
                  />
                  {/* Full image without cropping */}
                  <img
                    src={activeBeforePhoto.photoUrl}
                    alt="Antes"
                    className={`relative z-10 w-full h-full ${
                      viewMode === 'contain' ? 'object-contain' : 'object-cover'
                    } group-hover:scale-[1.02] transition-transform duration-300`}
                  />

                  {/* Top Action Quick Buttons */}
                  <div 
                    className="absolute top-3 right-3 z-20 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => setLightboxPhoto(activeBeforePhoto)}
                      className="p-1.5 bg-slate-900/80 hover:bg-slate-800 backdrop-blur-md text-white rounded-lg text-[11px] shadow-sm border border-white/20 transition-all cursor-pointer"
                      title="Ver Tela Cheia"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleOpenEdit(activeBeforePhoto)}
                      className="px-2.5 py-1.5 bg-slate-900/80 hover:bg-emerald-700 backdrop-blur-md text-white rounded-lg text-[11px] font-bold shadow-sm border border-white/20 flex items-center gap-1 transition-all cursor-pointer"
                      title="Editar / Trocar Foto"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Editar</span>
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
                  <div className="absolute bottom-3 left-3 right-3 z-20 flex items-center justify-between text-xs bg-slate-900/80 backdrop-blur-md text-white p-2.5 rounded-xl border border-white/15">
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
                <div 
                  onClick={() => setLightboxPhoto(activeAfterPhoto)}
                  className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-950 group relative aspect-3/4 flex items-center justify-center cursor-pointer"
                  title="Clique para ver em tela cheia"
                >
                  {/* Ambient blur background for horizontal or different aspect ratio photos */}
                  <img
                    src={activeAfterPhoto.photoUrl}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 w-full h-full object-cover blur-md opacity-35 scale-110 pointer-events-none"
                  />
                  {/* Full image without cropping */}
                  <img
                    src={activeAfterPhoto.photoUrl}
                    alt="Depois"
                    className={`relative z-10 w-full h-full ${
                      viewMode === 'contain' ? 'object-contain' : 'object-cover'
                    } group-hover:scale-[1.02] transition-transform duration-300`}
                  />

                  {/* Top Action Quick Buttons */}
                  <div 
                    className="absolute top-3 right-3 z-20 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => setLightboxPhoto(activeAfterPhoto)}
                      className="p-1.5 bg-slate-900/80 hover:bg-slate-800 backdrop-blur-md text-white rounded-lg text-[11px] shadow-sm border border-white/20 transition-all cursor-pointer"
                      title="Ver Tela Cheia"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleOpenEdit(activeAfterPhoto)}
                      className="px-2.5 py-1.5 bg-slate-900/80 hover:bg-emerald-700 backdrop-blur-md text-white rounded-lg text-[11px] font-bold shadow-sm border border-white/20 flex items-center gap-1 transition-all cursor-pointer"
                      title="Editar / Trocar Foto"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Editar</span>
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

                  <div className="absolute bottom-3 left-3 right-3 z-20 flex items-center justify-between text-xs bg-slate-900/80 backdrop-blur-md text-white p-2.5 rounded-xl border border-white/15">
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
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h4 className="font-bold text-slate-800 text-sm">Galeria de Registros Fotográficos</h4>
            <span className="text-xs text-slate-400">{filteredPhotos.length} fotos salvas</span>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-[11px] font-semibold text-slate-600">
            <button
              onClick={() => setViewMode('contain')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                viewMode === 'contain' ? 'bg-white text-emerald-700 shadow-2xs font-bold' : 'hover:text-slate-900'
              }`}
              title="Exibir foto completa sem nenhum corte (ótimo para fotos na horizontal e vertical)"
            >
              Ajustar (Sem cortes)
            </button>
            <button
              onClick={() => setViewMode('cover')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                viewMode === 'cover' ? 'bg-white text-emerald-700 shadow-2xs font-bold' : 'hover:text-slate-900'
              }`}
              title="Preencher todo o quadro"
            >
              Preencher
            </button>
          </div>
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
                <div 
                  onClick={() => setLightboxPhoto(photo)}
                  className="aspect-3/4 relative overflow-hidden bg-slate-950 flex items-center justify-center cursor-pointer"
                  title="Clique para ver em tela cheia"
                >
                  {/* Ambient blur background for horizontal or different aspect ratio photos */}
                  <img
                    src={photo.photoUrl}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 w-full h-full object-cover blur-md opacity-35 scale-110 pointer-events-none"
                  />
                  {/* Full image without cropping */}
                  <img
                    src={photo.photoUrl}
                    alt={photo.notes || 'Foto evolução'}
                    className={`relative z-10 w-full h-full ${
                      viewMode === 'contain' ? 'object-contain' : 'object-cover'
                    } group-hover:scale-[1.02] transition-transform duration-300`}
                  />
                  <span className="absolute top-2 left-2 z-20 text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-900/75 backdrop-blur-xs text-white">
                    {ANGLE_LABELS[photo.angle] || photo.angle}
                  </span>
                  <div className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/70 text-white p-1 rounded-md backdrop-blur-xs">
                    <Maximize2 className="w-3.5 h-3.5" />
                  </div>
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
                      <span>Editar</span>
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

      {/* FULLSCREEN LIGHTBOX MODAL */}
      {lightboxPhoto && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setLightboxPhoto(null)}
        >
          <div 
            className="relative max-w-4xl max-h-[90vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setLightboxPhoto(null)}
              className="absolute -top-12 right-0 p-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all cursor-pointer"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Main Full Image */}
            <div className="rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-slate-900 flex items-center justify-center max-h-[75vh]">
              <img
                src={lightboxPhoto.photoUrl}
                alt={lightboxPhoto.notes || 'Foto ampliada'}
                className="max-h-[75vh] w-auto max-w-full object-contain"
              />
            </div>

            {/* Photo Info Banner below */}
            <div className="mt-3 flex items-center gap-3 bg-slate-900/90 text-white px-4 py-2 rounded-xl border border-white/10 text-xs backdrop-blur-md">
              <span className="font-bold flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                {lightboxPhoto.date}
              </span>
              <span className="text-white/40">•</span>
              <span className="text-emerald-300 font-semibold">
                {ANGLE_LABELS[lightboxPhoto.angle] || lightboxPhoto.angle}
              </span>
              {lightboxPhoto.weight && (
                <>
                  <span className="text-white/40">•</span>
                  <span className="text-white/90 font-bold">{lightboxPhoto.weight} kg</span>
                </>
              )}
              {lightboxPhoto.notes && (
                <>
                  <span className="text-white/40">•</span>
                  <span className="text-white/70 italic truncate max-w-xs">"{lightboxPhoto.notes}"</span>
                </>
              )}
            </div>
          </div>
        </div>
      )}

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
