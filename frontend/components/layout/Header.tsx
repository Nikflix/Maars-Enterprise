import React from 'react';
import { Button } from '../ui/Button';
import { User, BookOpen, LogOut } from 'lucide-react';

interface HeaderProps {
    user: any;
    onLogin: () => void;
    onLogout: () => void;
    onNavigate: (view: string) => void;
    currentView: string;
}

export const Header = ({ user, onLogin, onLogout, onNavigate, currentView }: HeaderProps) => {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/5">
            <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
                {/* Logo & Brand */}
                <div
                    className="flex items-center gap-3 cursor-pointer group"
                    onClick={() => onNavigate('dashboard')}
                >
                    <div className="w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center font-bold text-lg shadow-[0_0_15px_rgba(255,255,255,0.3)] group-hover:shadow-[0_0_20px_rgba(255,255,255,0.5)] transition-all duration-300">
                        M
                    </div>
                    <span className="font-semibold text-lg tracking-tight text-white group-hover:text-white/90 transition-colors">
                        MAARS <span className="font-normal text-white/50">Enterprise</span>
                    </span>
                </div>

                {/* Navigation (Centered) */}
                {user && (
                    <nav className="absolute left-1/2 top-1/2 -translate-x-1/2 hidden md:flex items-center gap-1">
                        <NavButton
                            label="Dashboard"
                            active={currentView === 'dashboard'}
                            onClick={() => onNavigate('dashboard')}
                        />
                        <NavButton
                            label="Library"
                            active={currentView === 'library'}
                            onClick={() => onNavigate('library')}
                        />
                    </nav>
                )}

                {/* User Profile / Actions */}
                <div className="flex items-center gap-4">
                    {user ? (
                        <div className="flex items-center gap-4">
                            <div className="hidden sm:flex flex-col items-end">
                                <span className="text-sm font-medium text-white leading-none mb-1">
                                    {user.first_name} {user.last_name[0]}
                                </span>
                                <span className="text-[10px] text-white/40 uppercase tracking-wider">
                                    {user.profession}
                                </span>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onLogout}
                                className="text-white/40 hover:text-white hover:bg-white/5"
                            >
                                <LogOut className="w-4 h-4" />
                            </Button>
                        </div>
                    ) : (
                        <Button
                            className="bg-accent-primary hover:bg-accent-primary/90 text-white shadow-[0_0_15px_rgba(139,92,246,0.5)] border-none"
                            size="sm"
                            onClick={onLogin}
                        >
                            Sign In
                        </Button>
                    )}
                </div>
            </div>
        </header>
    );
};

const NavButton = ({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) => (
    <button
        onClick={onClick}
        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200
            ${active
                ? 'bg-white/10 text-white'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
    >
        {label}
    </button>
);

