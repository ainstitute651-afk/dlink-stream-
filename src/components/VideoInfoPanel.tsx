import React from 'react';
import { Info, Star, Plus, Check, Play, Globe, Clock, ShieldCheck, Film } from 'lucide-react';
import { DetectedResult } from '../utils/detector';

interface Props {
  detected: DetectedResult;
  metadata: {
    duration: number;
    resolution: string;
    mimeType: string;
    title: string;
  };
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onAddToPlaylist: () => void;
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const VideoInfoPanel: React.FC<Props> = ({
  detected,
  metadata,
  isFavorite,
  onToggleFavorite,
  onAddToPlaylist,
  showToast,
}) => {
  if (!detected.cleanUrl) return null;

  const formatDuration = (secs: number) => {
    if (!secs || isNaN(secs)) return 'Unknown / Live';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}m ${s}s`;
  };

  return (
    <div className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold uppercase tracking-wider">
              {detected.type}
            </span>
            <span className="text-xs text-slate-400 font-medium">{detected.formatDescription}</span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-slate-100 break-all">
            {detected.title || 'Untitled Stream'}
          </h2>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onToggleFavorite}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-medium transition-colors ${
              isFavorite 
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-md shadow-amber-500/10' 
                : 'bg-slate-800 hover:bg-slate-750 text-slate-300 border-slate-700'
            }`}
          >
            <Star className={`w-4 h-4 ${isFavorite ? 'fill-current text-amber-400' : ''}`} />
            <span>{isFavorite ? 'Favorited' : 'Add to Favorites'}</span>
          </button>

          <button
            onClick={onAddToPlaylist}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-xl text-xs font-medium transition-colors"
          >
            <Plus className="w-4 h-4 text-indigo-400" />
            <span>Add to Playlist</span>
          </button>
        </div>
      </div>

      {/* Grid metadata */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
        <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80">
          <div className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider flex items-center gap-1">
            <Film className="w-3 h-3 text-indigo-400" /> Resolution
          </div>
          <div className="text-sm font-semibold text-slate-200 mt-1">{metadata.resolution}</div>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80">
          <div className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider flex items-center gap-1">
            <Clock className="w-3 h-3 text-emerald-400" /> Duration
          </div>
          <div className="text-sm font-semibold text-slate-200 mt-1">{formatDuration(metadata.duration)}</div>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80">
          <div className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider flex items-center gap-1">
            <Globe className="w-3 h-3 text-cyan-400" /> MIME Type
          </div>
          <div className="text-sm font-semibold text-slate-200 mt-1 truncate">{metadata.mimeType}</div>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80">
          <div className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-amber-400" /> CORS / Security
          </div>
          <div className="text-sm font-semibold text-emerald-400 mt-1">Permitted Direct</div>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-500 font-mono truncate">
        <span className="truncate">Source: {detected.cleanUrl}</span>
        <button
          onClick={() => {
            navigator.clipboard.writeText(detected.cleanUrl);
            showToast('Copied video URL to clipboard', 'success');
          }}
          className="text-indigo-400 hover:text-indigo-300 font-sans font-medium ml-2 shrink-0"
        >
          Copy URL
        </button>
      </div>
    </div>
  );
};
