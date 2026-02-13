import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { FileText, Globe, Lock, Trash2, Eye, Share2, Upload, Calendar, Search, Filter } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface PaperLibraryProps {
    myPapers: any[];
    communityPapers: any[];
    onViewPaper: (paper: any) => void;
    onDeletePaper: (id: string) => void;
    onPublishPaper: (paper: any) => void;
    onUnpublishPaper: (id: string) => void;
    onBack: () => void;
}

export const PaperLibrary = ({
    myPapers,
    communityPapers,
    onViewPaper,
    onDeletePaper,
    onPublishPaper,
    onUnpublishPaper,
    onBack
}: PaperLibraryProps) => {
    const [activeTab, setActiveTab] = useState<'my' | 'community'>('my');
    const currentPapers = activeTab === 'my' ? myPapers : communityPapers;

    const isPublished = (paper: any) => {
        return communityPapers.find(p => p.title === paper.title && p.author === paper.author);
    };

    return (
        <div className="min-h-screen pt-24 px-6 pb-12 animate-fade-in">
            <div className="max-w-[1400px] mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold mb-2 text-white">Research Library</h1>
                        <p className="text-white/60">Manage your papers and explore community research.</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex bg-white/5 p-1 rounded-lg border border-white/5">
                            <button
                                onClick={() => setActiveTab('my')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'my'
                                    ? 'bg-white/10 text-white shadow-sm'
                                    : 'text-white/40 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <Lock className="w-3.5 h-3.5" />
                                My Papers <span className="ml-1 opacity-50 text-xs">({myPapers.length})</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('community')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'community'
                                    ? 'bg-white/10 text-white shadow-sm'
                                    : 'text-white/40 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <Globe className="w-3.5 h-3.5" />
                                Community <span className="ml-1 opacity-50 text-xs">({communityPapers.length})</span>
                            </button>
                        </div>
                    </div>
                </div>

                {currentPapers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 rounded-2xl bg-white/5 border border-white/5 text-center px-4 animate-fade-in delay-100">
                        <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-6">
                            <FileText className="w-8 h-8 text-white/20" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2 text-white">
                            {activeTab === 'my' ? "No papers yet" : "No community papers"}
                        </h3>
                        <p className="text-white/40 mb-8 max-w-md">
                            {activeTab === 'my'
                                ? "Start a new research project to generate comprehensive academic papers."
                                : "Be the first to publish your findings to the community."}
                        </p>
                        {activeTab === 'my' && (
                            <Button
                                onClick={onBack}
                                className="bg-white text-black hover:bg-white/90"
                            >
                                Start Researching
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in delay-100">
                        {currentPapers.map((paper, index) => {
                            const published = activeTab === 'my' && isPublished(paper);

                            return (
                                <div
                                    key={paper.id || index}
                                    className="group relative p-6 rounded-2xl bg-[#0F0F0F] border border-white/5 hover:border-white/10 transition-all duration-300 flex flex-col h-full hover:shadow-[0_0_30px_rgba(0,0,0,0.3)]"
                                >
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-white/60 group-hover:text-white group-hover:bg-white/10 transition-colors">
                                            <FileText className="w-5 h-5" />
                                        </div>
                                        <div className="flex flex-col items-end">
                                            {activeTab === 'my' && published && (
                                                <span className="mb-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-medium border border-emerald-500/20">
                                                    <Globe className="w-3 h-3" /> Published
                                                </span>
                                            )}
                                            <span className="text-xs text-white/30">
                                                {paper.author || 'Unknown Author'}
                                            </span>
                                        </div>
                                    </div>

                                    <h3 className="text-lg font-semibold mb-3 text-white group-hover:text-accent-primary transition-colors line-clamp-2">
                                        {paper.title}
                                    </h3>

                                    <div className="flex-1 text-sm text-white/50 mb-6 line-clamp-3 prose prose-invert prose-sm">
                                        <ReactMarkdown allowedElements={['p', 'text']}>
                                            {paper.content.substring(0, 180)}
                                        </ReactMarkdown>
                                    </div>

                                    <div className="pt-4 border-t border-white/5 flex items-center justify-between mt-auto">
                                        <span className="text-xs text-white/30 flex items-center gap-1.5">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {new Date(paper.created_at).toLocaleDateString()}
                                        </span>

                                        <div className="flex gap-1 -mr-2">
                                            {/* Actions fade in on hover */}
                                            <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
                                                {activeTab === 'my' && (
                                                    published ? (
                                                        <Button variant="ghost" size="sm" onClick={() => onUnpublishPaper(paper.id)} title="Unpublish" className="h-8 w-8 p-0 text-emerald-400 hover:bg-emerald-400/10 hover:text-emerald-300">
                                                            <Share2 className="w-4 h-4" />
                                                        </Button>
                                                    ) : (
                                                        <Button variant="ghost" size="sm" onClick={() => onPublishPaper(paper)} title="Publish" className="h-8 w-8 p-0 text-white/40 hover:bg-white/10 hover:text-white">
                                                            <Upload className="w-4 h-4" />
                                                        </Button>
                                                    )
                                                )}

                                                {activeTab === 'my' && (
                                                    <Button variant="ghost" size="sm" onClick={() => onDeletePaper(paper.id)} title="Delete" className="h-8 w-8 p-0 text-white/40 hover:bg-red-500/10 hover:text-red-400">
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                )}
                                            </div>

                                            <Button variant="ghost" size="sm" onClick={() => onViewPaper(paper)} title="Read" className="h-8 w-8 p-0 text-white/60 hover:bg-white/10 hover:text-white ml-1">
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};
