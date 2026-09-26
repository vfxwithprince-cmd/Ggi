import React, { useState } from 'react';
import {
  Sparkles,
  Wand2,
  Languages,
  RotateCcw,
  Copy,
  Check,
  Play,
  Square,
  Sliders,
  Volume2,
  FileText,
  Clock,
  Loader2,
  Flame,
  Radio,
  BookOpen,
  Feather,
  Music,
  Smile,
} from 'lucide-react';
import { HindiVoiceVersion, SpeechStyle, VoiceEngine } from '../types';
import { SPEECH_STYLES } from '../data/hindiVoices';

interface SpeechStudioProps {
  text: string;
  onTextChange: (text: string) => void;
  selectedVoice: HindiVoiceVersion;
  selectedStyle: SpeechStyle;
  onStyleChange: (style: SpeechStyle) => void;
  speed: number;
  onSpeedChange: (speed: number) => void;
  pitch: number;
  onPitchChange: (pitch: number) => void;
  engine: VoiceEngine;
  isSynthesizing: boolean;
  onSynthesize: () => void;
  onStop: () => void;
  isPlaying: boolean;
  onTranslateToHindi: () => Promise<void>;
  isTranslating: boolean;
  onPolishHindi: () => Promise<void>;
  isPolishing: boolean;
  onOpenSamples: () => void;
}

