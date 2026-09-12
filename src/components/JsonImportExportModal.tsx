import React, { useState } from 'react';
import { X, Download, Upload, FileText } from 'lucide-react';
import { exportAppDataJson, importAppDataJson } from '../utils/storage';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onDataImported: () => void;
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const JsonImportExportModal: React.FC<Props> = ({ isOpen, onClose, onDataImported, showToast }) => {
  const [importText, setImportText] = useState('');

  if (!isOpen) return null;

  const handleExport = () => {
    const jsonStr = exportAppDataJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `universal-video-player-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('App data successfully exported as JSON!', 'success');
  };

  const handleImport = () => {
    if (!importText.trim()) {
      showToast('Please paste valid JSON data to import.', 'error');
      return;
    }
    const res = importAppDataJson(importText);
    if (res.success) {
      showToast(res.message, 'success');
      onDataImported();
      setImportText('');
      onClose();
    } else {
      showToast(res.message, 'error');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setImportText(content);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl text-slate-100 flex flex-col gap-5">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-indigo-400" />
            <h3 className="text-lg font-semibold">Backup & JSON Data Management</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h4 className="font-medium text-sm text-slate-200">Export Application Data</h4>
              <p className="text-xs text-slate-400 mt-0.5">Download history, favorites, playlists, and settings as JSON.</p>
            </div>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition-colors shadow-lg shadow-indigo-600/20 shrink-0"
            >
              <Download className="w-4 h-4" />
              Export JSON
            </button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-300">Import Application Data</label>
              <label className="text-xs text-indigo-400 hover:text-indigo-300 cursor-pointer flex items-center gap-1 font-medium">
                <Upload className="w-3.5 h-3.5" />
                Upload JSON file
                <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
            <textarea
              rows={5}
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="Paste JSON configuration payload here..."
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-3 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>
        </div>

        <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={!importText.trim()}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl text-sm transition-colors shadow-lg shadow-emerald-600/20"
          >
            Import & Apply
          </button>
        </div>
      </div>
    </div>
  );
};
