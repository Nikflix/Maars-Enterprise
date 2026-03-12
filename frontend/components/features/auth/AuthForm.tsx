'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../../utils/supabase/client';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Card } from '../../ui/Card';
import { Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface AuthFormProps {
    variant?: 'page' | 'inline';
    type?: 'login' | 'signup';
    onLoginSuccess?: (user: any) => void;
    onCancel?: () => void;
}

export default function AuthForm({ 
    variant = 'page', 
    type = 'login', 
    onLoginSuccess, 
    onCancel 
}: AuthFormProps) {
    const [mode, setMode] = useState<'login' | 'signup'>(type);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        profession: '',
    });
    
    const router = useRouter();
    const supabase = createClient();

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (mode === 'signup') {
                const { data: authData, error: authError } = await supabase.auth.signUp({
                    email: formData.email,
                    password: formData.password,
                    options: {
                        emailRedirectTo: `${location.origin}/auth/callback`,
                    },
                });
                if (authError) throw authError;

                if (authData.user) {
                    const { error: profileError } = await supabase.from('profiles').insert({
                        id: authData.user.id,
                        first_name: formData.firstName || 'New',
                        last_name: formData.lastName || 'User',
                        profession: formData.profession || 'Researcher',
                    });
                    
                    if (profileError) throw profileError;

                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', authData.user.id)
                        .single();

                    if (variant === 'inline' && onLoginSuccess) {
                        onLoginSuccess({ ...profile, email: authData.user.email });
                    } else {
                        alert('Check your email for the confirmation link or log in if confirmation is disabled.');
                        setMode('login');
                    }
                }
            } else {
                const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                    email: formData.email,
                    password: formData.password,
                });
                if (authError) throw authError;

                if (authData.user) {
                    let { data: profile, error: profileError } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', authData.user.id)
                        .single();

                    if (profileError && (profileError.code === 'PGRST116' || profileError.message.includes('JSON'))) {
                        console.log("Profile missing, creating placeholder...");
                        const { error: insertError } = await supabase.from('profiles').insert({
                            id: authData.user.id,
                            first_name: 'New',
                            last_name: 'User',
                            profession: 'Researcher',
                        });

                        if (!insertError) {
                            const { data: newProfile } = await supabase
                                .from('profiles')
                                .select('*')
                                .eq('id', authData.user.id)
                                .single();
                            profile = newProfile;
                            profileError = null;
                        }
                    }

                    if (profileError) throw profileError;
                    
                    if (variant === 'inline' && onLoginSuccess) {
                        onLoginSuccess({ ...profile, email: authData.user.email });
                    } else {
                        router.push('/dashboard');
                        router.refresh();
                    }
                }
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const renderFormFields = () => (
        <div className="space-y-4">
            {mode === 'signup' && (
                <div className="grid grid-cols-2 gap-4 animate-slide-up">
                    <Input
                        label={variant === 'inline' ? "First Name" : undefined}
                        placeholder="Jane"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        required
                        className={variant === 'page' ? "bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-accent-primary focus:ring-accent-primary" : ""}
                    />
                    <Input
                         label={variant === 'inline' ? "Last Name" : undefined}
                        placeholder="Doe"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        required
                        className={variant === 'page' ? "bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-accent-primary focus:ring-accent-primary" : ""}
                    />
                </div>
            )}

            {mode === 'signup' && (
                <div className="animate-slide-up delay-100">
                    <Input
                         label={variant === 'inline' ? "Profession" : undefined}
                        placeholder="e.g. Data Scientist"
                        value={formData.profession}
                        onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                        required
                        className={variant === 'page' ? "bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-accent-primary focus:ring-accent-primary" : ""}
                    />
                </div>
            )}

            <div className={`relative ${variant === 'page' ? '' : 'mt-4'}`}>
                {variant === 'page' && <Mail className="absolute left-3 top-3 h-5 w-5 text-white/30" />}
                <Input
                     label={variant === 'inline' ? "Email" : undefined}
                    type="email"
                    placeholder={variant === 'page' ? "Email address" : "name@example.com"}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className={variant === 'page' ? "pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-accent-primary focus:ring-accent-primary" : ""}
                />
            </div>

            <div className={`relative ${variant === 'page' ? '' : 'mt-4'}`}>
                 {variant === 'page' && <Lock className="absolute left-3 top-3 h-5 w-5 text-white/30" />}
                <Input
                     label={variant === 'inline' ? "Password" : undefined}
                    type="password"
                    placeholder={variant === 'page' ? "Password" : "••••••••"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    className={variant === 'page' ? "pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-accent-primary focus:ring-accent-primary" : ""}
                />
            </div>
        </div>
    );

    if (variant === 'inline') {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 bg-secondary/30 backdrop-blur-sm fixed inset-0 z-50">
                <Card className="w-full max-w-md p-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-accent-primary/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                    <div className="relative z-10">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold mb-2">
                                {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                            </h2>
                            <p className="text-muted-foreground text-sm">
                                {mode === 'login'
                                    ? 'Enter your credentials to access your research.'
                                    : 'Join MAARS Enterprise to accelerate your research.'}
                            </p>
                        </div>

                        <form onSubmit={handleAuth} className="space-y-4">
                            {renderFormFields()}

                            {error && (
                                <div className="p-3 rounded-lg bg-red-500/10 text-red-500 text-sm animate-fade-in mt-4">
                                    {error}
                                </div>
                            )}

                            <div className="pt-4">
                                <Button type="submit" className="w-full" isLoading={loading}>
                                    {mode === 'login' ? 'Sign In' : 'Create Account'}
                                    {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
                                </Button>
                            </div>
                        </form>

                        <div className="mt-6 text-center text-sm text-muted-foreground">
                            {mode === 'login' ? "Don't have an account?" : "Already have an account?"}{' '}
                            <button
                                type="button"
                                onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                                className="font-medium text-accent-primary hover:underline focus:outline-none"
                            >
                                {mode === 'login' ? 'Sign up' : 'Log in'}
                            </button>
                        </div>

                        {onCancel && (
                            <button
                                type="button"
                                onClick={onCancel}
                                className="mt-4 w-full text-center text-xs text-muted-foreground hover:text-foreground"
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md p-8 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60 mb-2">
                    {type === 'login' ? 'Welcome Back' : 'Create Account'}
                </h1>
                <p className="text-white/40 text-sm">
                    {type === 'login'
                        ? 'Enter your credentials to access your research.'
                        : 'Join the next generation of autonomous research.'}
                </p>
            </div>

            <form onSubmit={handleAuth} className="space-y-6">
                {renderFormFields()}

                {error && (
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                        {error}
                    </div>
                )}

                <Button
                    type="submit"
                    className="w-full bg-accent-primary hover:bg-accent-primary/90 text-white py-6 text-lg shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all hover:scale-[1.02]"
                    disabled={loading}
                >
                    {loading ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                        <span className="flex items-center gap-2">
                            {mode === 'login' ? 'Sign In' : 'Get Started'}
                            <ArrowRight className="w-5 h-5" />
                        </span>
                    )}
                </Button>
            </form>

            <div className="mt-8 text-center">
                <p className="text-sm text-white/40">
                    {type === 'login' ? "Don't have an account? " : "Already have an account? "}
                    <Link
                        href={type === 'login' ? '/signup' : '/login'}
                        className="text-accent-primary hover:text-accent-primary/80 font-medium transition-colors"
                    >
                        {type === 'login' ? 'Sign up' : 'Log in'}
                    </Link>
                </p>
            </div>
        </div>
    );
}
