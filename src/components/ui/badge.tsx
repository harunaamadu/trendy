import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'sale' | 'new' | 'warning' | 'danger' | 'success';
}

export const Badge: React.FC<BadgeProps> = ({
  className = '',
  variant = 'default',
  children,
  ...props
}) => {
  const base =
    'inline-flex items-center text-[10px] font-semibold tracking-wider uppercase px-2.5 py-0.5 rounded-full transition-colors';

  const variants = {
    default: 'bg-stone-900 text-white',
    secondary: 'bg-stone-100 text-stone-800 border border-stone-200',
    outline: 'border border-stone-300 text-stone-700 bg-white/80 backdrop-blur-xs',
    sale: 'bg-rose-500 text-white shadow-xs',
    new: 'bg-emerald-600 text-white shadow-xs',
    warning: 'bg-amber-100 text-amber-800 border border-amber-200',
    danger: 'bg-rose-100 text-rose-800 border border-rose-200',
    success: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
  };

  return (
    <span className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </span>
  );
};
