import { useEffect, useState } from 'react';
import { registerSW } from 'virtual:pwa-register';

// Register Service Worker with automatic updates
export function initPWAAutoUpdate() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    const updateSW = registerSW({
      immediate: true,
      onRegisteredSW(swUrl, r) {
        // Check for updates every 30 minutes
        if (r) {
          setInterval(async () => {
            if (!(!r.installing && navigator)) return;
            if (('connection' in navigator) && !navigator.onLine) return;
            const resp = await fetch(swUrl, {
              cache: 'no-store',
              headers: {
                'cache': 'no-store',
                'cache-control': 'no-cache',
              },
            });
            if (resp?.status === 200) {
              await r.update();
            }
          }, 30 * 60 * 1000);
        }
      },
      onNeedRefresh() {
        // Auto update immediately when a new version is installed
        updateSW(true);
      },
      onOfflineReady() {
        console.log('[PWA] Aplicativo pronto para uso offline.');
      }
    });

    // Check for updates when user returns to the tab
    window.addEventListener('focus', () => {
      navigator.serviceWorker.getRegistration().then((reg) => {
        reg?.update();
      });
    });
  }
}

// Hook for PWA installation button
export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);

  useEffect(() => {
    // Check if already running in standalone mode (installed PWA)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    setIsInstalled(isStandalone);

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const installPWA = async (): Promise<boolean> => {
    if (!deferredPrompt) {
      return false;
    }
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      setIsInstalled(true);
      setDeferredPrompt(null);
      return true;
    }
    return false;
  };

  return {
    isInstallable: Boolean(deferredPrompt) || (isIOS && !isInstalled),
    isInstalled,
    isIOS,
    installPWA,
  };
}
