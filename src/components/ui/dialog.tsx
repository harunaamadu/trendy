import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl';
}

export const Dialog: React.FC<DialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  maxWidth = 'lg',
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

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity duration-200"
        onClick={() => onOpenChange(false)}
        aria-hidden="true"
      />

      {/* Modal Dialog Content */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'dialog-title' : undefined}
        className={`relative w-full ${maxWidthClasses[maxWidth]} bg-white rounded-3xl shadow-2xl border border-stone-100 overflow-hidden z-10 transition-all transform animate-in fade-in-0 zoom-in-95 duration-200 my-auto`}
      >
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 z-20 rounded-full p-2 text-stone-400 hover:text-stone-800 hover:bg-stone-100 transition-colors focus:outline-none focus:ring-2 focus:ring-stone-400"
          aria-label="Close dialog"
        >
          <X className="h-5 w-5" />
        </button>

        {(title || description) && (
          <div className="px-6 pt-6 pb-2 border-b border-stone-100">
            {title && (
              <h2 id="dialog-title" className="text-xl font-semibold text-stone-900">
                {title}
              </h2>
            )}
            {description && <p className="mt-1 text-sm text-stone-500">{description}</p>}
          </div>
        )}

        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};
