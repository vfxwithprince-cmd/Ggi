import React from 'react';
import { X, Play, Download, Trash2, Clock, Volume2, RotateCcw, Copy } from 'lucide-react';
import { SpeechHistoryItem } from '../types';

interface SpeechHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: SpeechHistoryItem[];
  onPlayItem: (item: SpeechHistoryItem) => void;
  onDownloadItem: (item: SpeechHistoryItem) => void;
  onLoadItemText: (text: string) => void;
  onDeleteItem: (id: string) => void;
  onClearAll: () => void;
}

export const SpeechHistoryDrawer: React.FC<SpeechHistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onPlayItem,
  onDownloadItem,
  onLoadItemText,
  onDeleteItem,
  onClearAll,
}) => {
  if (!isOpen) return null;

  const formatTimestamp = (ts: number) => {
    const diff = Date.now() - ts;
    const min = Math.floor(diff / 60000);
    if (min < 1) return 'Just now';
    if (min < 60) return `${min}m ago`;
    const hours = Math.floor(min / 60);
    if (hours < 24) return `${hours}h ago`;
    return new Date(ts).toLocaleDateString();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/50 backdrop-blur-xs">
      <div
        id="speech-history-drawer"
        className="bg-white w-full max-w-md h-full flex flex-col shadow-2xl border-l border-slate-200 animate-in slide-in-from-right duration-200"
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900">
              Saved Hindi Speeches (सहेजी गई आवाज़ें)
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 font-semibold">
              {history.length}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {history.length > 0 && (
              <button
                type="button"
                onClick={onClearAll}
                className="text-xs text-slate-500 hover:text-rose-600 px-2 py-1 rounded hover:bg-slate-100 transition-colors"
              >
                Clear All
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {history.length === 0 ? (
            <div className="text-center py-12 px-4">
              <Volume2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No generated speeches yet</p>
              <p className="text-xs text-slate-500 mt-1">
                When you synthesize speech using any Hindi voice, your audio clips will be saved here for instant replay and download.
              </p>
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 shadow-2xs space-y-2.5 transition-all"
              >
                {/* Voice & Timestamp */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs text-white ${
                        item.gender === 'female'
                          ? 'bg-gradient-to-tr from-rose-500 to-pink-500'
                          : 'bg-gradient-to-tr from-blue-600 to-indigo-600'
                      }`}
                    >
                      {item.nameDevanagari?.charAt(0) || item.voiceName.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-900">
                        {item.voiceName} ({item.nameDevanagari})
                      </div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-1.5">
                        <span className="capitalize text-orange-600 font-medium">{item.style}</span>
                        <span>•</span>
                        <span className="font-mono">{item.speed}x</span>
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    {formatTimestamp(item.timestamp)}
                  </span>
                </div>

                {/* Text excerpt */}
                <p
                  className="text-xs text-slate-700 line-clamp-2 leading-relaxed bg-slate-50 p-2 rounded border border-slate-100"
                  style={{ fontFamily: "'Noto Sans Devanagari', system-ui, sans-serif" }}
                >
                  {item.text}
                </p>

                {/* Actions */}
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-1.5">
                    {item.audioUrl && (
                      <button
                        type="button"
                        onClick={() => onPlayItem(item)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-orange-50 hover:bg-orange-100 text-orange-700 font-medium transition-colors cursor-pointer"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Play</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => onLoadItemText(item.text)}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-slate-600 hover:bg-slate-100 transition-colors"
                      title="Load into text editor"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    {item.audioUrl && (
                      <button
                        type="button"
                        onClick={() => onDownloadItem(item)}
                        className="p-1.5 text-slate-500 hover:text-slate-900 rounded-md hover:bg-slate-100 transition-colors"
                        title="Download WAV"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => onDeleteItem(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors"
                      title="Delete from history"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
