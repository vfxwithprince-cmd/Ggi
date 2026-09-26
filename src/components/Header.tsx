import React from 'react';
import { Volume2, Sparkles, Cpu, Globe, Bookmark, FileText, Smartphone } from 'lucide-react';
import { VoiceEngine } from '../types';

interface HeaderProps {
  engine: VoiceEngine;
  onEngineChange: (engine: VoiceEngine) => void;
  browserVoiceCount: number;
  historyCount: number;
  onOpenHistory: () => void;
  onOpenSamples: () => void;
  onOpenAndroidApk: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  engine,
  onEngineChange,
  browserVoiceCount,
  historyCount,
  onOpenHistory,
  onOpenSamples,
  onOpenAndroidApk,
}) => {
  return (
    <header id="app-header" className="w-full bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-xs backdrop-blur-md bg-white/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        
        {/* Brand & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-600 flex items-center justify-center text-white shadow-sm ring-2 ring-orange-100">
            <Volume2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight font-sans">
                Hindi Text to Speech
              </h1>
              <span className="px-2 py-0.5 text-xs font-semibold bg-orange-100 text-orange-800 rounded-full border border-orange-200">
                हिन्दी आवाज़ें
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              10 authentic voice versions • Neural AI & Device synthesis • WAV studio export
            </p>
          </div>
        </div>

        {/* Controls & Nav */}
        <div className="flex items-center flex-wrap gap-2 sm:gap-3">
          {/* Engine Selector */}
          <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-medium">
            <button
              id="engine-neural-btn"
              type="button"
              onClick={() => onEngineChange('neural')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                engine === 'neural'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Studio Neural AI</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-amber-50 text-amber-700 rounded border border-amber-200 font-mono">
                HD
              </span>
            </button>
            <button
              id="engine-browser-btn"
              type="button"
              onClick={() => onEngineChange('browser')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                engine === 'browser'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Cpu className="w-3.5 h-3.5 text-blue-500" />
              <span>Device Voice</span>
              {browserVoiceCount > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 bg-blue-50 text-blue-700 rounded border border-blue-200 font-mono">
                  {browserVoiceCount}
                </span>
              )}
            </button>
          </div>

          {/* Sample Scripts Button */}
          <button
            id="open-samples-btn"
            type="button"
            onClick={onOpenSamples}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-2xs"
          >
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span>Sample Texts</span>
          </button>

          {/* History Button */}
          <button
            id="open-history-btn"
            type="button"
            onClick={onOpenHistory}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-2xs relative"
          >
            <Bookmark className="w-3.5 h-3.5 text-slate-500" />
            <span>Saved Clips</span>
            {historyCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-orange-600 text-white text-[10px] font-bold flex items-center justify-center">
                {historyCount}
              </span>
            )}
          </button>

          {/* Android App & APK Button */}
          <button
            id="open-android-apk-btn"
            type="button"
            onClick={onOpenAndroidApk}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition-all shadow-2xs group"
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-600 group-hover:scale-110 transition-transform" />
            <span>Android APK</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-emerald-600 text-white rounded font-sans font-semibold">
              App
            </span>
          </button>
        </div>

      </div>
    </header>
  );
};
