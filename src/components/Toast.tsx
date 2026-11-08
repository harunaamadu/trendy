import React from 'react';
import { Sparkles, CheckCircle2 } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const Toast: React.FC = () => {
  const { toastMessage } = useShop();

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
      <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-stone-900 text-white shadow-2xl border border-stone-800 text-xs font-medium">
        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
        <span>{toastMessage}</span>
      </div>
    </div>
  );
};
