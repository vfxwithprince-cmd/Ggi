import React, { useState } from 'react';
import { Play, Square, Check, Sparkles, User, Filter, Volume2, ShieldCheck } from 'lucide-react';
import { HindiVoiceVersion, Gender, VoiceEngine } from '../types';

interface VoiceSelectorProps {
  voices: HindiVoiceVersion[];
  selectedVoiceId: string;
  onSelectVoice: (voice: HindiVoiceVersion) => void;
  onPreviewVoice: (voice: HindiVoiceVersion) => void;
  previewingVoiceId: string | null;
  engine: VoiceEngine;
  browserVoices: SpeechSynthesisVoice[];
  selectedBrowserVoiceIndex: number;
  onSelectBrowserVoiceIndex: (index: number) => void;
}

export const VoiceSelector: React.FC<VoiceSelectorProps> = ({
  voices,
  selectedVoiceId,
  onSelectVoice,
  onPreviewVoice,
  previewingVoiceId,
  engine,
  browserVoices,
  selectedBrowserVoiceIndex,
  onSelectBrowserVoiceIndex,
}) => {
  const [filterGender, setFilterGender] = useState<'all' | 'female' | 'male'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const filteredVoices = voices.filter((v) => {
    if (filterGender !== 'all' && v.gender !== filterGender) return false;
    if (filterCategory !== 'all') {
      if (filterCategory === 'story' && !v.category.toLowerCase().includes('story') && !v.category.toLowerCase().includes('fiction')) return false;
      if (filterCategory === 'news' && !v.category.toLowerCase().includes('news') && !v.category.toLowerCase().includes('corporate')) return false;
      if (filterCategory === 'energy' && !v.category.toLowerCase().includes('radio') && !v.category.toLowerCase().includes('sports') && !v.category.toLowerCase().includes('motivational')) return false;
      if (filterCategory === 'calm' && !v.category.toLowerCase().includes('meditation') && !v.category.toLowerCase().includes('mentor')) return false;
    }
    return true;
  });

  return (
    <section id="voice-selector-section" className="w-full bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
      {/* Title & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 pb-3.5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">
              {engine === 'neural' ? 'Choose Hindi Voice Version' : 'Device Hindi Voices'}
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-amber-100 text-amber-900 border border-amber-200">
              {engine === 'neural' ? `${voices.length} आवाज़ें उपलब्ध` : `${browserVoices.length} डिवाइस आवाज़ें`}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {engine === 'neural'
              ? 'Select from authentic female and male vocal personas with distinct regional cadences and tones.'
              : 'Voices detected directly on your operating system (Google, Microsoft, Apple Hindi TTS).'}
          </p>
        </div>

        {/* Filters (for Neural Engine) */}
        {engine === 'neural' && (
          <div className="flex items-center flex-wrap gap-1.5 text-xs">
            <div className="inline-flex p-0.5 bg-slate-100 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setFilterGender('all')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  filterGender === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({voices.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterGender('female')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  filterGender === 'female' ? 'bg-white text-rose-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                👩 Female ({voices.filter((v) => v.gender === 'female').length})
              </button>
              <button
                type="button"
                onClick={() => setFilterGender('male')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  filterGender === 'male' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                👨 Male ({voices.filter((v) => v.gender === 'male').length})
              </button>
            </div>

            {/* Category Quick Chips */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="text-xs px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 font-medium focus:outline-hidden focus:ring-1 focus:ring-orange-500 cursor-pointer"
            >
              <option value="all">All Specialties (सभी शैलियां)</option>
              <option value="story">Story & Audiobooks (कहानियां)</option>
              <option value="news">News & Tech (समाचार व कॉर्पोरेट)</option>
              <option value="energy">High Energy & Youth (जोशीली व RJ)</option>
              <option value="calm">Meditation & Mentor (शांत व मार्गदर्शक)</option>
            </select>
          </div>
        )}
      </div>

      {/* Neural Voices Grid */}
      {engine === 'neural' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          {filteredVoices.map((voice) => {
            const isSelected = voice.id === selectedVoiceId;
            const isPreviewing = previewingVoiceId === voice.id;

            return (
              <div
                key={voice.id}
                id={`voice-card-${voice.id}`}
                onClick={() => onSelectVoice(voice)}
                className={`group relative rounded-xl p-3.5 border text-left cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                  isSelected
                    ? 'bg-gradient-to-b from-orange-50/70 to-amber-50/40 border-orange-500 shadow-sm ring-2 ring-orange-400/20'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-2xs'
                }`}
              >
                {/* Top: Avatar, Name, Selection Badge */}
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shadow-2xs ${
                          voice.gender === 'female'
                            ? 'bg-gradient-to-tr from-rose-500 to-pink-500 text-white'
                            : 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white'
                        }`}
                      >
                        {voice.nameDevanagari.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-slate-900 text-sm tracking-tight font-sans">
                            {voice.name}
                          </span>
                          <span className="text-xs text-slate-500 font-medium">
                            ({voice.nameDevanagari})
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 block">
                          {voice.gender === 'female' ? '👩 Female' : '👨 Male'} • {voice.ageGroup}
                        </span>
                      </div>
                    </div>

                    {/* Active Radio Pill */}
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-orange-600 text-white'
                          : 'border border-slate-300 group-hover:border-slate-400 text-transparent'
                      }`}
                    >
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  </div>

                  {/* Badge & Specialty */}
                  <div className="mb-2">
                    <span className="inline-block text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200/80">
                      {voice.category}
                    </span>
                  </div>

                  {/* Accent / Description */}
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
                    {voice.description}
                  </p>
                </div>

                {/* Bottom Row: Accent tag + Quick Sample Preview Button */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-slate-400 truncate max-w-[110px]" title={voice.accent}>
                    {voice.accent}
                  </span>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPreviewVoice(voice);
                    }}
                    title="Quick sample preview"
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                      isPreviewing
                        ? 'bg-orange-600 text-white animate-pulse'
                        : 'bg-slate-100 text-slate-700 hover:bg-orange-100 hover:text-orange-800'
                    }`}
                  >
                    {isPreviewing ? (
                      <>
                        <Square className="w-2.5 h-2.5 fill-current" />
                        <span>Playing</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-2.5 h-2.5 fill-current" />
                        <span>Preview</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Browser Voices List */
        <div className="space-y-2">
          {browserVoices.length === 0 ? (
            <div className="text-center py-8 px-4 bg-slate-50 rounded-xl border border-dashed border-slate-300">
              <Volume2 className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-700">No device Hindi voices detected in this browser.</p>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                We recommend switching to <strong>Studio Neural AI</strong> for ultra-high quality Hindi voice synthesis powered by Google Gemini.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {browserVoices.map((bv, idx) => {
                const isSelected = selectedBrowserVoiceIndex === idx;
                return (
                  <div
                    key={bv.voiceURI || idx}
                    onClick={() => onSelectBrowserVoiceIndex(idx)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-400/20'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-xs text-slate-900 flex items-center gap-1.5">
                        <span>{bv.name}</span>
                        {bv.default && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-mono">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">{bv.lang}</p>
                    </div>
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center ${
                        isSelected ? 'bg-blue-600 text-white' : 'border border-slate-300'
                      }`}
                    >
                      {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </section>
  );
};
