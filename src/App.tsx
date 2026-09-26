import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { VoiceSelector } from './components/VoiceSelector';
import { SpeechStudio } from './components/SpeechStudio';
import { AudioPlayerVisualizer } from './components/AudioPlayerVisualizer';
import { SampleScriptsModal } from './components/SampleScriptsModal';
import { SpeechHistoryDrawer } from './components/SpeechHistoryDrawer';
import { AndroidApkModal } from './components/AndroidApkModal';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { OfflineIndicator } from './components/OfflineIndicator';
import { HINDI_VOICE_VERSIONS } from './data/hindiVoices';
import {
  HindiVoiceVersion,
  SpeechStyle,
  VoiceEngine,
  SpeechHistoryItem,
  SampleScript,
} from './types';
import {
  generateNeuralSpeech,
  getBrowserHindiVoices,
  speakWithBrowserUtterance,
  stopBrowserSpeech,
  translateToHindi,
  polishHindi,
} from './lib/ttsService';
import { AlertCircle, CheckCircle2, Volume2, Info, Sparkles } from 'lucide-react';

const DEFAULT_HINDI_TEXT =
  'नमस्ते! आपका हिन्दी टेक्स्ट-टू-स्पीच स्टूडियो में स्वागत है। यहाँ आप दस अलग-अलग भारतीय आवाज़ों में स्वाभाविक और स्पष्ट हिन्दी सुन सकते हैं।';

const STORAGE_KEY = 'hindi_tts_history_v1';

