import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { Mail, Lock, User as UserIcon, Briefcase, ArrowRight } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

import { supabase } from '../../lib/supabase';

interface AuthFormProps {
    onLoginSuccess: (user: any) => void;
    onCancel: () => void;
}

export const AuthForm = ({ onLoginSuccess, onCancel }: AuthFormProps) => {
    const [mode, setMode] = useState<'login' | 'signup'>('login');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        profession: '',
    });

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (mode === 'signup') {
                const { data: authData, error: authError } = await supabase.auth.signUp({
                    email: formData.email,
                    password: formData.password,
                });
                if (authError) throw authError;

                if (authData.user) {
                    const { error: profileError } = await supabase.from('profiles').insert({
                        id: authData.user.id,
                        first_name: formData.firstName,
                        last_name: formData.lastName,
                        profession: formData.profession,
                        // email is stored in auth.users, not profiles
                    });
                    if (profileError) throw profileError;

                    // Fetch the profile we just created
                    const { data: profile } = await supabase.from('profiles').select('*').eq('id', authData.user.id).single();

                    // Merge email from auth user since it's not in profiles
                    onLoginSuccess({ ...profile, email: authData.user.email });
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

                    // If profile is missing (e.g. signup failed previously), create a placeholder
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
                    onLoginSuccess({ ...profile, email: authData.user.email });
                }
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-secondary/30 backdrop-blur-sm fixed inset-0 z-50">
            <Card className="w-full max-w-md p-8 relative overflow-hidden">
                {/* Decorative background blob */}
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
                        {mode === 'signup' && (
                            <div className="grid grid-cols-2 gap-4 animate-slide-up">
                                <Input
                                    label="First Name"
                                    placeholder="Jane"
                                    value={formData.firstName}
                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                    required
                                />
                                <Input
                                    label="Last Name"
                                    placeholder="Doe"
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                    required
                                />
                            </div>
                        )}

                        {mode === 'signup' && (
                            <div className="animate-slide-up delay-100">
                                <Input
                                    label="Profession"
                                    placeholder="e.g. Data Scientist"
                                    value={formData.profession}
                                    onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                                    required
                                />
                            </div>
                        )}

                        <Input
                            label="Email"
                            type="email"
                            placeholder="name@example.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />

                        <Input
                            label="Password"
                            type="password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                        />

                        {error && (
                            <div className="p-3 rounded-lg bg-red-500/10 text-red-500 text-sm animate-fade-in">
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
                            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                            className="font-medium text-accent-primary hover:underline focus:outline-none"
                        >
                            {mode === 'login' ? 'Sign up' : 'Log in'}
                        </button>
                    </div>

                    <button
                        onClick={onCancel}
                        className="mt-4 w-full text-center text-xs text-muted-foreground hover:text-foreground"
                    >
                        Cancel
                    </button>
                </div>
            </Card>
        </div>
    );
};
