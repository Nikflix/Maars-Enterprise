"use client";

import { useState, useEffect } from "react";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Loader2 } from "lucide-react";

// Components
import { Header } from "../components/layout/Header";
import { LandingHero } from "../components/features/LandingHero";
import { AuthForm } from "../components/features/AuthForm";
import { Dashboard } from "../components/features/Dashboard";
import { PaperLibrary } from "../components/features/PaperLibrary";
import { ResearchPlanner } from "../components/features/ResearchPlanner";
import { ResearchEditor } from "../components/features/ResearchEditor";

import { supabase } from "../lib/supabase";

// Configuration
const BACKEND_URL = "http://localhost:8001";

// Types
interface Profile {
    id: string;
    first_name: string;
    last_name: string;
    profession: string;
    email: string;
}

interface Paper {
    id: string;
    user_id: string;
    title: string;
    content: string;
    created_at: string;
    author?: string; // For community papers
}

interface Section {
    name: string;
    description: string;
    key_points: string[];
}

interface Outline {
    title: string;
    sections: Section[];
}

interface Message {
    role: "user" | "assistant";
    content: string;
}

export default function Home() {
    // ============================================================================
    // State
    // ============================================================================
    const [user, setUser] = useState<Profile | null>(null);
    const [loadingAuth, setLoadingAuth] = useState(true);
    const [appState, setAppState] = useState<"landing" | "auth" | "dashboard" | "planning" | "writing" | "library">("landing");

    // Research State
    const [topic, setTopic] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [suggestedTopics, setSuggestedTopics] = useState<any[]>([]);
    const [planningStep, setPlanningStep] = useState<"topic" | "plan">("topic");
    const [isLoading, setIsLoading] = useState(false);
    const [outline, setOutline] = useState<Outline | null>(null);

    // Writing State
    const [paperContent, setPaperContent] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [currentSection, setCurrentSection] = useState("");
    const [progress, setProgress] = useState(0);

    // Library State
    const [myPapers, setMyPapers] = useState<Paper[]>([]);
    const [communityPapers, setCommunityPapers] = useState<Paper[]>([]);

    // ============================================================================
    // Effects
    // ============================================================================
    useEffect(() => {
        checkUser();
    }, []);

    useEffect(() => {
        if (user) {
            fetchPapers();
            if (appState === 'landing') setAppState('dashboard');
        } else {
            setAppState('landing');
        }
    }, [user]);

    // ============================================================================
    // Auth Logic
    // ============================================================================
    const checkUser = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("id", session.user.id)
                    .single();
                if (profile) setUser({ ...profile, email: session.user.email });
            }
        } catch (error) {
            console.error("Auth check failed:", error);
        } finally {
            setLoadingAuth(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setAppState('landing');
        setMessages([]);
        setTopic("");
        setOutline(null);
        setPaperContent("");
    };

    // ============================================================================
    // Data Fetching
    // ============================================================================
    const fetchPapers = async () => {
        if (!user) return;

        try {
            const response = await fetch(`${BACKEND_URL}/papers`);
            if (!response.ok) throw new Error("Failed to fetch papers");
            const allPapers: Paper[] = await response.json();

            // My Papers: Filter by user_id and exclude public papers to avoid duplication
            setMyPapers(allPapers.filter(p => p.user_id === user.id && !(p as any).is_public));

            // Community Papers: Filter by is_public flag
            setCommunityPapers(allPapers.filter(p => (p as any).is_public));
        } catch (error) {
            console.error("Fetch papers failed:", error);
        }
    };

    // ============================================================================
    // Research Logic
    // ============================================================================
    const handleSendMessage = async (content: string) => {
        const newMessages = [...messages, { role: "user", content } as Message];
        setMessages(newMessages);
        setIsLoading(true);

        try {
            if (planningStep === "topic") {
                // Topic Selection / Refinement
                const response = await fetch(`${BACKEND_URL}/refine-topic`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        profession: user?.profession || "Researcher",
                        topic_input: content,
                        current_topic: topic
                    }),
                });
                const data = await response.json();

                setMessages([...newMessages, { role: "assistant", content: data.message }]);
                if (data.refined_topic) {
                    setTopic(data.refined_topic);
                    setPlanningStep("plan");
                    generatePlan(data.refined_topic);
                }
            } else {
                // Plan Refinement
                const response = await fetch(`${BACKEND_URL}/refine-plan`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        current_plan: outline,
                        feedback: content
                    }),
                });
                const data = await response.json();
                setOutline(data.updated_plan);
                setMessages([...newMessages, { role: "assistant", content: "I've updated the plan based on your feedback. Please review the changes on the right." }]);
            }
        } catch (error) {
            console.error("Error in chat:", error);
            setMessages([...newMessages, { role: "assistant", content: "Sorry, I encountered an error. Please try again." }]);
        } finally {
            setIsLoading(false);
        }
    };

    const generatePlan = async (currentTopic: string) => {
        setIsLoading(true);
        try {
            const response = await fetch(`${BACKEND_URL}/plan`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    topic: currentTopic,
                    profession: user?.profession || "Researcher"
                }),
            });
            const data = await response.json();
            setOutline(data.outline);
            setMessages(prev => [...prev, { role: "assistant", content: `I've generated a research plan for "**${currentTopic}**". You can review it on the right.` }]);
        } catch (error) {
            console.error("Plan generation failed:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const startWriting = async () => {
        if (!outline) return;
        setAppState("writing");
        setIsGenerating(true);
        setPaperContent(`# ${outline.title}\n\n`); // Initialize with title

        try {
            for (let i = 0; i < outline.sections.length; i++) {
                const section = outline.sections[i];
                setCurrentSection(section.name);
                setProgress(((i + 1) / outline.sections.length) * 100);

                const response = await fetch(`${BACKEND_URL}/write-section`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        section: section,
                        topic: topic,
                        context: outline // Pass full outline for context
                    }),
                });

                if (!response.body) throw new Error("No response body");
                const reader = response.body.getReader();
                const decoder = new TextDecoder();

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    const chunk = decoder.decode(value);
                    setPaperContent(prev => prev + chunk);
                }

                setPaperContent(prev => prev + "\n\n"); // Add spacing between sections
            }
        } catch (error) {
            console.error("Writing failed:", error);
        } finally {
            setIsGenerating(false);
            setCurrentSection("");
            setProgress(100);
        }
    };

    // ============================================================================
    // Paper Actions
    // ============================================================================
    const handleDownload = async (format: "pdf" | "docx") => {
        try {
            const response = await fetch(`${BACKEND_URL}/download`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: outline?.title || "Research Paper",
                    content: paperContent,
                    format
                }),
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.detail || `Server error ${response.status}`);
            }

            const data = await response.json();
            if (!data.data) throw new Error("No data received");

            const byteCharacters = atob(data.data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${outline?.title || "paper"}.${format}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error: any) {
            alert(`Failed to download: ${error.message}`);
        }
    };

    const handleSavePaper = async () => {
        if (!user || !outline) return;
        try {
            const response = await fetch(`${BACKEND_URL}/papers`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: outline.title,
                    content: paperContent,
                    user_id: user.id,
                    is_public: false,
                    author: `${user.first_name} ${user.last_name}`
                }),
            });

            if (!response.ok) throw new Error("Failed to save");
            fetchPapers(); // Refresh library
        } catch (error) {
            console.error("Save failed:", error);
            // Error handling could be improved here too, but focusing on success path
        }
    };

    const handlePublishPaper = async (paper: Paper | any) => {
        if (!user) return;
        try {
            // Publishing creates a copy in the shared library marked as public
            const response = await fetch(`${BACKEND_URL}/papers`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: paper.title,
                    content: paper.content,
                    user_id: user.id,
                    is_public: true,
                    author: `${user.first_name} ${user.last_name}`
                }),
            });

            if (!response.ok) throw new Error("Failed to publish");
            fetchPapers();
        } catch (error) {
            console.error("Publish failed:", error);
        }
    };

    const handleUnpublishPaper = async (paperId: string) => {
        // Since we are using a single list, unpublishing currently means deleting? 
        // OR we need an endpoint to update. 
        // For MVP, if "Publish" created a new copy, then "Unpublish" should delete that copy.
        // But we don't know the ID of the published copy easily unless we track it.
        // For now, let's just make Delete work.
        // If the user wants to unpublish, they can delete the public paper from the library view if they see it.
        alert("Unpublish not yet fully supported in this version. You can delete the paper.");
    };

    const handleDeletePaper = async (id: string) => {
        if (!confirm("Are you sure you want to delete this paper?")) return;
        try {
            const response = await fetch(`${BACKEND_URL}/papers/${id}`, {
                method: "DELETE",
            });
            if (!response.ok) throw new Error("Failed to delete");
            fetchPapers();
        } catch (error) {
            console.error("Delete failed:", error);
        }
    };

    // ============================================================================
    // Logic for Suggestions
    // ============================================================================
    useEffect(() => {
        if (appState === "planning" && planningStep === "topic" && user && suggestedTopics.length === 0) {
            const mockSuggestions = [
                { title: `AI in ${user.profession}`, description: `Impact of artificial intelligence on ${user.profession} workflows.` },
                { title: `Future of ${user.profession}`, description: `Trends and predictions for the next decade in ${user.profession}.` },
                { title: `Sustainable ${user.profession}`, description: `Environmental considerations in modern ${user.profession} practices.` }
            ];
            setSuggestedTopics(mockSuggestions);
            setMessages([{ role: "assistant", content: `Hello ${user.first_name}! I'm ready to help you research. Based on your profession (**${user.profession}**), I've suggested some topics above, or you can propose your own.` }]);
        }
    }, [appState, planningStep, user]);


    // ============================================================================
    // Render
    // ============================================================================
    if (loadingAuth) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-8 h-8 animate-spin text-accent-primary" />
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-background text-foreground transition-colors duration-300">
            {appState !== 'landing' && (
                <Header
                    user={user}
                    onLogin={() => setAppState('auth')}
                    onLogout={handleLogout}
                    onNavigate={(view) => setAppState(view as any)}
                    currentView={appState}
                />
            )}

            {appState === 'landing' && (
                <LandingHero onGetStarted={() => user ? setAppState('dashboard') : setAppState('auth')} />
            )}

            {appState === 'auth' && (
                <AuthForm
                    onLoginSuccess={(profile) => {
                        setUser(profile);
                        setAppState('dashboard');
                    }}
                    onCancel={() => setAppState('landing')}
                />
            )}

            {appState === 'dashboard' && user && (
                <Dashboard
                    user={user}
                    onNewResearch={() => {
                        setAppState('planning');
                        setPlanningStep('topic');
                        setTopic("");
                        setMessages([]);
                        setOutline(null);
                        setPaperContent("");
                        setSuggestedTopics([]);
                    }}
                    onViewLibrary={() => setAppState('library')}
                    recentPapers={myPapers}
                />
            )}

            {appState === 'planning' && user && (
                <ResearchPlanner
                    profession={user.profession}
                    topic={topic}
                    setTopic={setTopic}
                    messages={messages}
                    onSendMessage={handleSendMessage}
                    planningStep={planningStep}
                    suggestedTopics={suggestedTopics}
                    isLoading={isLoading}
                    onApprovePlan={startWriting}
                    outline={outline}
                    setOutline={setOutline}
                    onBack={() => setAppState('dashboard')}
                />
            )}

            {appState === 'writing' && user && (
                <ResearchEditor
                    paperContent={paperContent}
                    onDownload={handleDownload}
                    isGenerating={isGenerating}
                    progress={progress}
                    currentSection={currentSection}
                    onBack={() => setAppState('dashboard')}
                    onSave={handleSavePaper}
                    onPublish={() => {
                        // Create a temporary paper object to reuse the existing publish logic
                        if (!outline) return;
                        handlePublishPaper({
                            id: "draft", // ID not needed for new publish
                            user_id: user.id,
                            title: outline.title,
                            content: paperContent,
                            created_at: new Date().toISOString()
                        });
                    }}
                />
            )}

            {appState === 'library' && user && (
                <PaperLibrary
                    myPapers={myPapers}
                    communityPapers={communityPapers}
                    onViewPaper={(paper) => {
                        setAppState('writing');
                        setPaperContent(paper.content);
                        setOutline({ title: paper.title, sections: [] }); // Mock outline
                    }}
                    onDeletePaper={handleDeletePaper}
                    onPublishPaper={handlePublishPaper}
                    onUnpublishPaper={handleUnpublishPaper}
                    onBack={() => setAppState('dashboard')}
                />
            )}
        </main>
    );
}
