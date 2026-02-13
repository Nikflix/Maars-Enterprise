import React from 'react';

interface SliderProps {
    min: number;
    max: number;
    step?: number;
    value: number;
    onChange: (value: number) => void;
    className?: string;
}

export const Slider = ({ min, max, step = 1, value, onChange, className = '' }: SliderProps) => {
    const percentage = ((value - min) / (max - min)) * 100;

    return (
        <div className={`relative w-full h-6 flex items-center ${className}`}>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className="absolute w-full h-full opacity-0 cursor-pointer z-10"
            />
            {/* Track Background */}
            <div className="absolute w-full h-1 bg-white/10 rounded-full overflow-hidden">
                {/* Active Track (Fill) */}
                <div
                    className="h-full bg-accent-primary transition-all duration-100"
                    style={{ width: `${percentage}%` }}
                />
            </div>
            {/* Thumb (Visual) */}
            <div
                className="absolute w-4 h-4 rounded-full bg-white border-2 border-accent-primary shadow-[0_0_10px_rgba(139,92,246,0.5)] transform -translate-x-1/2 transition-all duration-100 pointer-events-none"
                style={{ left: `${percentage}%` }}
            />
        </div>
    );
};
