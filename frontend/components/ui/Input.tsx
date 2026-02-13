import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, className = '', ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    className={`
                        w-full px-3 py-2 bg-secondary/50 border border-transparent 
                        rounded-lg text-sm text-foreground placeholder-muted-foreground
                        focus:outline-none focus:ring-2 focus:ring-accent focus:bg-background
                        disabled:opacity-50 disabled:cursor-not-allowed
                        transition-all duration-200
                        ${error ? 'border-red-500 focus:ring-red-500' : ''}
                        ${className}
                    `}
                    {...props}
                />
                {error && (
                    <p className="mt-1 text-xs text-red-500 animate-fade-in">{error}</p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';
