
import React from 'react';
import { X, ExternalLink, AlertTriangle, CheckCircle, AlertOctagon } from 'lucide-react';

interface PlagiarismResult {
    similarity_score: number;
    checked_sentences: number;
    matches_found: number;
    matched_sources: Array<{
        url: string;
        title: string;
        matched_text: string;
    }>;
    status: 'low' | 'medium' | 'high';
}

interface PlagiarismReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    result: PlagiarismResult | null;
}

export const PlagiarismReportModal: React.FC<PlagiarismReportModalProps> = ({ isOpen, onClose, result }) => {
    if (!isOpen || !result) return null;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'low': return 'text-emerald-500 border-emerald-500/50 bg-emerald-500/10';
            case 'medium': return 'text-yellow-500 border-yellow-500/50 bg-yellow-500/10';
            case 'high': return 'text-red-500 border-red-500/50 bg-red-500/10';
            default: return 'text-gray-500 border-gray-500/50';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'low': return <CheckCircle className="w-8 h-8 text-emerald-500" />;
            case 'medium': return <AlertTriangle className="w-8 h-8 text-yellow-500" />;
            case 'high': return <AlertOctagon className="w-8 h-8 text-red-500" />;
            default: return null;
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Slide-over Panel */}
            <div className="relative w-full max-w-md h-full bg-[#121212] border-l border-white/10 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">

                {/* Header */}
                <div className="h-16 flex items-center justify-between px-6 border-b border-white/5 bg-black/20">
                    <h2 className="text-lg font-semibold text-white">Plagiarism Report</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/5 rounded-full text-white/50 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">

                    {/* Score Card */}
                    <div className={`p-6 rounded-xl border flex flex-col items-center gap-4 ${getStatusColor(result.status)}`}>
                        {getStatusIcon(result.status)}
                        <div className="text-center">
                            <div className="text-5xl font-bold tracking-tight">{result.similarity_score}%</div>
                            <div className="text-sm font-medium opacity-80 mt-1 uppercase tracking-wider">Similarity Score</div>
                        </div>
                        <div className="w-full h-px bg-current opacity-20" />
                        <div className="text-xs opacity-75 text-center px-4">
                            {result.status === 'low' && "This document appears to be original with very low similarity to online sources."}
                            {result.status === 'medium' && "Some sections show similarity to online sources. Review suggested."}
                            {result.status === 'high' && "High level of similarity detected. Significant revision recommended."}
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 p-4 rounded-lg border border-white/5">
                            <div className="text-2xl font-bold text-white">{result.checked_sentences}</div>
                            <div className="text-xs text-white/50 uppercase tracking-wider mt-1">Sentences Scanned</div>
                        </div>
                        <div className="bg-white/5 p-4 rounded-lg border border-white/5">
                            <div className="text-2xl font-bold text-white">{result.matches_found}</div>
                            <div className="text-xs text-white/50 uppercase tracking-wider mt-1">Matches Found</div>
                        </div>
                    </div>

                    {/* Matches List */}
                    <div>
                        <h3 className="text-sm font-medium text-white/70 mb-4 flex items-center gap-2">
                            Matched Sources
                            <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full text-white/50">{result.matched_sources.length}</span>
                        </h3>

                        <div className="space-y-4">
                            {result.matched_sources.length > 0 ? (
                                result.matched_sources.map((source, idx) => (
                                    <div key={idx} className="bg-black/40 border border-white/5 rounded-lg p-4 hover:border-white/10 transition-colors group">
                                        <div className="flex items-start justify-between gap-4 mb-2">
                                            <h4 className="text-sm font-medium text-amber-400 line-clamp-1" title={source.title}>{source.title || 'Unknown Source'}</h4>
                                            <a
                                                href={source.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-white/30 hover:text-white transition-colors"
                                            >
                                                <ExternalLink className="w-3.5 h-3.5" />
                                            </a>
                                        </div>
                                        <div className="text-xs text-white/40 font-mono break-all mb-3 truncate">{source.url}</div>
                                        <div className="bg-amber-500/5 border border-amber-500/10 rounded p-2">
                                            <p className="text-xs text-white/70 italic line-clamp-3">"{source.matched_text}"</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-white/20 border-2 border-dashed border-white/5 rounded-lg">
                                    No matches found.
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};
