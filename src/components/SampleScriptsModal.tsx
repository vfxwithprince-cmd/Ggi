import React from 'react';
import { X, Play, BookOpen, Flame, Radio, Feather, Sparkles, User } from 'lucide-react';
import { SampleScript, HindiVoiceVersion } from '../types';
import { SAMPLE_SCRIPTS } from '../data/hindiVoices';

interface SampleScriptsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectScript: (script: SampleScript) => void;
  voices: HindiVoiceVersion[];
}

export const SampleScriptsModal: React.FC<SampleScriptsModalProps> = ({
  isOpen,
  onClose,
  onSelectScript,
  voices,
}) => {
  if (!isOpen) return null;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Story':
        return <BookOpen className="w-4 h-4 text-rose-500" />;
      case 'Motivation':
        return <Flame className="w-4 h-4 text-amber-500" />;
      case 'News':
        return <Radio className="w-4 h-4 text-blue-500" />;
      case 'Poetry':
        return <Feather className="w-4 h-4 text-teal-500" />;
      default:
        return <Sparkles className="w-4 h-4 text-purple-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div
        id="sample-scripts-modal"
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>Hindi Sample Scripts (तैयार नमूना पाठ)</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 font-semibold">
                {SAMPLE_SCRIPTS.length} Scripts
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Select any pre-crafted script to test pronunciation, cadence, and voice personalities.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scripts List */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5 divide-y divide-slate-100">
          {SAMPLE_SCRIPTS.map((script) => {
            const voice = voices.find((v) => v.id === script.recommendedVoiceId);
            return (
              <div
                key={script.id}
                className="pt-3 first:pt-0 group hover:bg-orange-50/40 p-3 rounded-xl transition-all border border-transparent hover:border-orange-200"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-slate-100">
                      {getCategoryIcon(script.category)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        {script.titleDevanagari}
                      </h4>
                      <p className="text-xs text-slate-500 font-medium">
                        {script.title}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onSelectScript(script);
                      onClose();
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold shadow-2xs transition-all shrink-0 cursor-pointer"
                  >
                    <span>Use Script</span>
                    <Play className="w-3 h-3 fill-current" />
                  </button>
                </div>

                <p
                  className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100 font-sans"
                  style={{ fontFamily: "'Noto Sans Devanagari', system-ui, sans-serif" }}
                >
                  "{script.text}"
                </p>

                {voice && (
                  <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-500">
                    <span>Recommended voice:</span>
                    <span className="font-semibold text-slate-800 flex items-center gap-1">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          voice.gender === 'female' ? 'bg-rose-500' : 'bg-blue-500'
                        }`}
                      />
                      {voice.name} ({voice.nameDevanagari}) • {voice.category}
                    </span>
                    <span>•</span>
                    <span className="capitalize text-orange-600 font-medium">{script.recommendedStyle} style</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-right">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
