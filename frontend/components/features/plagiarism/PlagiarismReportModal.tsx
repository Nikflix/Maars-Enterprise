
import React, { useState } from 'react';
import { X, ExternalLink, AlertTriangle, CheckCircle, AlertOctagon, Bot, FileSearch, Repeat, ChevronDown, ChevronRight, Wrench, Loader2 } from 'lucide-react';
import { ContentAnalysisResult } from '../../../hooks/usePlagiarism';

interface PlagiarismReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    result: ContentAnalysisResult | null;
    onFixIssues?: (analysis: string, indicators: string[]) => void;
    isFixing?: boolean;
}

type TabId = 'ai' | 'semantic' | 'paraphrase';

export const PlagiarismReportModal: React.FC<PlagiarismReportModalProps> = ({ isOpen, onClose, result, onFixIssues, isFixing }) => {
    const [activeTab, setActiveTab] = useState<TabId>('ai');

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
            case 'low': return <CheckCircle className="w-6 h-6 text-emerald-500" />;
            case 'medium': return <AlertTriangle className="w-6 h-6 text-yellow-500" />;
            case 'high': return <AlertOctagon className="w-6 h-6 text-red-500" />;
            default: return null;
        }
    };

    const getScoreRingColor = (status: string) => {
        switch (status) {
            case 'low': return '#10b981';
            case 'medium': return '#eab308';
            case 'high': return '#ef4444';
            default: return '#6b7280';
        }
    };

    const tabs: { id: TabId; label: string; icon: React.ReactNode; score: number; status: string }[] = [
        { id: 'ai', label: 'AI Detection', icon: <Bot className="w-4 h-4" />, score: result.ai_detection?.score || 0, status: result.ai_detection?.status || 'low' },
        { id: 'semantic', label: 'Similarity', icon: <FileSearch className="w-4 h-4" />, score: result.semantic_similarity?.score || 0, status: result.semantic_similarity?.status || 'low' },
        { id: 'paraphrase', label: 'Paraphrase', icon: <Repeat className="w-4 h-4" />, score: result.paraphrase_detection?.score || 0, status: result.paraphrase_detection?.status || 'low' },
    ];

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Slide-over Panel */}
            <div className="relative w-full max-w-lg h-full bg-[#0a0a0a] border-l border-white/10 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">

                {/* Header */}
                <div className="h-16 flex items-center justify-between px-6 border-b border-white/5 bg-black/40">
                    <h2 className="text-lg font-semibold text-white">Content Analysis Report</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/5 rounded-full text-white/50 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">

                    {/* Overall Score Card */}
                    <div className="p-6">
                        <div className={`p-5 rounded-xl border flex items-center gap-5 ${getStatusColor(result.overall_status || result.status)}`}>
                            <div className="relative w-20 h-20 flex-shrink-0">
                                <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                                    <circle cx="40" cy="40" r="35" fill="none" stroke="currentColor" strokeWidth="4" opacity={0.15} />
                                    <circle
                                        cx="40" cy="40" r="35" fill="none"
                                        stroke={getScoreRingColor(result.overall_status || result.status)}
                                        strokeWidth="4" strokeLinecap="round"
                                        strokeDasharray={`${(result.overall_score ?? result.similarity_score) * 2.2} 220`}
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-xl font-bold">{result.overall_score ?? result.similarity_score}%</span>
                                </div>
                            </div>
                            <div>
                                <div className="text-sm font-semibold uppercase tracking-wider opacity-80">Overall Score</div>
                                <div className="text-xs opacity-60 mt-1">
                                    {(result.overall_status || result.status) === 'low' && "Content appears mostly original with low flags."}
                                    {(result.overall_status || result.status) === 'medium' && "Some concerns detected. Review the details below."}
                                    {(result.overall_status || result.status) === 'high' && "Significant issues detected. Revision recommended."}
                                </div>
                            </div>
                        </div>

                        {/* Fix Issues Button */}
                        {onFixIssues && result.ai_detection && (result.ai_detection.status === 'medium' || result.ai_detection.status === 'high') && (
                            <button
                                onClick={() => onFixIssues(
                                    result.ai_detection?.reasoning || '',
                                    result.ai_detection?.indicators || []
                                )}
                                disabled={isFixing}
                                className="w-full mt-3 py-3 px-4 bg-accent-primary/10 hover:bg-accent-primary/20 border border-accent-primary/30 text-accent-primary font-medium rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-wait"
                            >
                                {isFixing ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span className="text-sm">Fixing Detected Issues...</span>
                                    </>
                                ) : (
                                    <>
                                        <Wrench className="w-4 h-4" />
                                        <span className="text-sm">Fix Detected Issues</span>
                                    </>
                                )}
                            </button>
                        )}
                    </div>

                    {/* Tabs */}
                    <div className="px-6 flex gap-1 border-b border-white/5">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id
                                    ? 'border-purple-500 text-white'
                                    : 'border-transparent text-white/40 hover:text-white/70'
                                    }`}
                            >
                                {tab.icon}
                                <span className="hidden sm:inline">{tab.label}</span>
                                <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${tab.status === 'low' ? 'bg-emerald-500/20 text-emerald-400' :
                                    tab.status === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                        'bg-red-500/20 text-red-400'
                                    }`}>{tab.score}%</span>
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="p-6 space-y-6">

                        {/* AI Detection Tab */}
                        {activeTab === 'ai' && result.ai_detection && (
                            <>
                                <div className="flex items-start gap-4">
                                    {getStatusIcon(result.ai_detection.status)}
                                    <div>
                                        <h3 className="text-sm font-semibold text-white">AI-Generated Content Detection</h3>
                                        <p className="text-xs text-white/50 mt-1">Analyzes linguistic patterns typical of AI language models</p>
                                    </div>
                                </div>

                                {/* Score bar */}
                                <div>
                                    <div className="flex justify-between text-xs text-white/50 mb-2">
                                        <span>AI Likelihood</span>
                                        <span className="font-semibold text-white">{result.ai_detection.score}%</span>
                                    </div>
                                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-500"
                                            style={{
                                                width: `${result.ai_detection.score}%`,
                                                backgroundColor: getScoreRingColor(result.ai_detection.status),
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Reasoning */}
                                <div className="bg-white/5 border border-white/5 rounded-lg p-4">
                                    <h4 className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">Analysis</h4>
                                    <p className="text-sm text-white/60 leading-relaxed">{result.ai_detection.reasoning}</p>
                                </div>

                                {/* Indicators */}
                                {result.ai_detection.indicators?.length > 0 && (
                                    <div>
                                        <h4 className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-3">Detected Indicators</h4>
                                        <div className="space-y-2">
                                            {result.ai_detection.indicators.map((indicator, idx) => (
                                                <div key={idx} className="flex items-start gap-3 bg-white/5 border border-white/5 rounded-lg px-4 py-3">
                                                    <div className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">
                                                        {idx + 1}
                                                    </div>
                                                    <span className="text-sm text-white/60">{indicator}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        {/* Semantic Similarity Tab */}
                        {activeTab === 'semantic' && result.semantic_similarity && (
                            <>
                                <div className="flex items-start gap-4">
                                    {getStatusIcon(result.semantic_similarity.status)}
                                    <div>
                                        <h3 className="text-sm font-semibold text-white">Semantic Similarity</h3>
                                        <p className="text-xs text-white/50 mt-1">Compares ideas and concepts against existing web content</p>
                                    </div>
                                </div>

                                {/* Score bar */}
                                <div>
                                    <div className="flex justify-between text-xs text-white/50 mb-2">
                                        <span>Conceptual Overlap</span>
                                        <span className="font-semibold text-white">{result.semantic_similarity.score}%</span>
                                    </div>
                                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-500"
                                            style={{
                                                width: `${result.semantic_similarity.score}%`,
                                                backgroundColor: getScoreRingColor(result.semantic_similarity.status),
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Similar Sources */}
                                <div>
                                    <h4 className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-3">
                                        Similar Sources
                                        <span className="ml-2 text-white/30 font-normal">({result.semantic_similarity.similar_sources?.length || 0})</span>
                                    </h4>
                                    <div className="space-y-3">
                                        {result.semantic_similarity.similar_sources?.length > 0 ? (
                                            result.semantic_similarity.similar_sources.map((source, idx) => (
                                                <div key={idx} className="bg-black/40 border border-white/5 rounded-lg p-4 hover:border-white/10 transition-colors">
                                                    <div className="flex items-start justify-between gap-3 mb-2">
                                                        <h4 className="text-sm font-medium text-amber-400 line-clamp-1">{source.title || 'Unknown Source'}</h4>
                                                        <div className="flex items-center gap-2 flex-shrink-0">
                                                            <span className="text-xs font-bold text-white/50 bg-white/5 px-2 py-0.5 rounded">{source.similarity}%</span>
                                                            <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-white/30 hover:text-white">
                                                                <ExternalLink className="w-3.5 h-3.5" />
                                                            </a>
                                                        </div>
                                                    </div>
                                                    <p className="text-xs text-white/40 line-clamp-2">{source.matched_concept}</p>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-8 text-white/20 border-2 border-dashed border-white/5 rounded-lg">
                                                No significantly similar content found.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Paraphrase Detection Tab */}
                        {activeTab === 'paraphrase' && result.paraphrase_detection && (
                            <>
                                <div className="flex items-start gap-4">
                                    {getStatusIcon(result.paraphrase_detection.status)}
                                    <div>
                                        <h3 className="text-sm font-semibold text-white">Paraphrase Detection</h3>
                                        <p className="text-xs text-white/50 mt-1">Identifies text that closely rephrases existing sources</p>
                                    </div>
                                </div>

                                {/* Score bar */}
                                <div>
                                    <div className="flex justify-between text-xs text-white/50 mb-2">
                                        <span>Paraphrase Score</span>
                                        <span className="font-semibold text-white">{result.paraphrase_detection.score}%</span>
                                    </div>
                                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-500"
                                            style={{
                                                width: `${result.paraphrase_detection.score}%`,
                                                backgroundColor: getScoreRingColor(result.paraphrase_detection.status),
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Flagged Passages */}
                                <div>
                                    <h4 className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-3">
                                        Flagged Passages
                                        <span className="ml-2 text-white/30 font-normal">({result.paraphrase_detection.flagged_passages?.length || 0})</span>
                                    </h4>
                                    <div className="space-y-4">
                                        {result.paraphrase_detection.flagged_passages?.length > 0 ? (
                                            result.paraphrase_detection.flagged_passages.map((passage, idx) => (
                                                <div key={idx} className="bg-black/40 border border-white/5 rounded-lg p-4 space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs font-medium text-white/50">Match #{idx + 1}</span>
                                                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${passage.confidence > 80 ? 'bg-red-500/20 text-red-400' :
                                                            passage.confidence > 60 ? 'bg-yellow-500/20 text-yellow-400' :
                                                                'bg-emerald-500/20 text-emerald-400'
                                                            }`}>{passage.confidence}% confident</span>
                                                    </div>
                                                    <div className="bg-red-500/5 border border-red-500/10 rounded p-3">
                                                        <div className="text-xs text-red-400/70 font-semibold mb-1">Your Paper</div>
                                                        <p className="text-xs text-white/60 italic">"{passage.paper_text}"</p>
                                                    </div>
                                                    <div className="bg-amber-500/5 border border-amber-500/10 rounded p-3">
                                                        <div className="text-xs text-amber-400/70 font-semibold mb-1">Source Match</div>
                                                        <p className="text-xs text-white/60 italic">"{passage.source_text}"</p>
                                                    </div>
                                                    {passage.source_url && (
                                                        <a
                                                            href={passage.source_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white/60 transition-colors"
                                                        >
                                                            <ExternalLink className="w-3 h-3" />
                                                            {passage.source_title || passage.source_url}
                                                        </a>
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-8 text-white/20 border-2 border-dashed border-white/5 rounded-lg">
                                                No paraphrased passages detected.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
};
