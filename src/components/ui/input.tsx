import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, helperText, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-medium text-stone-700 tracking-wide">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`flex h-11 w-full rounded-xl border bg-white px-3.5 py-2 text-sm text-stone-900 placeholder:text-stone-400 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:border-stone-400 disabled:cursor-not-allowed disabled:opacity-50 ${
            error ? 'border-rose-500 focus-visible:ring-rose-400' : 'border-stone-200 hover:border-stone-300'
          } ${className}`}
          {...props}
        />
        {error && <p className="text-xs text-rose-500">{error}</p>}
        {helperText && !error && <p className="text-xs text-stone-500">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
