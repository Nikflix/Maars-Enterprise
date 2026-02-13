import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { Send, Sparkles, Youtube, Globe, BookOpen, Layers, CheckCircle2, ChevronRight, Edit3, X, GripVertical, FileText, ArrowRight, ArrowLeft, Calendar, Trash2 } from 'lucide-react';
import { Slider } from '../ui/Slider';
import ReactMarkdown from 'react-markdown';

interface ResearchPlannerProps {
    profession: string;
    topic: string;
    setTopic: (topic: string) => void;
    messages: any[];
    onSendMessage: (content: string) => void;
    planningStep: 'topic' | 'plan';
    suggestedTopics: any[];
    isLoading: boolean;
    onApprovePlan: () => void;
    outline: any;
    setOutline: (outline: any) => void;
    onBack: () => void;
}

export const ResearchPlanner = ({
    profession,
    topic,
    setTopic,
    messages,
    onSendMessage,
    planningStep,
    suggestedTopics,
    isLoading,
    onApprovePlan,
    outline,
    setOutline,
    onBack
}: ResearchPlannerProps) => {
    const [input, setInput] = useState('');
    const chatEndRef = useRef<HTMLDivElement>(null);
    const [showOutlineEditor, setShowOutlineEditor] = useState(false);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;
        onSendMessage(input);
        setInput('');
    };

    return (
        <div className="h-screen pt-16 flex overflow-hidden bg-black text-white">
            <div className="flex w-full h-full">

                {/* Left Panel: Chat / Interactions */}
                <div className={`flex-1 flex flex-col h-full border-r border-white/5 relative transition-all duration-300 ${outline ? 'w-1/2' : 'w-full max-w-4xl mx-auto border-none'}`}>

                    {/* Header */}
                    <div className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-black/50 backdrop-blur-sm sticky top-0 z-10">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={onBack}
                                className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors group"
                            >
                                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                                Back
                            </button>
                            <div className="h-4 w-px bg-white/10" />
                            <div className="flex items-center gap-2 text-sm font-semibold text-white">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                Research Agent
                            </div>
                        </div>
                        <div className="text-[10px] font-mono uppercase tracking-wider text-accent-primary bg-accent-primary/10 px-2 py-1 rounded">
                            {planningStep === 'topic' ? 'Phase 1: Discovery' : 'Phase 2: Planning'}
                        </div>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
                        {/* Welcome Message / Suggestions */}
                        {planningStep === 'topic' && suggestedTopics.length > 0 && messages.length === 1 && (
                            <div className="space-y-6 animate-fade-in">
                                <div className="flex gap-4">
                                    <div className="w-8 h-8 rounded-lg bg-accent-primary flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                                        <Sparkles className="w-4 h-4 text-white" />
                                    </div>
                                    <div className="space-y-4 max-w-[85%]">
                                        <div className="p-4 rounded-2xl rounded-tl-none bg-[#121212] border border-white/5 text-white/80 leading-relaxed text-sm">
                                            <p className="mb-4">Hello! Based on your profession as a <span className="text-white font-medium">{profession}</span>, I've identified some high-impact research directions. Select one to proceed or propose your own topic.</p>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            {suggestedTopics.map((t, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => setTopic(t.title)}
                                                    className={`px-4 py-2 rounded-full text-sm border transition-all duration-200
                                                        ${topic === t.title
                                                            ? 'bg-accent-primary text-white border-accent-primary shadow-[0_0_15px_rgba(139,92,246,0.3)]'
                                                            : 'bg-white/5 border-white/5 text-white/60 hover:text-white hover:bg-white/10 hover:border-white/20'
                                                        }`}
                                                >
                                                    {t.title}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Message History */}
                        {messages.map((m, i) => (
                            <div key={i} className={`flex gap-4 animate-fade-in ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-lg
                                    ${m.role === 'user'
                                        ? 'bg-white text-black'
                                        : 'bg-accent-primary text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]'}`}
                                >
                                    {m.role === 'user' ? <UserIcon /> : <Sparkles className="w-4 h-4" />}
                                </div>
                                <div className={`p-4 rounded-2xl max-w-[80%] text-sm leading-relaxed border
                                    ${m.role === 'user'
                                        ? 'bg-white/10 border-white/5 text-white rounded-tr-none'
                                        : 'bg-[#121212] border-white/5 text-white/80 rounded-tl-none'}`}
                                >
                                    <ReactMarkdown>{m.content}</ReactMarkdown>
                                </div>
                            </div>
                        ))}

                        {/* Loading Indicator */}
                        {isLoading && (
                            <div className="flex gap-4 animate-fade-in">
                                <div className="w-8 h-8 rounded-lg bg-accent-primary flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                                    <Sparkles className="w-4 h-4 text-white" />
                                </div>
                                <div className="flex items-center gap-2 p-4 rounded-2xl rounded-tl-none bg-[#121212] border border-white/5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <div className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <div className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-black border-t border-white/5">
                        <form onSubmit={handleSubmit} className="relative max-w-4xl mx-auto">
                            <Input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder={planningStep === 'topic' ? "Select a topic or type your own..." : "Refine the plan or ask for changes..."}
                                className="w-full pl-4 pr-32 py-4 bg-[#121212] border-white/5 rounded-xl focus:bg-[#1A1A1A] focus:border-accent-primary/50 text-white placeholder:text-white/20 shadow-inner"
                                disabled={isLoading}
                                autoFocus
                            />
                            <div className="absolute right-2 top-2 bottom-2 flex items-center gap-2">
                                {topic && planningStep === 'topic' && !isLoading && (
                                    <Button
                                        type="button"
                                        size="sm"
                                        onClick={() => onSendMessage(topic)}
                                        className="h-full bg-accent-primary hover:bg-accent-primary/90 text-white border-none rounded-lg px-3"
                                    >
                                        Start <ArrowRight className="w-3 h-3 ml-1" />
                                    </Button>
                                )}
                                <Button
                                    type="submit"
                                    size="sm"
                                    disabled={!input.trim() || isLoading}
                                    className="h-full w-10 p-0 rounded-lg bg-accent-primary text-white hover:bg-accent-primary/90 disabled:opacity-50 transition-all shadow-[0_0_10px_rgba(139,92,246,0.3)]"
                                >
                                    <Send className="w-4 h-4" />
                                </Button>
                            </div>
                        </form>
                        <div className="text-center mt-2">
                            <span className="text-[10px] text-white/20">AI can make mistakes. Verify important information.</span>
                        </div>
                    </div>
                </div>

                {/* Right Panel: Outline / Plan Preview */}
                {outline && (
                    <div className="w-[45%] flex flex-col h-full bg-[#0A0A0A] border-l border-white/5 animate-slide-up">
                        {!showOutlineEditor ? (
                            <>
                                <div className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-black/20">
                                    <div className="flex items-center gap-2 text-sm font-semibold text-white/80">
                                        <FileText className="w-4 h-4 text-accent-secondary" />
                                        Research Plan Draft
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="ghost" size="sm" onClick={() => setShowOutlineEditor(true)} className="h-8 text-xs text-white/40 hover:text-white hover:bg-white/5">
                                            <Edit3 className="w-3 h-3 mr-1" /> Edit
                                        </Button>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                                    <div className="max-w-xl mx-auto space-y-8">
                                        <div>
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                <span className="text-[10px] font-mono uppercase bg-blue-500/10 text-blue-400 px-2 py-1 rounded border border-blue-500/20">Computer Science</span>
                                                <span className="text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded border border-emerald-500/20">Review Paper</span>
                                            </div>
                                            <h2 className="text-3xl font-bold text-white mb-2 leading-tight">{outline.title}</h2>
                                            <div className="flex items-center gap-4 text-xs text-white/30">
                                                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Last updated: Just now</span>
                                                <span className="w-1 h-1 rounded-full bg-white/10" />
                                                <span>Est. 4 weeks</span>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="p-6 rounded-xl bg-white/5 border border-white/5">
                                                <span className="text-[10px] font-mono uppercase text-white/30 mb-2 block tracking-wider">Abstract</span>
                                                <p className="text-sm text-white/70 leading-relaxed">
                                                    This paper provides a comprehensive analysis of the current state of {topic.toLowerCase()}. It highlights the transition from theoretical models to practical implementations, discussing major hurdles such as scalability and adoption.
                                                </p>
                                            </div>

                                            <div className="space-y-4">
                                                <span className="text-[10px] font-mono uppercase text-white/30 tracking-wider ml-1">Structure & Outline</span>
                                                {outline.sections?.map((section: any, i: number) => (
                                                    <div key={i} className="group p-4 rounded-xl border border-white/5 bg-[#121212] hover:border-white/10 transition-all flex gap-4">
                                                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-sm font-mono text-white/40 group-hover:text-white group-hover:bg-accent-primary group-hover:shadow-[0_0_15px_rgba(139,92,246,0.3)] transition-all">
                                                            {i + 1}
                                                        </div>
                                                        <div className="flex-1">
                                                            <h4 className="text-sm font-semibold text-white mb-1">{section.name}</h4>
                                                            <p className="text-xs text-white/40 mb-2 line-clamp-2">{section.description}</p>
                                                            {section.word_count && (
                                                                <span className="text-[10px] text-white/20 bg-white/5 px-1.5 py-0.5 rounded">
                                                                    ~{section.word_count} words
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 border-t border-white/5 bg-black/40 backdrop-blur-sm">
                                    <Button
                                        className="w-full bg-accent-primary hover:bg-accent-primary/90 text-white font-medium shadow-[0_4px_20px_rgba(139,92,246,0.3)] hover:shadow-[0_6px_25px_rgba(139,92,246,0.4)] border-none py-6 text-lg transition-all transform hover:-translate-y-0.5"
                                        onClick={onApprovePlan}
                                    >
                                        Approve Plan & Start Writing <ArrowRight className="w-5 h-5 ml-2" />
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <OutlineEditor
                                outline={outline}
                                setOutline={setOutline}
                                onClose={() => setShowOutlineEditor(false)}
                            />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

// Editor Component
const OutlineEditor = ({ outline, setOutline, onClose }: { outline: any, setOutline: (o: any) => void, onClose: () => void }) => {
    const [localOutline, setLocalOutline] = useState(JSON.parse(JSON.stringify(outline)));

    // Calculate total words from sections or default to 2000
    const [totalWords, setTotalWords] = useState(() => {
        const sum = outline.sections.reduce((acc: number, section: any) => acc + (parseInt(section.word_count) || 0), 0);
        return sum > 0 ? sum : 2000;
    });

    const handleSave = () => {
        setOutline(localOutline);
        onClose();
    };

    const updateSection = (index: number, field: string, value: string) => {
        const newSections = [...localOutline.sections];
        newSections[index] = { ...newSections[index], [field]: value };
        setLocalOutline({ ...localOutline, sections: newSections });
    };

    const handleTotalWordChange = (newTotal: number) => {
        setTotalWords(newTotal);

        // Smart Distribution Logic
        const sections = [...localOutline.sections];
        const sectionCount = sections.length;
        if (sectionCount === 0) return;

        // Heuristics
        const abstractWords = Math.min(300, Math.floor(newTotal * 0.07)); // Max 300 or 7%
        let remainingWords = newTotal - abstractWords;

        // Intro & Conclusion ~ 10% each (if they exist)
        const introIndex = sections.findIndex((s: any) => s.name.toLowerCase().includes('introduction'));
        const conclusionIndex = sections.findIndex((s: any) => s.name.toLowerCase().includes('conclusion'));

        let introWords = 0;
        let conclusionWords = 0;

        if (introIndex !== -1) {
            introWords = Math.floor(newTotal * 0.1);
            remainingWords -= introWords;
        }
        if (conclusionIndex !== -1) {
            conclusionWords = Math.floor(newTotal * 0.1);
            remainingWords -= conclusionWords;
        }

        // Distribute remainder to body sections
        const bodySectionIndices = sections.map((s: any, i: number) =>
            (i !== introIndex && i !== conclusionIndex && !s.name.toLowerCase().includes('abstract')) ? i : -1
        ).filter((i: number) => i !== -1);

        const wordsPerBodySection = Math.floor(remainingWords / Math.max(1, bodySectionIndices.length));

        // Apply counts
        sections.forEach((section: any, index: number) => {
            let count = 0;
            if (section.name.toLowerCase().includes('abstract')) {
                count = abstractWords;
            } else if (index === introIndex) {
                count = introWords;
            } else if (index === conclusionIndex) {
                count = conclusionWords;
            } else if (bodySectionIndices.includes(index)) {
                count = wordsPerBodySection;
            }
            // Fallback for any missed sections or if logic missed something
            if (count === 0 && newTotal > 0) count = Math.floor(newTotal / sectionCount);

            sections[index] = { ...section, word_count: count.toString() };
        });

        setLocalOutline({ ...localOutline, sections });
    };

    const addSection = () => {
        setLocalOutline({
            ...localOutline,
            sections: [...localOutline.sections, { name: "New Section", description: "Description", key_points: [] }]
        });
    };

    const removeSection = (index: number) => {
        const newSections = [...localOutline.sections];
        newSections.splice(index, 1);
        setLocalOutline({ ...localOutline, sections: newSections });
    };

    return (
        <div className="flex-1 flex flex-col overflow-hidden bg-[#0A0A0A]">
            <div className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-black/20">
                <h3 className="font-semibold flex items-center gap-2 text-white">
                    <Edit3 className="w-4 h-4 text-accent-secondary" />
                    Edit Plan
                </h3>
                <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
                    <X className="w-5 h-5" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-8">
                <div className="space-y-2">
                    <label className="text-[10px] font-mono uppercase text-accent-primary tracking-wider">Research Title</label>
                    <Input
                        value={localOutline.title}
                        onChange={(e) => setLocalOutline({ ...localOutline, title: e.target.value })}
                        className="bg-[#121212] border-white/5 text-white active:bg-[#1A1A1A] text-lg font-bold px-4 py-3 h-auto"
                    />
                </div>

                {/* Global Word Count Slider */}
                <div className="p-6 rounded-xl bg-white/5 border border-white/5 space-y-4">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-white flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-accent-primary animate-pulse" />
                            Total Word Count
                        </label>
                        <span className="text-xl font-bold font-mono text-accent-primary">{totalWords} words</span>
                    </div>
                    <Slider
                        min={500}
                        max={10000}
                        step={100}
                        value={totalWords}
                        onChange={handleTotalWordChange}
                        className="py-2"
                    />
                    <p className="text-xs text-white/40">
                        Adjusting this slider automagically distributes words across sections based on academic standards (e.g., shorter Abstract, detailed Body).
                    </p>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <label className="text-[10px] font-mono uppercase text-accent-primary tracking-wider">Sections <span className="text-white/30 ml-1 rounded-full bg-white/5 w-5 h-5 inline-flex items-center justify-center">{localOutline.sections.length}</span></label>
                        <Button size="sm" variant="ghost" onClick={addSection} className="h-6 text-xs bg-white/5 text-white/60 hover:text-white hover:bg-white/10">
                            + Add Section
                        </Button>
                    </div>

                    {localOutline.sections.map((section: any, i: number) => (
                        <div key={i} className="p-4 rounded-xl border border-white/5 bg-[#121212] space-y-3 relative group">
                            <div className="absolute left-2 top-2 bottom-2 w-1 rounded-full bg-white/5 group-hover:bg-accent-primary/50 transition-colors" />
                            <div className="pl-4">
                                <div className="flex justify-between items-start mb-2">
                                    <Input
                                        value={section.name}
                                        onChange={(e) => updateSection(i, 'name', e.target.value)}
                                        className="flex-1 bg-transparent border-transparent text-white hover:bg-white/5 focus:bg-white/10 font-semibold px-2 py-1 h-8 text-sm"
                                        placeholder="Section Name"
                                    />
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => removeSection(i)}
                                        className="opacity-40 hover:opacity-100 h-8 w-8 p-0 text-red-500/50 hover:text-red-500 hover:bg-red-500/10 transition-all rounded-full"
                                        title="Delete Section"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                                <div className="flex gap-2">
                                    <textarea
                                        value={section.description}
                                        onChange={(e) => updateSection(i, 'description', e.target.value)}
                                        className="w-full bg-transparent border border-transparent text-white/60 hover:bg-white/5 focus:bg-white/10 rounded-md text-xs p-2 min-h-[60px] resize-none focus:outline-none transition-colors"
                                        placeholder="Section Description"
                                    />
                                    <div className="flex flex-col justify-center items-end min-w-[60px] cursor-not-allowed opacity-50" title="Adjust Total Word Count to change">
                                        <span className="text-[10px] font-mono text-white/40">Target</span>
                                        <span className="text-sm font-mono text-white/60 font-medium">
                                            {section.word_count || 0}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="p-6 border-t border-white/5 bg-black/40 backdrop-blur-sm flex gap-4">
                <Button variant="ghost" onClick={onClose} className="flex-1 hover:bg-white/5 text-white/60 hover:text-white">
                    Cancel
                </Button>
                <Button onClick={handleSave} className="flex-1 bg-accent-primary hover:bg-accent-primary/90 text-white shadow-lg shadow-accent-primary/20">
                    Save Changes
                </Button>
            </div>
        </div>
    );
};

const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
);
