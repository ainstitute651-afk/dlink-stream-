import React from 'react';
import { X, Play, Film, Sparkles } from 'lucide-react';
import { SAMPLE_VIDEOS } from '../utils/detector';
import { VideoItem } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelectVideo: (item: { url: string; title: string }) => void;
}

export const ExampleUrlsModal: React.FC<Props> = ({ isOpen, onClose, onSelectVideo }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl text-slate-100 flex flex-col gap-5 max-h-[85vh]">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <h3 className="text-lg font-semibold">Sample Video Library</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-400">
          Choose from curated publicly accessible sample video streams (MP4 & HLS) to instantly test playback, subtitles, controls, and features without CORS or broken link issues.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-y-auto pr-1">
          {SAMPLE_VIDEOS.map((item) => (
            <div 
              key={item.id}
              onClick={() => {
                onSelectVideo({ url: item.url, title: item.title });
                onClose();
              }}
              className="group p-4 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 hover:border-indigo-500/50 cursor-pointer transition-all duration-200 flex flex-col justify-between gap-3 shadow-md"
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wide">
                    {item.type}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">{item.category}</span>
                </div>
                <h4 className="font-medium text-sm text-slate-100 group-hover:text-indigo-300 transition-colors line-clamp-1">
                  {item.title}
                </h4>
                <p className="text-xs text-slate-400 line-clamp-2">{item.notes}</p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-700/40">
                <span className="text-xs font-mono text-slate-500 truncate max-w-[200px]">{item.url}</span>
                <span className="flex items-center gap-1 text-xs font-medium text-indigo-400 group-hover:translate-x-0.5 transition-transform">
                  <Play className="w-3.5 h-3.5 fill-current" /> Play
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-2 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
