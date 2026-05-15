import { useState, useEffect } from "react";
import { Download, X } from "lucide-react";

export function InstallBanner({ lang }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();

    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setShowInstallPrompt(false);
    }

    setDeferredPrompt(null);
  };

  if (!showInstallPrompt) return null;

  return (
    <div className="absolute top-0 left-0 w-full z-50 bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between shadow-xl animate-in slide-in-from-top-full duration-500 backdrop-blur-md bg-opacity-95">
      <div className="flex items-center gap-3">
        <div className="bg-background/20 p-2 rounded-full">
          <Download className="w-5 h-5 animate-bounce" />
        </div>
        <div className="flex flex-col text-left">
          <span className="text-sm font-bold leading-tight">
            {lang === "pt" ? "Instale o Aplicativo" : "Install the App"}
          </span>
          <span className="text-xs text-primary-foreground/80">
            {lang === "pt"
              ? "Acesso rápido e fácil na sua tela inicial"
              : "Quick and easy access from your home screen"}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleInstallClick}
          className="bg-background text-primary px-4 py-1.5 rounded-full text-xs font-black shadow-sm hover:scale-105 active:scale-95 transition-all"
        >
          {lang === "pt" ? "INSTALAR" : "INSTALL"}
        </button>
        <button
          onClick={() => setShowInstallPrompt(false)}
          className="p-1 hover:bg-black/10 rounded-full transition-colors opacity-70 hover:opacity-100"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
