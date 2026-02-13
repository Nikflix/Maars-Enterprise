import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'glass' | 'bordered';
}

export const Card = ({
    children,
    variant = 'default',
    className = '',
    ...props
}: CardProps) => {
    const variants = {
        default: "bg-white dark:bg-zinc-900 border border-border shadow-sm",
        glass: "glass-panel",
        bordered: "border border-border bg-transparent",
    };

    return (
        <div
            className={`rounded-xl overflow-hidden ${variants[variant]} ${className}`}
            {...props}
        >
            {children}
        </div>
    );
};
