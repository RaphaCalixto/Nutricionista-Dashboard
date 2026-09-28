import React from 'react';
import { X, Download, Smartphone, Laptop, Sparkles, CheckCircle2, Share, PlusSquare } from 'lucide-react';
import { usePWAInstall } from '../../services/pwa';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, installPWA, isIOS, isInstalled } = usePWAInstall();
  const [activeTab, setActiveTab] = React.useState<'android' | 'ios' | 'desktop'>('android');

  React.useEffect(() => {
    if (isIOS) {
      setActiveTab('ios');
    } else if (/android/i.test(navigator.userAgent)) {
      setActiveTab('android');
    } else {
      setActiveTab('desktop');
    }
  }, [isIOS]);

  if (!isOpen) return null;

  const handleDirectInstall = async () => {
    if (isInstallable) {
      const success = await installPWA();
      if (success) {
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 animate-scale-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 p-5 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner">
              <Download className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Instalar NutriPlan Pro</span>
                <Sparkles className="w-4 h-4 text-emerald-300" />
              </h3>
              <p className="text-xs text-emerald-100">
                Acesse mais rápido como um aplicativo nativo
              </p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Direct install CTA if available */}
          {isInstallable && !isInstalled && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-left">
                <p className="text-xs font-bold text-emerald-950">Instalação Direta Disponível</p>
                <p className="text-[11px] text-emerald-700">Clique no botão para instalar em 1 clique.</p>
              </div>
              <button
                onClick={handleDirectInstall}
                className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Instalar Agora</span>
              </button>
            </div>
          )}

          {/* Platform Tabs */}
          <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-bold">
            <button
              onClick={() => setActiveTab('android')}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'android'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Android</span>
            </button>
            <button
              onClick={() => setActiveTab('ios')}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'ios'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>iPhone / iOS</span>
            </button>
            <button
              onClick={() => setActiveTab('desktop')}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'desktop'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Laptop className="w-3.5 h-3.5" />
              <span>Computador</span>
            </button>
          </div>

          {/* Instructions Per Platform */}
          <div className="space-y-3 text-xs text-slate-700 bg-slate-50/80 p-4 rounded-2xl border border-slate-200/70">
            {activeTab === 'android' && (
              <div className="space-y-2.5">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">1</span>
                  <p>Abra o site <strong>pacientenutri.com.br</strong> no Google Chrome.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">2</span>
                  <p>Toque no menu de <strong>três pontinhos (⋮)</strong> no canto superior direito do Chrome.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">3</span>
                  <p>Selecione a opção <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.</p>
                </div>
              </div>
            )}

            {activeTab === 'ios' && (
              <div className="space-y-2.5">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">1</span>
                  <p>Abra o site <strong>pacientenutri.com.br</strong> no navegador <strong>Safari</strong>.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">2</span>
                  <p className="flex items-center gap-1.5 flex-wrap">
                    Toque no botão de <strong>Compartilhar</strong> <Share className="w-3.5 h-3.5 text-blue-600 inline" /> (na barra inferior do Safari).
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">3</span>
                  <p className="flex items-center gap-1.5 flex-wrap">
                    Role para baixo e selecione <PlusSquare className="w-3.5 h-3.5 text-slate-700 inline" /> <strong>"Adicionar à Tela de Início"</strong>.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'desktop' && (
              <div className="space-y-2.5">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">1</span>
                  <p>No <strong>Google Chrome</strong> ou <strong>Microsoft Edge</strong>, olhe para a barra de endereços (ao lado da estrela de favoritos).</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">2</span>
                  <p>Clique no ícone de <strong>Instalar / Computador com seta</strong> (<Download className="w-3.5 h-3.5 text-emerald-600 inline" />).</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">3</span>
                  <p>Confirme em <strong>"Instalar"</strong>. O NutriPlan Pro abrirá em janela dedicada sem barras de navegador.</p>
                </div>
              </div>
            )}
          </div>

          {/* Info note regarding updates and settings */}
          <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-100 text-[11px] text-emerald-900 flex items-start gap-2 leading-relaxed">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              <strong>Atualização 100% Automática:</strong> Você nunca precisará desinstalar e baixar de novo. O app se atualiza sozinho sempre que novas melhorias forem lançadas. Esta opção sempre estará disponível na aba <strong>Configurações</strong> do sistema.
            </span>
          </div>

          <div className="flex justify-end pt-1">
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-all"
            >
              Entendido
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
