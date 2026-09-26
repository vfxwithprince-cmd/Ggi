import { SpeechStyle } from '../types';

const audioCache = new Map<string, string>();

export interface NeuralTTSParams {
  text: string;
  voice?: string;
  persona?: string;
  style?: SpeechStyle;
  styleInstruction?: string;
}

export interface NeuralTTSResult {
  audioUrl: string;
  voice: string;
  persona: string;
  style: string;
  format: string;
}

export async function generateNeuralSpeech(params: NeuralTTSParams): Promise<NeuralTTSResult> {
  const {
    text,
    voice = 'Puck',
    persona = 'Aarav',
    style = 'natural',
    styleInstruction = '',
  } = params;

  const cacheKey = `${voice}_${persona}_${style}_${text.slice(0, 100)}`;
  if (audioCache.has(cacheKey)) {
    return {
      audioUrl: audioCache.get(cacheKey)!,
      voice,
      persona,
      style,
      format: 'wav',
    };
  }

  const response = await fetch('/api/tts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      voice,
      persona,
      style,
      styleInstruction,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Server responded with status ${response.status}`);
  }

  const data = await response.json();
  if (!data.audioUrl) {
    throw new Error('Server returned invalid audio URL.');
  }

  audioCache.set(cacheKey, data.audioUrl);
  return data;
}

export async function translateToHindi(text: string): Promise<{ hindiText: string; hinglishText: string }> {
  const response = await fetch('/api/translate-hindi', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to translate to Hindi.');
  }

  return response.json();
}

export async function polishHindi(text: string): Promise<string> {
  const response = await fetch('/api/polish-hindi', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to polish text.');
  }

  const data = await response.json();
  return data.polishedText || text;
}

// Browser Web Speech API Voice Helpers
export function getBrowserHindiVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return [];
  }
  const allVoices = window.speechSynthesis.getVoices();
  const hindiVoices = allVoices.filter(
    (v) =>
      v.lang.toLowerCase().startsWith('hi') ||
      v.lang.toLowerCase().includes('hi-in') ||
      v.name.toLowerCase().includes('hindi') ||
      v.name.toLowerCase().includes('lekha') ||
      v.name.toLowerCase().includes('madhur') ||
      v.name.toLowerCase().includes('swara')
  );

  // If no pure Hindi voice found, also include Indian English as close phonetic match
  if (hindiVoices.length === 0) {
    const indianVoices = allVoices.filter(
      (v) => v.lang.toLowerCase().includes('en-in') || v.name.toLowerCase().includes('india')
    );
    return indianVoices.length > 0 ? indianVoices : allVoices.slice(0, 3);
  }

  return hindiVoices;
}

export function speakWithBrowserUtterance(
  text: string,
  voice: SpeechSynthesisVoice | null,
  rate = 1.0,
  pitch = 1.0,
  onStart?: () => void,
  onEnd?: () => void,
  onError?: (err: any) => void
): SpeechSynthesisUtterance | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return null;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  if (voice) {
    utterance.voice = voice;
    utterance.lang = voice.lang || 'hi-IN';
  } else {
    utterance.lang = 'hi-IN';
  }
  utterance.rate = Math.max(0.5, Math.min(2.0, rate));
  utterance.pitch = Math.max(0.5, Math.min(1.5, pitch));

  utterance.onstart = () => onStart?.();
  utterance.onend = () => onEnd?.();
  utterance.onerror = (e) => onError?.(e);

  window.speechSynthesis.speak(utterance);
  return utterance;
}

export function stopBrowserSpeech(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
