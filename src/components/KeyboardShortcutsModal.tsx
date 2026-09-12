import React from 'react';
import { X, Command } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const SHORTCUTS = [
  { key: 'Space', desc: 'Play / Pause video' },
  { key: '← / →', desc: 'Seek backward / forward 10 seconds' },
  { key: '↑ / ↓', desc: 'Increase / Decrease volume' },
  { key: 'M', desc: 'Mute / Unmute audio' },
  { key: 'F', desc: 'Toggle Fullscreen mode' },
  { key: 'P', desc: 'Toggle Picture-in-Picture' },
  { key: 'T', desc: 'Toggle Theater mode' },
  { key: '0', desc: 'Jump to beginning (0%)' },
  { key: '1 – 9', desc: 'Jump to 10% – 90% progress' },
];

export const KeyboardShortcutsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl text-slate-100">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Command className="w-5 h-5 text-indigo-400" />
            <h3 className="text-lg font-semibold">Keyboard Shortcuts</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1">
          {SHORTCUTS.map((s, idx) => (
            <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50">
              <span className="text-sm text-slate-300">{s.desc}</span>
              <kbd className="px-2 py-1 text-xs font-mono font-semibold bg-slate-700 text-indigo-200 rounded-md border border-slate-600 shadow-inner">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl text-sm transition-colors shadow-lg shadow-indigo-600/20"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
