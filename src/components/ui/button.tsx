import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'dark' | 'link' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'default', size = 'md', isLoading = false, children, disabled, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

    const variants = {
      default: 'bg-stone-900 text-white hover:bg-stone-800 shadow-sm hover:shadow',
      dark: 'bg-black text-white hover:bg-stone-900',
      secondary: 'bg-stone-100 text-stone-900 hover:bg-stone-200',
      outline: 'border border-stone-200 bg-transparent text-stone-800 hover:bg-stone-50 hover:border-stone-300',
      ghost: 'bg-transparent text-stone-700 hover:bg-stone-100 hover:text-stone-900',
      link: 'bg-transparent text-stone-900 underline-offset-4 hover:underline p-0 h-auto',
      danger: 'bg-rose-600 text-white hover:bg-rose-700',
    };

    const sizes = {
      sm: 'text-xs px-3 py-1.5 rounded-full',
      md: 'text-sm px-5 py-2.5 rounded-full',
      lg: 'text-base px-7 py-3.5 rounded-full font-semibold',
      icon: 'h-10 w-10 p-0 rounded-full',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <span>{children}</span>
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
