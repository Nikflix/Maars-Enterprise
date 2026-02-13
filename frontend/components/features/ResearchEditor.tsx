import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { FileDown, Save, ArrowLeft, MoreHorizontal, CheckCircle, RefreshCcw, Download, Globe, FileText, Share2, Printer } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { usePlagiarism } from '../../hooks/usePlagiarism';
import { PlagiarismButton } from './plagiarism/PlagiarismButton';
import { PlagiarismReportModal } from './plagiarism/PlagiarismReportModal';

interface ResearchEditorProps {
    paperContent: string;
    onDownload: (format: 'pdf' | 'docx') => void;
    isGenerating: boolean;
    progress: number;
    currentSection: string;
    onBack: () => void;
    onSave: () => void;
    onPublish: () => void;
}

export const ResearchEditor = ({
    paperContent,
    onDownload,
    isGenerating,
    progress,
    currentSection,
    onBack,
    onSave,
    onPublish
}: ResearchEditorProps) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom of generated content
    useEffect(() => {
        if (isGenerating && scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [paperContent, isGenerating]);

    // Plagiarism Hook
    const { isScanning, progress: plagiarismProgress, result: plagiarismResult, startScan, resetScan, error: plagiarismError } = usePlagiarism();
    const [isReportOpen, setIsReportOpen] = useState(false);

    useEffect(() => {
        if (plagiarismError) {
            handleAction(`Error: ${plagiarismError}`, () => { });
        }
    }, [plagiarismError]);

    const handlePlagiarismCheck = () => {
        // Use a mock ID or real one if available. for now, random or 'current-paper'
        startScan("current-paper-" + Date.now(), paperContent);
    };

    const [showNotification, setShowNotification] = useState<string | null>(null);

    const handleAction = (action: string, handler: () => void) => {
        handler();
        setShowNotification(action);
        setTimeout(() => setShowNotification(null), 3000);
    };

    return (
        <div className="h-screen pt-16 flex flex-col bg-black text-white overflow-hidden relative">
            {/* Notification Toast */}
            {showNotification && (
                <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-2 rounded-full flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.2)] backdrop-blur-md">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">{showNotification}</span>
                    </div>
                </div>
            )}

            {/* Toolbar */}
            <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-black/50 backdrop-blur-md z-10 sticky top-0">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                        Back
                    </button>
                    <div className="h-4 w-px bg-white/10" />
                    <div className="flex items-center gap-3">
                        {isGenerating ? (
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-accent-primary animate-pulse" />
                                <span className="text-sm font-medium text-white">Generating: <span className="text-white/50">{currentSection}</span></span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                <span className="text-sm font-medium text-white">Research Complete</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAction("Draft saved successfully", onSave)}
                        className="text-white/60 hover:text-white hover:bg-white/5 gap-2 hidden sm:flex"
                    >
                        <Save className="w-4 h-4" /> <span className="hidden sm:inline">Save Draft</span>
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAction("Paper published successfully", onPublish)}
                        className="text-white/60 hover:text-white hover:bg-white/5 gap-2 hidden sm:flex"
                    >
                        <Globe className="w-4 h-4" /> <span className="hidden sm:inline">Publish</span>
                    </Button>

                    {/* Plagiarism Button */}
                    <PlagiarismButton
                        onClick={() => plagiarismResult ? setIsReportOpen(true) : handlePlagiarismCheck()}
                        isScanning={isScanning}
                        progress={plagiarismProgress}
                        result={plagiarismResult ? { ...plagiarismResult, status: plagiarismResult.status } : null}
                        disabled={isGenerating || !paperContent}
                    />

                    <div className="h-4 w-px bg-white/10 mx-2" />

                    <button
                        onClick={() => onDownload('docx')}
                        className="h-9 px-4 min-w-[100px] flex items-center justify-center gap-2 bg-[#2B579A] hover:bg-[#2B579A]/90 text-white font-medium rounded-lg transition-colors text-sm"
                    >
                        <FileText className="w-4 h-4" /> DOCX
                    </button>

                    <button
                        onClick={() => onDownload('pdf')}
                        className="h-9 px-4 min-w-[100px] flex items-center justify-center gap-2 bg-[#E73C3C] hover:bg-[#E73C3C]/90 text-white font-medium rounded-lg transition-colors shadow-[0_0_15px_rgba(231,60,60,0.2)] text-sm"
                    >
                        <Download className="w-4 h-4" /> PDF
                    </button>
                </div>
            </header>

            {/* Progress Bar (during generation) */}
            {isGenerating && (
                <div className="h-0.5 bg-white/5 w-full overflow-hidden">
                    <div
                        className="h-full bg-accent-primary shadow-[0_0_10px_rgba(139,92,246,0.5)] transition-all duration-300 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            )}

            {/* Main Content Area */}
            <div className="flex-1 overflow-hidden relative flex justify-center bg-[#050505] p-0 sm:p-8">
                <div className="w-full h-full overflow-y-auto custom-scrollbar scroll-smooth" ref={scrollRef}>
                    <div className="max-w-4xl mx-auto min-h-full bg-[#121212] border border-white/5 shadow-2xl sm:rounded-xl p-8 sm:p-16 relative">
                        {/* Paper Watermark/Decoration */}
                        <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
                            <FileText className="w-24 h-24 text-white" />
                        </div>

                        <article className="prose prose-invert max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-h1:text-4xl prose-h1:mb-8 prose-p:leading-relaxed prose-p:text-white/70 prose-li:text-white/70">
                            {paperContent ? (
                                <ReactMarkdown>{paperContent}</ReactMarkdown>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-[40vh] text-white/20 space-y-4">
                                    <div className="relative">
                                        <div className="w-16 h-16 rounded-full border-2 border-white/10 animate-[spin_3s_linear_infinite]" />
                                        <div className="w-16 h-16 rounded-full border-2 border-t-accent-primary absolute top-0 left-0 animate-[spin_1s_linear_infinite]" />
                                        <RefreshCcw className="w-6 h-6 text-white/40 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                                    </div>
                                    <p className="text-sm font-mono uppercase tracking-wider animate-pulse">Initializing Research Agent Swarm...</p>
                                </div>
                            )}
                        </article>

                        {/* Footer of the paper */}
                        {!isGenerating && paperContent && (
                            <div className="mt-16 pt-8 border-t border-white/5 text-center text-white/20 text-xs font-mono">
                                Generated by MAARS Enterprise &bull; {new Date().toLocaleDateString()}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Plagiarism Report Modal */}
            <PlagiarismReportModal
                isOpen={isReportOpen}
                onClose={() => setIsReportOpen(false)}
                result={plagiarismResult}
            />
        </div>
    );
};