export const SpeechStudio: React.FC<SpeechStudioProps> = ({
  text,
  onTextChange,
  selectedVoice,
  selectedStyle,
  onStyleChange,
  speed,
  onSpeedChange,
  pitch,
  onPitchChange,
  engine,
  isSynthesizing,
  onSynthesize,
  onStop,
  isPlaying,
  onTranslateToHindi,
  isTranslating,
  onPolishHindi,
  isPolishing,
  onOpenSamples,
}) => {
  const [copied, setCopied] = useState(false);

  // Character and word count
  const charCount = text.length;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  // Average speaking rate in Hindi: ~120 words per minute (at 1x)
  const estimatedSeconds = Math.max(1, Math.round((wordCount / (120 * speed)) * 60));

  const handleCopy = () => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInsertSymbol = (symbol: string) => {
    onTextChange(text + symbol);
  };

  const getStyleIcon = (iconName: string) => {
    switch (iconName) {
      case 'BookOpen':
        return <BookOpen className="w-3.5 h-3.5" />;
      case 'Radio':
        return <Radio className="w-3.5 h-3.5" />;
      case 'Flame':
        return <Flame className="w-3.5 h-3.5" />;
      case 'Feather':
        return <Feather className="w-3.5 h-3.5" />;
      case 'Music':
        return <Music className="w-3.5 h-3.5" />;
      case 'Smile':
        return <Smile className="w-3.5 h-3.5" />;
      default:
        return <Sparkles className="w-3.5 h-3.5" />;
    }
  };

  return (
    <section id="speech-studio-workspace" className="w-full bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      
      {/* Top Bar: Active Persona Badge & Helpers */}
      <div className="bg-slate-50/80 px-4 sm:px-6 py-3 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs text-white shadow-2xs ${
              selectedVoice.gender === 'female'
                ? 'bg-gradient-to-tr from-rose-500 to-pink-500'
                : 'bg-gradient-to-tr from-blue-600 to-indigo-600'
            }`}
          >
            {selectedVoice.nameDevanagari.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500">Selected Voice:</span>
              <span className="text-sm font-bold text-slate-900">
                {selectedVoice.name} ({selectedVoice.nameDevanagari})
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200 font-medium">
                {selectedVoice.category}
              </span>
            </div>
          </div>
        </div>

        {/* Text Actions */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <button
            type="button"
            onClick={onOpenSamples}
            className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <FileText className="w-3 h-3 text-slate-500" />
            <span>Load Sample Script</span>
          </button>
          <button
            type="button"
            onClick={handleCopy}
            disabled={!text}
            title="Copy text"
            className="p-1.5 text-slate-500 hover:text-slate-900 bg-white border border-slate-200 rounded-lg disabled:opacity-40 transition-colors shadow-2xs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button
            type="button"
            onClick={() => onTextChange('')}
            disabled={!text}
            title="Clear text"
            className="p-1.5 text-slate-500 hover:text-rose-600 bg-white border border-slate-200 rounded-lg disabled:opacity-40 transition-colors shadow-2xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Text Area */}
      <div className="p-4 sm:p-6 space-y-4">
        <div className="relative">
          <textarea
            id="hindi-text-input"
            rows={5}
            value={text}
            onChange={(e) => onTextChange(e.target.value)}
            placeholder="यहाँ हिन्दी या अंग्रेज़ी में अपना पाठ लिखें या पेस्ट करें... (Type or paste text in Hindi or English)"
            className="w-full p-4 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-base leading-relaxed text-slate-900 placeholder:text-slate-400 bg-white resize-y font-sans transition-all"
            style={{ fontFamily: "'Noto Sans Devanagari', 'Plus Jakarta Sans', system-ui, sans-serif" }}
          />

          {/* Quick Hindi Typing Helpers (Punctuation & Matra) */}
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center flex-wrap gap-1 text-slate-600">
              <span className="text-[11px] font-medium text-slate-400 mr-1">Quick insert:</span>
              {[
                { symbol: '।', label: 'पूर्णविराम (।)' },
                { symbol: '॥', label: 'दोहरा पूर्णविराम (॥)' },
                { symbol: ',', label: 'अल्पविराम (,)' },
                { symbol: '?', label: 'प्रश्नचिह्न (?)' },
                { symbol: '!', label: 'विस्मयादिबोधक (!)' },
                { symbol: '“ ”', label: 'उद्धरण (“ ”)' },
                { symbol: 'ॐ', label: 'ॐ' },
              ].map((item) => (
                <button
                  key={item.symbol}
                  type="button"
                  onClick={() => handleInsertSymbol(item.symbol === '“ ”' ? '“”' : item.symbol)}
                  className="px-2 py-0.8 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded border border-slate-200 font-mono text-xs transition-colors"
                  title={item.label}
                >
                  {item.symbol}
                </button>
              ))}
            </div>

            {/* AI Text Assistance (Translate to Hindi & Polish) */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                id="translate-hindi-btn"
                onClick={onTranslateToHindi}
                disabled={!text.trim() || isTranslating}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 disabled:opacity-50 transition-colors"
                title="Translate English/Hinglish text to natural Hindi Devanagari"
              >
                {isTranslating ? (
                  <Loader2 className="w-3 h-3 animate-spin text-indigo-600" />
                ) : (
                  <Languages className="w-3 h-3 text-indigo-600" />
                )}
                <span>Translate to Hindi</span>
              </button>

              <button
                type="button"
                id="polish-hindi-btn"
                onClick={onPolishHindi}
                disabled={!text.trim() || isPolishing}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 disabled:opacity-50 transition-colors"
                title="Polish punctuation and pauses for smoother audio flow"
              >
                {isPolishing ? (
                  <Loader2 className="w-3 h-3 animate-spin text-emerald-600" />
                ) : (
                  <Wand2 className="w-3 h-3 text-emerald-600" />
                )}
                <span>Add Speech Cadence</span>
              </button>
            </div>
          </div>
        </div>

        {/* Status bar under textarea */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <div className="flex items-center gap-3">
            <span>
              <strong>{charCount}</strong> characters
            </span>
            <span>•</span>
            <span>
              <strong>{wordCount}</strong> words
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              Est. speaking time: <strong>~{estimatedSeconds}s</strong>
            </span>
          </div>

          {selectedVoice.accent && (
            <span className="hidden sm:inline-block text-[11px] text-slate-400 font-medium">
              Dialect: {selectedVoice.accent}
            </span>
          )}
        </div>

        {/* Style Preset Selector */}
        {engine === 'neural' && (
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-orange-500" />
                <span>Expressive Speech Style (वाचन शैली)</span>
              </label>
              <span className="text-[11px] text-slate-400">
                Directs the emotion, rhythm, and pauses in Hindi
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
              {SPEECH_STYLES.map((st) => {
                const isSelected = selectedStyle === st.id;
                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => onStyleChange(st.id)}
                    className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                      isSelected
                        ? 'bg-orange-500 text-white border-orange-600 shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    <div className={isSelected ? 'text-white' : 'text-slate-500'}>
                      {getStyleIcon(st.icon)}
                    </div>
                    <span className="text-xs font-semibold block leading-tight">{st.label}</span>
                    <span
                      className={`text-[10px] block leading-none ${
                        isSelected ? 'text-orange-100' : 'text-slate-400'
                      }`}
                    >
                      {st.labelDevanagari}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Speed & Nuance Controls */}
        <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Speed Slider */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="speed-slider" className="text-xs font-bold text-slate-700">
                Speech Speed (गति): <span className="text-orange-600">{speed}x</span>
              </label>
              <div className="flex gap-1">
                {[0.75, 1.0, 1.25, 1.5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => onSpeedChange(s)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-medium transition-colors ${
                      speed === s
                        ? 'bg-orange-100 text-orange-800 font-bold border border-orange-200'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>
            <input
              id="speed-slider"
              type="range"
              min="0.5"
              max="2.0"
              step="0.05"
              value={speed}
              onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
              className="w-full accent-orange-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-0.5 font-mono">
              <span>0.5x Slow</span>
              <span>1.0x Normal</span>
              <span>2.0x Fast</span>
            </div>
          </div>

          {/* Voice Prompt Guidance / Pitch Note */}
          <div className="flex flex-col justify-between">
            <label htmlFor="pitch-slider" className="text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
              <span>Voice Pitch (तारत्व / स्वर)</span>
              <span className="text-slate-500 font-mono text-[11px]">{pitch}x</span>
            </label>
            <input
              id="pitch-slider"
              type="range"
              min="0.75"
              max="1.35"
              step="0.05"
              value={pitch}
              onChange={(e) => onPitchChange(parseFloat(e.target.value))}
              className="w-full accent-orange-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-0.5 font-mono">
              <span>Deeper</span>
              <span>Standard</span>
              <span>Higher</span>
            </div>
          </div>
        </div>

        {/* Big Action Button */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            {engine === 'neural' ? (
              <span className="flex items-center gap-1 text-slate-600">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Powered by Gemini Neural Speech (Studio 24,000 Hz WAV output)
              </span>
            ) : (
              <span className="flex items-center gap-1 text-slate-600">
                <Volume2 className="w-3.5 h-3.5 text-blue-500" />
                Browser device synthesis with zero network latency
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {isPlaying && (
              <button
                type="button"
                onClick={onStop}
                className="px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-300"
              >
                <Square className="w-4 h-4 fill-current" />
                <span>Stop</span>
              </button>
            )}

            <button
              id="synthesize-speech-btn"
              type="button"
              onClick={onSynthesize}
              disabled={isSynthesizing || !text.trim()}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-orange-600 via-amber-600 to-rose-600 hover:from-orange-700 hover:to-rose-700 text-white font-bold text-sm shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 transition-all transform active:scale-98 cursor-pointer"
            >
              {isSynthesizing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Generating Hindi Speech (आवाज़ तैयार हो रही है)...</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-current" />
                  <span>आवाज़ बनाएं (Generate Hindi Speech)</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};
