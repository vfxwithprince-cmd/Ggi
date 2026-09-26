export type Gender = 'female' | 'male';

export type GeminiVoiceName = 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr';

export type VoiceEngine = 'neural' | 'browser';

export type SpeechStyle =
  | 'natural'
  | 'storyteller'
  | 'news'
  | 'motivational'
  | 'calm'
  | 'poetic'
  | 'rj'
  | 'cheerful';

export interface HindiVoiceVersion {
  id: string;
  name: string;
  nameDevanagari: string;
  gender: Gender;
  geminiVoice: GeminiVoiceName;
  ageGroup: 'Young Adult' | 'Adult' | 'Mature';
  category: string;
  categoryDevanagari: string;
  description: string;
  accent: string;
  badge: string;
  sampleText: string;
  avatarColor: {
    bg: string;
    text: string;
    border: string;
    accent: string;
  };
  styleInstruction: string;
}

export interface BrowserVoiceInfo {
  name: string;
  lang: string;
  voiceURI: string;
  isDefault: boolean;
}

export interface SpeechHistoryItem {
  id: string;
  text: string;
  voiceId: string;
  voiceName: string;
  nameDevanagari: string;
  gender: Gender;
  audioUrl?: string; // For neural WAV
  timestamp: number;
  durationSec?: number;
  speed: number;
  pitch: number;
  engine: VoiceEngine;
  style: SpeechStyle;
}

export interface SampleScript {
  id: string;
  title: string;
  titleDevanagari: string;
  category: 'Story' | 'Motivation' | 'News' | 'Poetry' | 'Everyday' | 'Tech';
  text: string;
  recommendedVoiceId: string;
  recommendedStyle: SpeechStyle;
}
