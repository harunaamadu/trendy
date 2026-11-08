import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  side?: 'right' | 'left';
  className?: string;
}

export const Sheet: React.FC<SheetProps> = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  side = 'right',
  className = '',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onOpenChange(false);
      }
    };
    if (open) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs transition-opacity duration-300"
        onClick={() => onOpenChange(false)}
        aria-hidden="true"
      />

      <div className={`fixed inset-y-0 ${side === 'right' ? 'right-0' : 'left-0'} flex max-w-full pl-10`}>
        <div
          role="dialog"
          aria-modal="true"
          className={`w-screen max-w-md md:max-w-lg bg-white shadow-2xl flex flex-col transform transition-transform ease-out duration-300 z-10 ${className}`}
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
            <div>
              {title && <h2 className="text-lg font-semibold text-stone-900">{title}</h2>}
              {description && <p className="text-xs text-stone-500 mt-0.5">{description}</p>}
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="rounded-full p-2 text-stone-400 hover:text-stone-800 hover:bg-stone-200/60 transition-colors focus:outline-none focus:ring-2 focus:ring-stone-400"
              aria-label="Close sheet"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6">{children}</div>
        </div>
      </div>
    </div>
  );
};