export function App() {
  const [voices] = useState<HindiVoiceVersion[]>(HINDI_VOICE_VERSIONS);
  const [selectedVoice, setSelectedVoice] = useState<HindiVoiceVersion>(HINDI_VOICE_VERSIONS[0]);
  const [selectedStyle, setSelectedStyle] = useState<SpeechStyle>('natural');
  const [engine, setEngine] = useState<VoiceEngine>('neural');
  const [text, setText] = useState<string>(DEFAULT_HINDI_TEXT);
  const [speed, setSpeed] = useState<number>(1.0);
  const [pitch, setPitch] = useState<number>(1.0);

  // Audio state
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);
  const [previewingVoiceId, setPreviewingVoiceId] = useState<string | null>(null);

  // Browser voices state
  const [browserVoices, setBrowserVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedBrowserVoiceIndex, setSelectedBrowserVoiceIndex] = useState<number>(0);

  // Modals & Drawers
  const [isSamplesOpen, setIsSamplesOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isAndroidModalOpen, setIsAndroidModalOpen] = useState<boolean>(false);
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [isPolishing, setIsPolishing] = useState<boolean>(false);

  // Toast notifications
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // History state with localStorage
  const [history, setHistory] = useState<SpeechHistoryItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to load history from localStorage', e);
      }
    }
    return [];
  });

  const activeAudioRef = useRef<HTMLAudioElement | null>(null);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Load browser speech voices
  useEffect(() => {
    const updateVoices = () => {
      const detected = getBrowserHindiVoices();
      setBrowserVoices(detected);
    };

    updateVoices();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  // Save history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, 30)));
    } catch (e) {
      console.error('Failed to persist history', e);
    }
  }, [history]);

  // Handle Synthesis
  const handleSynthesize = async () => {
    if (!text.trim()) {
      showToast('कृपया पहले कुछ हिन्दी या अंग्रेज़ी पाठ लिखें।', 'error');
      return;
    }

    // Stop any existing audio
    handleStopAudio();
    setIsSynthesizing(true);

    if (engine === 'neural') {
      try {
        const result = await generateNeuralSpeech({
          text,
          voice: selectedVoice.geminiVoice,
          persona: selectedVoice.name,
          style: selectedStyle,
          styleInstruction: selectedVoice.styleInstruction,
        });

        setCurrentAudioUrl(result.audioUrl);
        setIsPlaying(true);

        // Add to history
        const newItem: SpeechHistoryItem = {
          id: `speech-${Date.now()}`,
          text,
          voiceId: selectedVoice.id,
          voiceName: selectedVoice.name,
          nameDevanagari: selectedVoice.nameDevanagari,
          gender: selectedVoice.gender,
          audioUrl: result.audioUrl,
          timestamp: Date.now(),
          speed,
          pitch,
          engine: 'neural',
          style: selectedStyle,
        };

        setHistory((prev) => [newItem, ...prev]);
        showToast(`${selectedVoice.name} (${selectedVoice.nameDevanagari}) की आवाज़ तैयार हो गई!`, 'success');
      } catch (err: any) {
        console.error('Neural TTS synthesis failed:', err);
        showToast(err.message || 'Speech generation failed. Please try again.', 'error');
      } finally {
        setIsSynthesizing(false);
      }
    } else {
      // Browser Speech Synthesis
      try {
        const voiceObj = browserVoices[selectedBrowserVoiceIndex] || null;
        speakWithBrowserUtterance(
          text,
          voiceObj,
          speed,
          pitch,
          () => {
            setIsPlaying(true);
            setIsSynthesizing(false);
          },
          () => {
            setIsPlaying(false);
          },
          (err) => {
            console.error('Browser speech error:', err);
            setIsPlaying(false);
            setIsSynthesizing(false);
            showToast('Browser voice synthesis encountered an error.', 'error');
          }
        );

        // Add to history
        const newItem: SpeechHistoryItem = {
          id: `speech-${Date.now()}`,
          text,
          voiceId: voiceObj ? voiceObj.name : 'browser-default',
          voiceName: voiceObj ? voiceObj.name : 'Device Voice',
          nameDevanagari: 'डिवाइस आवाज़',
          gender: 'female',
          timestamp: Date.now(),
          speed,
          pitch,
          engine: 'browser',
          style: selectedStyle,
        };
        setHistory((prev) => [newItem, ...prev]);
      } catch (err: any) {
        setIsSynthesizing(false);
        showToast('Failed to start device speech.', 'error');
      }
    }
  };

  const handleStopAudio = () => {
    setIsPlaying(false);
    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
      activeAudioRef.current.currentTime = 0;
    }
    stopBrowserSpeech();
  };

  // Quick Preview for any voice card
  const handlePreviewVoice = async (voice: HindiVoiceVersion) => {
    if (previewingVoiceId === voice.id) {
      // Already playing this voice, stop it
      handleStopAudio();
      setPreviewingVoiceId(null);
      return;
    }

    handleStopAudio();
    setPreviewingVoiceId(voice.id);

    try {
      const result = await generateNeuralSpeech({
        text: voice.sampleText,
        voice: voice.geminiVoice,
        persona: voice.name,
        style: selectedStyle,
        styleInstruction: voice.styleInstruction,
      });

      const audio = new Audio(result.audioUrl);
      activeAudioRef.current = audio;
      audio.playbackRate = speed;
      audio.onended = () => {
        setPreviewingVoiceId(null);
      };
      audio.onerror = () => {
        setPreviewingVoiceId(null);
      };

      await audio.play();
    } catch (err: any) {
      console.error('Preview failed:', err);
      setPreviewingVoiceId(null);
      showToast('Could not preview voice sample.', 'error');
    }
  };

  // Download Current Audio as WAV
  const handleDownloadWav = (customAudioUrl?: string, customFilename?: string) => {
    const url = customAudioUrl || currentAudioUrl;
    if (!url) return;

    const link = document.createElement('a');
    link.href = url;
    const dateStr = new Date().toISOString().slice(0, 10);
    link.download = customFilename || `hindi-speech-${selectedVoice.id}-${dateStr}.wav`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('WAV ऑडियो फ़ाइल डाउनलोड हो गई!', 'success');
  };

  // Translate to Hindi AI action
  const handleTranslateToHindi = async () => {
    if (!text.trim()) return;
    setIsTranslating(true);
    try {
      const result = await translateToHindi(text);
      if (result.hindiText) {
        setText(result.hindiText);
        showToast('पाठ का स्वाभाविक हिन्दी में अनुवाद हो गया!', 'success');
      }
    } catch (err: any) {
      console.error('Translate failed:', err);
      showToast('अनुवाद विफल रहा। कृपया पुनः प्रयास करें।', 'error');
    } finally {
      setIsTranslating(false);
    }
  };

  // Polish Hindi Cadence AI action
  const handlePolishHindi = async () => {
    if (!text.trim()) return;
    setIsPolishing(true);
    try {
      const polished = await polishHindi(text);
      if (polished) {
        setText(polished);
        showToast('वाक्य संरचना और विराम चिह्न सुधारे गए!', 'success');
      }
    } catch (err: any) {
      console.error('Polish failed:', err);
      showToast('सुधार विफल रहा।', 'error');
    } finally {
      setIsPolishing(false);
    }
  };

  // Script selection handler
  const handleSelectScript = (script: SampleScript) => {
    setText(script.text);
    const matchedVoice = voices.find((v) => v.id === script.recommendedVoiceId);
    if (matchedVoice) {
      setSelectedVoice(matchedVoice);
    }
    setSelectedStyle(script.recommendedStyle);
    showToast(`'${script.titleDevanagari}' स्क्रिप्ट लोड हो गई!`, 'info');
  };

  // History play handler
  const handlePlayHistoryItem = (item: SpeechHistoryItem) => {
    if (item.audioUrl) {
      setCurrentAudioUrl(item.audioUrl);
      const matched = voices.find((v) => v.id === item.voiceId);
      if (matched) setSelectedVoice(matched);
      setSelectedStyle(item.style);
      setIsPlaying(true);
      setIsHistoryOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div
            className={`px-4 py-3 rounded-xl shadow-lg border flex items-center gap-2.5 text-xs font-semibold ${
              toastMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                : toastMessage.type === 'error'
                ? 'bg-rose-50 text-rose-900 border-rose-200'
                : 'bg-slate-900 text-white border-slate-800'
            }`}
          >
            {toastMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
            {toastMessage.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-600" />}
            {toastMessage.type === 'info' && <Info className="w-4 h-4 text-amber-400" />}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Android & PWA Install Banner */}
      <PWAInstallBanner onOpenAndroidModal={() => setIsAndroidModalOpen(true)} />

      {/* Header */}
      <Header
        engine={engine}
        onEngineChange={(newEngine) => {
          handleStopAudio();
          setEngine(newEngine);
          showToast(
            newEngine === 'neural'
              ? 'Studio Neural AI engine activated (10 Studio voices).'
              : 'Device speech engine activated.',
            'info'
          );
        }}
        browserVoiceCount={browserVoices.length}
        historyCount={history.length}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenSamples={() => setIsSamplesOpen(true)}
        onOpenAndroidApk={() => setIsAndroidModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Voice Selection Section */}
        <VoiceSelector
          voices={voices}
          selectedVoiceId={selectedVoice.id}
          onSelectVoice={(v) => {
            setSelectedVoice(v);
            showToast(`Voice selected: ${v.name} (${v.nameDevanagari})`, 'info');
          }}
          onPreviewVoice={handlePreviewVoice}
          previewingVoiceId={previewingVoiceId}
          engine={engine}
          browserVoices={browserVoices}
          selectedBrowserVoiceIndex={selectedBrowserVoiceIndex}
          onSelectBrowserVoiceIndex={setSelectedBrowserVoiceIndex}
        />

        {/* Speech Studio Workspace */}
        <SpeechStudio
          text={text}
          onTextChange={setText}
          selectedVoice={selectedVoice}
          selectedStyle={selectedStyle}
          onStyleChange={setSelectedStyle}
          speed={speed}
          onSpeedChange={setSpeed}
          pitch={pitch}
          onPitchChange={setPitch}
          engine={engine}
          isSynthesizing={isSynthesizing}
          onSynthesize={handleSynthesize}
          onStop={handleStopAudio}
          isPlaying={isPlaying}
          onTranslateToHindi={handleTranslateToHindi}
          isTranslating={isTranslating}
          onPolishHindi={handlePolishHindi}
          isPolishing={isPolishing}
          onOpenSamples={() => setIsSamplesOpen(true)}
        />

        {/* Audio Player & Visualizer */}
        {currentAudioUrl && (
          <AudioPlayerVisualizer
            audioUrl={currentAudioUrl}
            text={text}
            voice={selectedVoice}
            style={selectedStyle}
            engine={engine}
            speed={speed}
            onSpeedChange={setSpeed}
            isPlaying={isPlaying}
            onPlayPause={() => setIsPlaying(!isPlaying)}
            onDownload={() => handleDownloadWav()}
          />
        )}

      </main>

      {/* Sample Scripts Modal */}
      <SampleScriptsModal
        isOpen={isSamplesOpen}
        onClose={() => setIsSamplesOpen(false)}
        onSelectScript={handleSelectScript}
        voices={voices}
      />

      {/* Speech History Drawer */}
      <SpeechHistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onPlayItem={handlePlayHistoryItem}
        onDownloadItem={(item) =>
          handleDownloadWav(item.audioUrl, `hindi-speech-${item.voiceId}-${item.id}.wav`)
        }
        onLoadItemText={(itemText) => {
          setText(itemText);
          setIsHistoryOpen(false);
          showToast('Text loaded into editor!', 'info');
        }}
        onDeleteItem={(id) => {
          setHistory((prev) => prev.filter((item) => item.id !== id));
          showToast('Clip removed from history.', 'info');
        }}
        onClearAll={() => {
          setHistory([]);
          showToast('History cleared.', 'info');
        }}
      />

      {/* Android App & APK Modal */}
      <AndroidApkModal
        isOpen={isAndroidModalOpen}
        onClose={() => setIsAndroidModalOpen(false)}
        appUrl={typeof window !== 'undefined' ? window.location.origin : ''}
      />

      {/* PWA Offline Connectivity Indicator */}
      <OfflineIndicator />

      {/* Footer */}
      <footer className="w-full bg-white border-t border-slate-200 py-4 mt-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="flex items-center gap-1">
            <span>Hindi Text-to-Speech (हिन्दी टी.टी.एस) Studio</span>
            <span>•</span>
            <span className="text-slate-700 font-medium">10 Authentic Hindi Voice Versions</span>
          </p>
          <p className="text-slate-400">
            Powered by Google Gemini Neural Speech & Web Audio • 24,000 Hz HD Output
          </p>
        </div>
      </footer>
    </div>
  );
}
export default App;
