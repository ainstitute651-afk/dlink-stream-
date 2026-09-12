import React from 'react';
import { Film, Sun, Moon, Palette, Command, FileJson, Sparkles } from 'lucide-react';
import { AppSettings, AccentColor } from '../types';

interface Props {
  settings: AppSettings;
  onUpdateSettings: (settings: Partial<AppSettings>) => void;
  onOpenShortcuts: () => void;
  onOpenJsonModal: () => void;
  onOpenExamples: () => void;
}

const ACCENT_COLORS: { id: AccentColor; name: string; class: string }[] = [
  { id: 'indigo', name: 'Indigo', class: 'bg-indigo-500' },
  { id: 'emerald', name: 'Emerald', class: 'bg-emerald-500' },
  { id: 'rose', name: 'Rose', class: 'bg-rose-500' },
  { id: 'amber', name: 'Amber', class: 'bg-amber-500' },
  { id: 'violet', name: 'Violet', class: 'bg-violet-500' },
  { id: 'cyan', name: 'Cyan', class: 'bg-cyan-500' },
];

export const Header: React.FC<Props> = ({
  settings,
  onUpdateSettings,
  onOpenShortcuts,
  onOpenJsonModal,
  onOpenExamples,
}) => {
  const toggleTheme = () => {
    const nextTheme = settings.theme === 'dark' ? 'light' : 'dark';
    onUpdateSettings({ theme: nextTheme });
  };

  return (
    <header className="w-full border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-xl sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white">
            <Film className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-base sm:text-lg text-slate-100 tracking-tight flex items-center gap-2">
              Universal Video Player
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                PRO
              </span>
            </h1>
            <p className="text-xs text-slate-400 hidden sm:block">
              HTML5, HLS & Embed Media Streaming Suite
            </p>
          </div>
        </div>

        {/* Actions & Tools */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Sample Videos */}
          <button
            onClick={onOpenExamples}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-855 border border-slate-700/60 text-xs font-medium text-slate-200 transition-colors shadow-sm"
            title="Browse Sample Videos"
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="hidden md:inline">Samples</span>
          </button>

          {/* JSON Backup */}
          <button
            onClick={onOpenJsonModal}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white transition-colors"
            title="Export / Import JSON Data"
          >
            <FileJson className="w-4 h-4" />
          </button>

          {/* Shortcuts */}
          <button
            onClick={onOpenShortcuts}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white transition-colors hidden sm:block"
            title="Keyboard Shortcuts"
          >
            <Command className="w-4 h-4" />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white transition-colors"
            title="Toggle Theme"
          >
            {settings.theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-400" />
            )}
          </button>

          {/* Accent Color picker */}
          <div className="hidden lg:flex items-center gap-1 pl-2 border-l border-slate-800">
            {ACCENT_COLORS.map((color) => (
              <button
                key={color.id}
                onClick={() => onUpdateSettings({ accentColor: color.id })}
                className={`w-4 h-4 rounded-full transition-transform ${color.class} ${
                  settings.accentColor === color.id ? 'ring-2 ring-white scale-110' : 'opacity-60 hover:opacity-100'
                }`}
                title={color.name}
              />
            ))}
          </div>

        </div>

      </div>
    </header>
  );
};
