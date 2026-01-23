"use client";

import { useEffect, useState } from "react";
import { X, Share, Download } from "lucide-react";
import { Button } from "@heroui/react";
import { motion, AnimatePresence } from "framer-motion";

export const PwaInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Check if it's iOS
    const isIosDevice =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIosDevice);

    // Check if already in standalone mode
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone ||
      document.referrer.includes("android-app://");

    if (isStandalone) {
      return; // Acivity is already installed
    }

    // Android: Listen for beforeinstallprompt
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Wait a bit before showing the prompt to not be intrusive immediately
      setTimeout(() => setShowPrompt(true), 3000);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // iOS: Just show the prompt after a delay if not standalone
    if (isIosDevice && !isStandalone) {
      // Check if we've already shown it recently (optional localStorage check could go here)
       setTimeout(() => setShowPrompt(true), 5000);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === "accepted") {
          console.log("User accepted the install prompt");
        } else {
          console.log("User dismissed the install prompt");
        }
        setDeferredPrompt(null);
        setShowPrompt(false);
      });
    }
  };

  const closePrompt = () => {
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96"
        >
          <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl shadow-2xl">
            <div className="flex justify-between items-start mb-2">
              <div className="flex gap-3">
                <div className="w-12 h-12 bg-gradient-to-tr from-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                   <img src="/icon-192x192.png" alt="App Icon" className="w-full h-full rounded-xl object-cover" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-zinc-900 dark:text-white">
                    Instalar App
                  </h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Accede mas rápido desde tu inicio
                  </p>
                </div>
              </div>
              <button
                onClick={closePrompt}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {isIOS ? (
              <div className="mt-3 space-y-2 text-sm text-zinc-600 dark:text-zinc-300">
                <p>Para instalar en iOS:</p>
                <div className="flex items-center gap-2">
                  1. Toca el botón <Share size={16} className="text-blue-500" /> Compartir
                </div>
                <div className="flex items-center gap-2">
                  2. Selecciona <span className="font-semibold">Agregar al inicio</span>
                </div>
              </div>
            ) : (
              <Button
                fullWidth
                color="primary"
                variant="shadow"
                onPress={handleInstallClick}
                className="mt-3 font-semibold"
                startContent={<Download size={18} />}
              >
                Instalar ahora
              </Button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
