
import React from 'react';
import { Sparkles, Loader2, CheckCircle } from 'lucide-react';

interface HumanizerButtonProps {
    onClick: () => void;
    isHumanizing: boolean;
    progress: number;
    isDone: boolean;
    disabled?: boolean;
}

export const HumanizerButton: React.FC<HumanizerButtonProps> = ({
    onClick,
    isHumanizing,
    progress,
    isDone,
    disabled
}) => {
    if (isHumanizing) {
        return (
            <button
                disabled
                className="h-9 px-4 min-w-[150px] flex items-center justify-center gap-2 bg-violet-500/10 border border-violet-500/50 text-violet-400 font-medium rounded-lg cursor-wait relative overflow-hidden"
            >
                {/* Progress bar background */}
                <div
                    className="absolute inset-0 bg-violet-500/10 transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                />
                <Loader2 className="w-4 h-4 animate-spin relative z-10" />
                <span className="text-sm relative z-10">Humanizing {progress}%</span>
            </button>
        );
    }

    if (isDone) {
        return (
            <button
                disabled
                className="h-9 px-4 min-w-[150px] flex items-center justify-center gap-2 bg-emerald-500/10 border border-emerald-500/50 text-emerald-400 font-medium rounded-lg"
            >
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">Humanized ✓</span>
            </button>
        );
    }

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className="h-9 px-4 min-w-[150px] flex items-center justify-center gap-2 bg-transparent hover:bg-violet-500/10 border border-violet-500/50 text-violet-400 font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
            title="Rewrite paper to sound authentically human-written"
        >
            <Sparkles className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span className="text-sm">Humanize</span>
        </button>
    );
};
