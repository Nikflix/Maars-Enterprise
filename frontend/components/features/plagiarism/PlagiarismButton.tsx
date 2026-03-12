
import React from 'react';
import { ShieldCheck, ShieldAlert, Loader2 } from 'lucide-react';

interface PlagiarismButtonProps {
    onClick: () => void;
    isScanning: boolean;
    progress: number;
    result: {
        overall_score?: number;
        similarity_score?: number;
        overall_status?: 'low' | 'medium' | 'high';
        status?: 'low' | 'medium' | 'high';
    } | null;
    disabled?: boolean;
}

export const PlagiarismButton: React.FC<PlagiarismButtonProps> = ({ onClick, isScanning, progress, result, disabled }) => {

    const getBadgeColor = (status: string) => {
        switch (status) {
            case 'low': return 'bg-emerald-500 text-white';
            case 'medium': return 'bg-yellow-500 text-black';
            case 'high': return 'bg-red-500 text-white';
            default: return 'bg-gray-500';
        }
    };

    if (isScanning) {
        return (
            <button
                disabled
                className="h-9 px-4 min-w-[140px] flex items-center justify-center gap-2 bg-amber-500/10 border border-amber-500/50 text-amber-500 font-medium rounded-lg cursor-wait"
            >
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Analyzing {progress}%</span>
            </button>
        );
    }

    if (result) {
        const score = result.overall_score ?? result.similarity_score ?? 0;
        const status = result.overall_status ?? result.status ?? 'low';

        return (
            <button
                onClick={onClick}
                className="h-9 px-3 min-w-[140px] flex items-center justify-between gap-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/50 text-amber-500 font-medium rounded-lg transition-colors group"
                title="View Content Analysis Report"
            >
                <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" />
                    <span className="text-sm">Report</span>
                </div>
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${getBadgeColor(status)}`}>
                    {score}%
                </span>
            </button>
        );
    }

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className="h-9 px-4 min-w-[140px] flex items-center justify-center gap-2 bg-transparent hover:bg-amber-500/10 border border-amber-500/50 text-amber-500 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
            title="Analyze document for AI content, similarity, and paraphrasing"
        >
            <ShieldAlert className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span className="text-sm">Check Plagiarism</span>
        </button>
    );
};
