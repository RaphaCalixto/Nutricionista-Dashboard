import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, ChevronDown, User, UserPlus, Check, X } from 'lucide-react';
import type { Patient } from '../../types';

interface PatientSearchSelectProps {
  patients: Patient[];
  selectedPatientId?: string;
  onSelectPatient: (patientId: string, patient?: Patient) => void;
  placeholder?: string;
  allowCustomOrNew?: boolean;
  customOptionLabel?: string;
  className?: string;
  variant?: 'form' | 'filter';
}

export const PatientSearchSelect: React.FC<PatientSearchSelectProps> = ({
  patients,
  selectedPatientId,
  onSelectPatient,
  placeholder = 'Selecione um paciente...',
  allowCustomOrNew = false,
  customOptionLabel = '-- Outro / Paciente Novo --',
  className = '',
  variant = 'form',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Selected patient object
  const selectedPatient = useMemo(() => {
    if (!selectedPatientId) return null;
    return patients.find((p) => p.id === selectedPatientId) || null;
  }, [patients, selectedPatientId]);

  // Filtered patients by name or phone
  const filteredPatients = useMemo(() => {
    if (!searchQuery.trim()) return patients;
    const q = searchQuery.toLowerCase().trim();
    return patients.filter((p) => {
      const matchName = p.name.toLowerCase().includes(q);
      const matchPhone = p.phone ? p.phone.toLowerCase().includes(q) : false;
      return matchName || matchPhone;
    });
  }, [patients, searchQuery]);

  // Handle outside click & escape key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Auto focus search input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchQuery('');
    }
  }, [isOpen]);

  const handleSelect = (patientId: string, patient?: Patient) => {
    onSelectPatient(patientId, patient);
    setIsOpen(false);
    setSearchQuery('');
  };

  const isCustomSelected = allowCustomOrNew && !selectedPatientId;

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between gap-2 transition-all cursor-pointer ${
          variant === 'filter'
            ? 'px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white hover:bg-slate-50 hover:border-emerald-400 shadow-2xs font-bold text-slate-800'
            : 'px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white hover:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs'
        } ${isOpen ? 'border-emerald-500 ring-2 ring-emerald-500/20' : ''}`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {selectedPatient ? (
            <>
              {selectedPatient.photoUrl ? (
                <img
                  src={selectedPatient.photoUrl}
                  alt=""
                  className="w-6 h-6 rounded-lg object-cover shrink-0 border border-slate-200"
                />
              ) : (
                <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 text-[10px] font-black flex items-center justify-center shrink-0">
                  {selectedPatient.name
                    .split(' ')
                    .filter(Boolean)
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase()}
                </div>
              )}
              <div className="text-left truncate min-w-0">
                <span className="font-bold text-slate-800 block truncate leading-tight">
                  {selectedPatient.name}
                </span>
                {selectedPatient.phone && (
                  <span className="text-[10px] text-slate-400 block truncate leading-tight">
                    {selectedPatient.phone}
                  </span>
                )}
              </div>
            </>
          ) : isCustomSelected ? (
            <div className="flex items-center gap-2 text-left truncate">
              <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <UserPlus className="w-3.5 h-3.5" />
              </div>
              <span className="font-bold text-slate-700 truncate">{customOptionLabel}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-slate-400 text-left truncate">
              <User className="w-4 h-4 shrink-0 text-slate-400" />
              <span className="font-medium truncate">{placeholder}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0 text-slate-400">
          <div className="w-5 h-5 rounded-md bg-slate-100 hover:bg-emerald-50 text-slate-500 hover:text-emerald-700 flex items-center justify-center transition-colors">
            <Search className="w-3.5 h-3.5" />
          </div>
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180 text-emerald-600' : ''}`}
          />
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 animate-in fade-in zoom-in-95 duration-150">
          {/* Search Input with Lupa */}
          <div className="relative mb-2">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nome ou celular..."
              className="w-full pl-8 pr-7 py-2 bg-slate-50 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Options List */}
          <div className="max-h-56 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
            {/* Custom/New Patient Option */}
            {allowCustomOrNew && (
              <button
                type="button"
                onClick={() => handleSelect('', undefined)}
                className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-colors cursor-pointer ${
                  isCustomSelected
                    ? 'bg-amber-50 border border-amber-200 text-amber-900 font-bold'
                    : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                    <UserPlus className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold truncate">{customOptionLabel}</p>
                    <p className="text-[10px] text-slate-400 truncate">Preencher dados manualmente</p>
                  </div>
                </div>
                {isCustomSelected && <Check className="w-4 h-4 text-amber-600 shrink-0 ml-2" />}
              </button>
            )}

            {/* Patients List */}
            {filteredPatients.length > 0 ? (
              filteredPatients.map((p) => {
                const isSelected = selectedPatientId === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelect(p.id, p)}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50 border border-emerald-200 text-emerald-900 font-bold'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {p.photoUrl ? (
                        <img
                          src={p.photoUrl}
                          alt=""
                          className="w-7 h-7 rounded-lg object-cover shrink-0 border border-slate-200"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 text-[10px] font-black flex items-center justify-center shrink-0">
                          {p.name
                            .split(' ')
                            .filter(Boolean)
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join('')
                            .toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-bold truncate">{p.name}</p>
                        {p.phone && <p className="text-[10px] text-slate-400 truncate">{p.phone}</p>}
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-emerald-600 shrink-0 ml-2" />}
                  </button>
                );
              })
            ) : (
              <div className="py-4 text-center text-xs text-slate-400">
                Nenhum paciente encontrado com "{searchQuery}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
