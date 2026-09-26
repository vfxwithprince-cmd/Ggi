import React, { useEffect, useRef, useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Download,
  Volume2,
  VolumeX,
  Sparkles,
  Share2,
  Check,
  Music2,
} from 'lucide-react';
import { HindiVoiceVersion, SpeechStyle, VoiceEngine } from '../types';

interface AudioPlayerVisualizerProps {
  audioUrl: string | null;
  text: string;
  voice: HindiVoiceVersion;
  style: SpeechStyle;
  engine: VoiceEngine;
  speed: number;
  onSpeedChange: (speed: number) => void;
  isPlaying: boolean;
  onPlayPause: () => void;
  onDownload: () => void;
}

export const AudioPlayerVisualizer: React.FC<AudioPlayerVisualizerProps> = ({
  audioUrl,
  text,
  voice,
  style,
  engine,
  speed,
  onSpeedChange,
  isPlaying,
  onPlayPause,
  onDownload,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [copied, setCopied] = useState(false);

  // Sync audio source and playback speed
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  }, [speed]);

  useEffect(() => {
    if (audioRef.current && audioUrl) {
      audioRef.current.playbackRate = speed;
      if (isPlaying) {
        audioRef.current.play().catch(() => {});
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, audioUrl]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleSkip = (seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(
        0,
        Math.min(duration, audioRef.current.currentTime + seconds)
      );
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
      setIsMuted(val === 0);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume || 0.8;
        setIsMuted(false);
      } else {
        audioRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  const formatTime = (timeInSec: number) => {
    if (isNaN(timeInSec) || timeInSec < 0) return '00:00';
    const m = Math.floor(timeInSec / 60);
    const s = Math.floor(timeInSec % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleCopyText = () => {
    if (text) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!audioUrl && engine === 'neural') {
    return null;
  }

  return (
    <section id="audio-player-card" className="w-full bg-gradient-to-br from-slate-900 via-slate-800 to-stone-900 text-white rounded-2xl p-5 shadow-lg border border-slate-700/80">
      {/* Hidden native audio tag */}
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => onPlayPause()}
        />
      )}

      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-700/60">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-md ${
              voice.gender === 'female'
                ? 'bg-gradient-to-tr from-rose-500 to-pink-500 text-white'
                : 'bg-gradient-to-tr from-blue-500 to-indigo-600 text-white'
            }`}
          >
            {voice.nameDevanagari.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base text-white tracking-tight">
                {voice.name} ({voice.nameDevanagari})
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-orange-500/20 text-orange-300 border border-orange-500/30">
                {voice.category}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Style: <span className="text-slate-200 capitalize">{style}</span> • {voice.accent}
            </p>
          </div>
        </div>

        {/* Action Pills */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={handleCopyText}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Text'}</span>
          </button>

          {audioUrl && (
            <button
              id="download-wav-btn"
              type="button"
              onClick={onDownload}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-orange-600 hover:bg-orange-500 text-white shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download WAV</span>
            </button>
          )}
        </div>
      </div>

      {/* Visualizer Waveform Bar */}
      <div className="py-4">
        <div className="flex items-center justify-between gap-1 h-12 px-2 bg-slate-950/40 rounded-xl border border-slate-800/80 overflow-hidden">
          {Array.from({ length: 36 }).map((_, i) => {
            // Calculate dynamic height based on index and playing state
            const seed = (i * 7) % 13;
            const baseH = 15 + seed * 5;
            const isCenter = i > 10 && i < 26;
            const height = isPlaying ? (isCenter ? Math.min(95, baseH * 1.8) : baseH) : 16;

            return (
              <div
                key={i}
                className={`w-full rounded-full transition-all duration-150 ${
                  isPlaying
                    ? 'bg-gradient-to-t from-orange-500 via-amber-400 to-rose-400 opacity-90'
                    : 'bg-slate-700 opacity-40'
                }`}
                style={{
                  height: `${height}%`,
                  animation: isPlaying ? `pulse 0.6s infinite alternate ${i * 0.04}s` : 'none',
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Timeline Scrub Bar */}
      <div className="space-y-1.5 mb-3">
        <input
          id="audio-scrub-slider"
          type="range"
          min="0"
          max={duration || 100}
          step="0.1"
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
        />
        <div className="flex justify-between text-xs text-slate-400 font-mono">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Main Playback Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        {/* Play / Skip Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleSkip(-5)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title="Rewind 5 seconds"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            id="audio-play-pause-btn"
            type="button"
            onClick={onPlayPause}
            className="w-12 h-12 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-all"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </button>

          <button
            type="button"
            onClick={() => handleSkip(5)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title="Forward 5 seconds"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>

        {/* Speed Selector */}
        <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-lg border border-slate-700/80 text-xs">
          <span className="text-[11px] text-slate-400 px-1.5 font-medium">Speed:</span>
          {[0.75, 1.0, 1.25, 1.5, 2.0].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onSpeedChange(s)}
              className={`px-2 py-0.8 rounded-md font-mono transition-colors ${
                speed === s
                  ? 'bg-orange-600 text-white font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>

        {/* Volume Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleMute}
            className="text-slate-400 hover:text-white transition-colors"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>
          <input
            id="volume-slider"
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-20 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
          />
        </div>
      </div>
    </section>
  );
};
