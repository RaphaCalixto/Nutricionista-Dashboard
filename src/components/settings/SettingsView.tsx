import React, { useState, useEffect } from 'react';
import {
  Settings,
  Save,
  CheckCircle2,
  Download,
  Building,
  User as UserIcon,
  LogOut,
  ShieldCheck
} from 'lucide-react';
import type { ClinicProfile, User } from '../../types';

interface SettingsViewProps {
  clinicProfile: ClinicProfile;
  onSaveClinicProfile: (profile: ClinicProfile) => void;
  currentUser?: User | null;
  onLogout?: () => void;
  supabaseConnected?: boolean;
  onOpenSqlModal?: () => void;
  onCheckConnection?: () => Promise<void>;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  clinicProfile,
  onSaveClinicProfile,
  currentUser,
  onLogout,
}) => {
  const [nutritionistName, setNutritionistName] = useState(
    clinicProfile.nutritionistName || currentUser?.name || 'Nutricionista'
  );
  const [crn, setCrn] = useState(clinicProfile.crn || '');
  const [clinicName, setClinicName] = useState(clinicProfile.clinicName || '');
  const [email, setEmail] = useState(clinicProfile.email || currentUser?.email || '');
  const [phone, setPhone] = useState(clinicProfile.phone || '');
  const [address, setAddress] = useState(clinicProfile.address || '');
  const [instagram, setInstagram] = useState(clinicProfile.instagram || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setNutritionistName(clinicProfile.nutritionistName || currentUser?.name || 'Nutricionista');
    setCrn(clinicProfile.crn || '');
    setClinicName(clinicProfile.clinicName || '');
    setEmail(clinicProfile.email || currentUser?.email || '');
    setPhone(clinicProfile.phone || '');
    setAddress(clinicProfile.address || '');
    setInstagram(clinicProfile.instagram || '');
  }, [clinicProfile, currentUser]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveClinicProfile({
      nutritionistName: nutritionistName.trim(),
      crn: crn.trim(),
      clinicName: clinicName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      address: address.trim(),
      instagram: instagram.trim() || undefined,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleExportBackup = () => {
    const allData: Record<string, any> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('nutriplan_')) {
        try {
          allData[key] = JSON.parse(localStorage.getItem(key) || '{}');
        } catch (e) {}
      }
    }
    const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nutriplan_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-emerald-600" />
          <span>Configurações do Consultório</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Personalize as informações profissionais para emissão de planos alimentares, anamneses e impressões
        </p>
      </div>

      {/* Account Info Card */}
      {currentUser && (
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-400 flex items-center justify-center font-bold text-sm shrink-0">
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-white">{currentUser.name}</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                  Conta Ativa
                </span>
              </div>
              <p className="text-xs text-slate-300 font-mono mt-0.5">{currentUser.email}</p>
            </div>
          </div>

          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="px-4 py-2 bg-slate-700/80 hover:bg-rose-600/90 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 self-start sm:self-center border border-white/10"
            >
              <LogOut className="w-4 h-4" />
              <span>Sair da Conta</span>
            </button>
          )}
        </div>
      )}

      {/* Clinic & Nutritionist Profile Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Building className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-800 text-base">Dados da Nutricionista & Consultório</h3>
          </div>
          <span className="text-xs text-slate-400">Usado no cabeçalho dos planos e impressões</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Nome da Nutricionista *
            </label>
            <input
              type="text"
              required
              value={nutritionistName}
              onChange={(e) => setNutritionistName(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 font-bold text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Registro Profissional (CRN) *
            </label>
            <input
              type="text"
              required
              value={crn}
              onChange={(e) => setCrn(e.target.value)}
              placeholder="Ex: CRN-3 71644"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 font-bold text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Telefone / WhatsApp Comercial *
            </label>
            <input
              type="text"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(11) 91790-8668"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 font-semibold text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Nome da Clínica / Consultório (Opcional)
            </label>
            <input
              type="text"
              value={clinicName}
              onChange={(e) => setClinicName(e.target.value)}
              placeholder="Digite o nome do consultório ou deixe em branco"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              E-mail de Contato (Opcional)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contato@exemplo.com"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Instagram Profissional (Opcional)
            </label>
            <input
              type="text"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              placeholder="@dralaisleal.nutri"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
            Endereço Completo do Consultório (Opcional)
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Ex: Av. Paulista, 1000 - Cj 804, São Paulo/SP"
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          {savedSuccess ? (
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>Configurações salvas com sucesso!</span>
            </span>
          ) : (
            <span />
          )}

          <button
            type="submit"
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-xs font-bold rounded-xl shadow-sm shadow-emerald-600/20 transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Salvar Alterações</span>
          </button>
        </div>
      </form>

      {/* Backup Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-3">
        <h3 className="font-bold text-slate-800 text-sm">Backup de Segurança dos Dados</h3>
        <p className="text-xs text-slate-500">
          Exporte uma cópia completa de todos os pacientes cadastrados, dietas e consultas com um clique.
        </p>
        <button
          type="button"
          onClick={handleExportBackup}
          className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          <span>Baixar Backup JSON</span>
        </button>
      </div>
    </div>
  );
};
