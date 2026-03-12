import React from 'react';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';
import { Plus, BookOpen, Clock, FileText } from 'lucide-react';

interface DashboardProps {
    user: any;
    onNewResearch: () => void;
    onViewLibrary: () => void;
    recentPapers: any[];
}

export const Dashboard = ({ user, onNewResearch, onViewLibrary, recentPapers }: DashboardProps) => {
    return (
        <div className="min-h-screen pt-24 px-6 pb-12">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Welcome Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Welcome back, {user.first_name}</h1>
                        <p className="text-muted-foreground">
                            Ready to continue your research on <span className="font-medium text-foreground">{user.profession}</span>?
                        </p>
                    </div>
                </div>

                {/* Actions Grid */}
                <div className="grid md:grid-cols-2 gap-6 animate-fade-in delay-100">
                    <Card
                        className="p-8 cursor-pointer hover:border-accent-primary group relative overflow-hidden"
                        onClick={onNewResearch}
                    >
                        <div className="absolute top-0 right-0 p-32 bg-accent-primary/5 rounded-full blur-3xl group-hover:bg-accent-primary/10 transition-colors" />
                        <div className="relative z-10">
                            <div className="w-12 h-12 rounded-xl bg-accent-primary/10 flex items-center justify-center mb-4 text-accent-primary">
                                <Plus className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">New Research Project</h3>
                            <p className="text-muted-foreground">
                                Start a new paper from scratch. Define a topic, generate an outline, and write with AI assistance.
                            </p>
                        </div>
                    </Card>

                    <Card
                        className="p-8 cursor-pointer hover:border-accent-secondary group relative overflow-hidden"
                        onClick={onViewLibrary}
                    >
                        <div className="absolute top-0 right-0 p-32 bg-accent-secondary/5 rounded-full blur-3xl group-hover:bg-accent-secondary/10 transition-colors" />
                        <div className="relative z-10">
                            <div className="w-12 h-12 rounded-xl bg-accent-secondary/10 flex items-center justify-center mb-4 text-accent-secondary">
                                <BookOpen className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Research Library</h3>
                            <p className="text-muted-foreground">
                                Access your {recentPapers.length} saved papers and explore shared knowledge from the community.
                            </p>
                        </div>
                    </Card>
                </div>

                {/* Recent Activity */}
                <div className="animate-fade-in delay-200">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-muted-foreground" />
                        Recent Activity
                    </h2>

                    {recentPapers.length === 0 ? (
                        <Card className="p-12 text-center border-dashed">
                            <div className="w-16 h-16 rounded-full bg-secondary mx-auto flex items-center justify-center mb-4">
                                <FileText className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <h3 className="font-medium mb-1">No papers yet</h3>
                            <p className="text-sm text-muted-foreground mb-4">Start your first research project to see it here.</p>
                            <Button variant="secondary" size="sm" onClick={onNewResearch}>Create Paper</Button>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {recentPapers.slice(0, 3).map((paper) => (
                                <Card key={paper.id} className="p-4 flex items-center justify-between group hover:border-accent-primary/30">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                                            <FileText className="w-5 h-5 text-muted-foreground group-hover:text-accent-primary transition-colors" />
                                        </div>
                                        <div>
                                            <h4 className="font-medium group-hover:text-accent-primary transition-colors">{paper.title}</h4>
                                            <p className="text-xs text-muted-foreground">
                                                Created {new Date(paper.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={onViewLibrary}>View</Button>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
