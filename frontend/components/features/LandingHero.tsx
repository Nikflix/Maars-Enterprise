import React, { useEffect, useState } from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { ArrowRight, Sparkles, ShieldCheck, Zap, FileText, Clock, CheckCircle } from 'lucide-react';

interface LandingHeroProps {
    onGetStarted: () => void;
}

export const LandingHero = ({ onGetStarted }: LandingHeroProps) => {
    const [paperCount, setPaperCount] = useState("10K+");

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch('http://localhost:8001/stats');
                if (response.ok) {
                    const data = await response.json();
                    setPaperCount(data.total_papers.toString());
                }
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            }
        };
        fetchStats();
    }, []);

    return (
        <div className="min-h-screen bg-[#050505] text-text-primary font-sans selection:bg-accent-primary/30 relative overflow-hidden flex flex-col">
            {/* Rich Background */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-background to-background pointer-events-none" />

            {/* Navbar */}
            <div className="w-full border-b border-white/5 bg-background/50 backdrop-blur-md sticky top-0 z-50">
                <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <FileText className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-white">ResearchAI</span>
                    </div>

                    {/* Centered Features Link */}
                    <div className="hidden md:flex absolute left-1/2 -translate-x-1/2">
                        <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
                            Features
                        </button>
                    </div>

                    <Button
                        size="sm"
                        onClick={onGetStarted}
                        className="bg-accent-primary hover:bg-accent-primary/90 text-white shadow-[0_0_10px_rgba(139,92,246,0.3)] border-none font-medium transition-all rounded-full px-6"
                    >
                        Get Started
                    </Button>
                </nav>
            </div>

            <main className="flex-grow">
                {/* Hero Section */}
                <div className="relative z-10 pt-20 pb-32 flex flex-col items-center text-center px-4">
                    {/* Enhanced Background Glows */}
                    <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] -z-10 mix-blend-screen" />
                    <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px] -z-10 mix-blend-screen" />



                    {/* Headline */}
                    <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight max-w-4xl animate-fade-in delay-100 leading-tight">
                        Generate <br />
                        <span className="text-zinc-100">Research Papers</span> <br />
                        <span className="text-zinc-400">in Minutes</span>
                    </h1>

                    {/* Subhead */}
                    <p className="text-lg md:text-xl text-zinc-400 mb-10 max-w-2xl mx-auto animate-fade-in delay-200 leading-relaxed">
                        Transform any research topic into a publication-ready IEEE paper with AI.
                        Complete with proper citations, methodology, and academic structure.
                    </p>

                    {/* CTAs */}
                    <div className="flex flex-col sm:flex-row items-center gap-4 mb-24 animate-fade-in delay-300">
                        <Button
                            size="lg"
                            onClick={onGetStarted}
                            className="bg-accent-primary text-white hover:bg-accent-primary/90 shadow-[0_0_20px_rgba(139,92,246,0.5)] px-8 h-12 text-base font-semibold transition-all hover:scale-105 rounded-full border-none"
                        >
                            Start Generating <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full mx-auto mb-12 animate-fade-in delay-300">
                        <StatCard
                            value={paperCount}
                            label="Papers Generated"
                            color="text-white"
                        />
                        <StatCard
                            value="98%"
                            label="IEEE Compliant"
                            color="text-white"
                        />
                        <StatCard
                            value="<2m"
                            label="Avg. Time"
                            color="text-[#FF6B6B]"
                        />
                    </div>
                </div>

                {/* Divider */}
                <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                {/* Features Section */}
                <div id="features" className="py-24 px-6 relative">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-20">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 mb-6 bg-white/5">
                                <Sparkles className="w-3 h-3 text-white" />
                                <span className="text-[10px] font-bold text-white uppercase tracking-widest">Features</span>
                            </div>
                            <h2 className="text-4xl md:text-6xl font-bold mb-6 text-white">
                                Everything You Need
                            </h2>
                            <p className="text-zinc-400 max-w-2xl mx-auto text-lg">
                                Professional-grade research paper generation with all the features researchers need to succeed.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            <FeatureCard
                                icon={<Zap className="w-6 h-6 text-white" />}
                                title="AI-Powered Generation"
                                description="Leverage advanced Gemini 2.5 Pro to generate comprehensive research papers in minutes, not days."
                            />
                            <FeatureCard
                                icon={<FileText className="w-6 h-6 text-white" />}
                                title="IEEE Compliant"
                                description="Every paper follows IEEE formatting standards with proper structure, citations, and academic tone."
                            />
                            <FeatureCard
                                icon={<Clock className="w-6 h-6 text-[#38bdf8]" />}
                                title="Lightning Fast"
                                description="Generate publication-ready papers in under 2 minutes. Save weeks of research and writing time."
                            />
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="w-full py-8 border-t border-white/5 bg-[#050505]">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2 opacity-50">
                        <div className="w-6 h-6 rounded bg-zinc-800 flex items-center justify-center">
                            <FileText className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-sm font-semibold text-white">ResearchAI</span>
                    </div>
                    <div className="text-xs text-zinc-600">
                        © 2024 ResearchAI Inc. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
};

const StatCard = ({ value, label, color }: { value: string, label: string, color: string }) => (
    <div className="p-10 rounded-2xl bg-[#0A0A0A] border border-white/5 flex flex-col items-center justify-center hover:border-white/10 transition-colors">
        <div className={`text-5xl md:text-6xl font-bold mb-3 ${color} tracking-tight`}>
            {value}
        </div>
        <div className="text-sm font-medium text-zinc-500 uppercase tracking-widest">{label}</div>
    </div>
);

const FeatureCard = ({ icon, title, description }: any) => (
    <div className="p-8 rounded-3xl bg-[#0A0A0A] border border-white/5 hover:border-white/10 transition-all duration-300 group">
        <div className="mb-6">
            {icon}
        </div>
        <h3 className="text-xl font-bold mb-3 text-white">{title}</h3>
        <p className="text-zinc-500 leading-relaxed text-sm">{description}</p>
    </div>
);
