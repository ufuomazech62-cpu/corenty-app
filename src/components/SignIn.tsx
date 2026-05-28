import React from 'react'
import { motion } from 'motion/react'
import { ArrowLeft, Home } from 'lucide-react'

interface SignInProps {
  onNavigate: (page: string) => void
}

const SignIn: React.FC<SignInProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-cream relative">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-[420px]"
      >
        <button
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-2 text-sm text-ink mb-12 transition-colors"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <div className="flex items-center gap-3 mb-12">
          <div className="w-12 h-12 rounded-[16px] bg-ink flex items-center justify-center">
            <Home className="w-6 h-6 text-cream" strokeWidth={2} />
          </div>
          <span className="text-2xl font-display font-bold tracking-[-0.03em] text-ink">CoRenty</span>
        </div>

        <h1 className="text-3xl font-display font-bold tracking-[-0.03em] mb-2 text-ink">
          Welcome back.
        </h1>
        <p className="text-ink mb-10">
          Sign in to continue finding your roommate.
        </p>

        <button
          onClick={() => onNavigate('onboarding')}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-surface border border-border rounded-2xl font-medium text-ink hover:border-ink/20 hover:bg-surface/80 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        <p className="text-xs text-center text-ink mt-8">
          Verified students only · Safe and secure
        </p>
      </motion.div>
    </div>
  )
}

export default SignIn
