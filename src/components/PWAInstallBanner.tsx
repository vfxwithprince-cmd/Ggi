import React, { useState } from 'react';
import { Smartphone, Download, X, Sparkles } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallBannerProps {
  onOpenAndroidModal: () => void;
}

export const PWAInstallBanner: React.FC<PWAInstallBannerProps> = ({ onOpenAndroidModal }) => {
  const { isInstallable, isInstalled, isAndroid, install } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);

  if (isInstalled || dismissed) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      await install();
    } else {
      onOpenAndroidModal();
    }
  };

  return (
    <div
      id="android-install-banner"
      className="bg-gradient-to-r from-orange-600 via-amber-600 to-emerald-600 text-white px-4 py-2.5 shadow-md flex items-center justify-between gap-3 text-xs sm:text-sm animate-fade-in"
    >
      <div className="flex items-center gap-2.5 max-w-2xl">
        <div className="w-7 h-7 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/30">
          <Smartphone className="w-4 h-4 text-white" />
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
          <span className="font-bold">
            {isAndroid ? 'Android फोन पर ऐप इंस्टॉल करें (Install App)' : 'Android APK & WebAPK Ready'}
          </span>
          <span className="text-orange-100 text-xs hidden sm:inline">•</span>
          <span className="text-orange-100 text-xs">
            10 हिन्दी आवाज़ें, ऑफ़लाइन सपोर्ट, और होम स्क्रीन एक्सेस
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={handleInstallClick}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-orange-700 hover:bg-orange-50 font-bold text-xs shadow-xs transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{isInstallable ? 'Install App' : 'Get Android APK'}</span>
        </button>

        <button
          onClick={() => onOpenAndroidModal()}
          className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-black/15 hover:bg-black/25 text-white text-xs font-medium transition-colors"
        >
          <span>Options</span>
        </button>

        <button
          onClick={() => setDismissed(true)}
          className="w-6 h-6 rounded-md hover:bg-black/20 text-white/80 hover:text-white flex items-center justify-center transition-colors"
          title="Dismiss"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
