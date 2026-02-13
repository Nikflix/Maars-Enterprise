
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../../utils/supabase/client'
import { Button } from '../../ui/Button'
import { Input } from '../../ui/Input'
import { Mail, Lock, Loader2, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface AuthFormProps {
    type: 'login' | 'signup'
}

export default function AuthForm({ type }: AuthFormProps) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const supabase = createClient()

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            if (type === 'signup') {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: `${location.origin}/auth/callback`,
                    },
                })
                if (error) throw error
                // For demo purposes, auto-login usually doesn't happen on signup if email confirmation is on.
                // But with Supabase defaults, it might send a confirmation email.
                // We'll show a message or redirect.
                alert('Check your email for the confirmation link!')
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                })
                if (error) throw error
                router.push('/dashboard')
                router.refresh()
            }
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
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
                <div className="space-y-4">
                    <div className="relative">
                        <Mail className="absolute left-3 top-3 h-5 w-5 text-white/30" />
                        <Input
                            type="email"
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-accent-primary focus:ring-accent-primary"
                            required
                        />
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-3 top-3 h-5 w-5 text-white/30" />
                        <Input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-accent-primary focus:ring-accent-primary"
                            required
                        />
                    </div>
                </div>

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
                            {type === 'login' ? 'Sign In' : 'Get Started'}
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
    )
}
