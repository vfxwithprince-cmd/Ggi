import React from 'react';
import { useOnlineStatus } from '../hooks/usePWAInstall';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-slate-900/90 border border-slate-700/80 px-3.5 py-2 text-xs font-medium text-amber-300 shadow-xl backdrop-blur-md animate-fade-in"
    >
      <WifiOff className="w-4 h-4 text-amber-400 animate-pulse" />
      <span>ऑफ़लाइन मोड (Offline Mode) — Device voices available</span>
    </div>
  );
};
