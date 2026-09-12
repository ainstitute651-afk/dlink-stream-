import React, { useState, useRef } from 'react';
import { Link2, Clipboard, Play, Trash2, Upload, HelpCircle, EyeOff, Eye } from 'lucide-react';

interface Props {
  currentUrl: string;
  onUrlChange: (url: string) => void;
  onLoadUrl: (url: string) => void;
  onFileDrop: (file: File) => void;
  doNotSaveHistory: boolean;
  onToggleDoNotSaveHistory: () => void;
  onOpenExamples: () => void;
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const UrlInputBar: React.FC<Props> = ({
  currentUrl,
  onUrlChange,
  onLoadUrl,
  onFileDrop,
  doNotSaveHistory,
  onToggleDoNotSaveHistory,
  onOpenExamples,
  showToast,
}) => {
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        onUrlChange(text);
        showToast('Pasted URL from clipboard', 'info');
      }
    } catch {
      showToast('Clipboard permission denied or unavailable', 'error');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onLoadUrl(currentUrl);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = () => {
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (file.type.startsWith('video/')) {
        onFileDrop(file);
        showToast(`Loaded local video: ${file.name}`, 'success');
      } else {
        showToast('Please drop a valid video file (.mp4, .webm, .ogg, etc.)', 'error');
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileDrop(file);
      showToast(`Loaded local video: ${file.name}`, 'success');
    }
  };

  return (
    <div 
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`w-full bg-slate-900/80 border rounded-2xl p-4 sm:p-5 shadow-xl backdrop-blur-md transition-all ${
        isDraggingOver ? 'border-indigo-500 bg-indigo-950/20 ring-4 ring-indigo-500/20' : 'border-slate-800'
      }`}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Link2 className="w-3.5 h-3.5 text-indigo-400" />
            Paste Video URL or Drop Local File
          </label>
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleDoNotSaveHistory}
              className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg border transition-colors ${
                doNotSaveHistory 
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                  : 'bg-slate-800 text-slate-400 border-slate-700/60 hover:text-slate-200'
              }`}
              title="When enabled, loaded URLs will not be saved to history"
            >
              {doNotSaveHistory ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>Incognito History</span>
            </button>
            <button
              onClick={onOpenExamples}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
            >
              <HelpCircle className="w-3.5 h-3.5" /> Examples
            </button>
          </div>
        </div>

        {/* Input & Action buttons */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Link2 className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={currentUrl}
              onChange={(e) => onUrlChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Paste direct video URL (.mp4, .m3u8), YouTube, Vimeo, or drop file here..."
              className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-inner"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handlePaste}
              className="flex items-center justify-center gap-1.5 px-3.5 py-3 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 font-medium rounded-xl text-xs sm:text-sm transition-colors"
              title="Paste from clipboard"
            >
              <Clipboard className="w-4 h-4" />
              <span className="hidden sm:inline">Paste</span>
            </button>

            <button
              onClick={() => {
                if (currentUrl.trim()) {
                  onLoadUrl(currentUrl);
                } else {
                  showToast('Please enter or paste a valid URL', 'error');
                }
              }}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl text-sm transition-colors shadow-lg shadow-indigo-600/25"
            >
              <Play className="w-4 h-4 fill-current" />
              Load Video
            </button>

            <button
              onClick={() => onUrlChange('')}
              className="p-3 bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-white border border-slate-700 rounded-xl transition-colors"
              title="Clear input"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-1.5 px-3.5 py-3 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 font-medium rounded-xl text-xs sm:text-sm transition-colors"
              title="Upload local file"
            >
              <Upload className="w-4 h-4 text-emerald-400" />
              <span className="hidden md:inline">File</span>
              <input 
                ref={fileInputRef}
                type="file" 
                accept="video/*" 
                onChange={handleFileSelect} 
                className="hidden" 
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
