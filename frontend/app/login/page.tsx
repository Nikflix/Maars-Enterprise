
import AuthForm from '../../components/features/auth/AuthForm'
import { FileText } from 'lucide-react'

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-accent-primary/5 blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-emerald-500/5 blur-[120px]" />
            </div>

            <div className="w-full max-w-md z-10 flex flex-col items-center gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                {/* Logo */}
                <div className="flex items-center gap-3">
                    <div className="bg-accent-primary/10 p-3 rounded-xl border border-accent-primary/20">
                        <FileText className="w-8 h-8 text-accent-primary" />
                    </div>
                    <span className="text-2xl font-bold tracking-tight text-white">MAARS Enterprise</span>
                </div>

                <AuthForm type="login" />
            </div>

            <div className="absolute bottom-8 text-white/20 text-xs font-mono">
                SECURE SYSTEM ACCESS &bull; AUTHORIZED PERSONNEL ONLY
            </div>
        </div>
    )
}
