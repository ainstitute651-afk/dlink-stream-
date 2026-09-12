import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full px-4 pointer-events-none">
      {toasts.map(t => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({ toast, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  return (
    <div className={`pointer-events-auto flex items-center justify-between p-4 rounded-xl shadow-xl border backdrop-blur-md transition-all duration-300 animate-slide-up ${
      toast.type === 'success' ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-100' :
      toast.type === 'error' ? 'bg-rose-950/90 border-rose-500/40 text-rose-100' :
      'bg-slate-900/90 border-slate-700/60 text-slate-100'
    }`}>
      <div className="flex items-center gap-3">
        {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
        {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />}
        {toast.type === 'info' && <Info className="w-5 h-5 text-indigo-400 shrink-0" />}
        <p className="text-sm font-medium">{toast.message}</p>
      </div>
      <button 
        onClick={() => onDismiss(toast.id)}
        className="ml-3 p-1 rounded-lg hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
