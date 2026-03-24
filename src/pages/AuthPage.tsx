import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Github, Mail, ArrowLeft, AlertCircle } from 'lucide-react'
import { useApp } from '../contexts/AppContext'
import { cn } from '../lib/utils'

export function AuthPage() {
  const { signInWithGitHub, signInWithEmail, signUpWithEmail, isSupabase, user } = useApp()
  const navigate = useNavigate()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  if (user) {
    navigate('/')
    return null
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const fn = mode === 'signin' ? signInWithEmail : signUpWithEmail
    const err = await fn(email, password)
    setLoading(false)
    if (err) {
      setError(err)
    } else if (mode === 'signup') {
      setSuccess(true)
    } else {
      navigate('/')
    }
  }

  if (!isSupabase) {
    return (
      <div className="flex h-full items-center justify-center px-6">
        <div className="max-w-sm w-full text-center">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={22} className="text-amber-400" />
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Supabase not configured</h1>
          <p className="text-sm text-white/50 mb-6">
            The app is running in local-only mode. Your progress is saved in this browser.
            To enable cloud sync across devices, configure Supabase in <code className="text-indigo-300">.env.local</code>.
          </p>
          <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-left text-xs text-white/50 font-mono mb-6">
            <div className="text-white/30 mb-1"># .env.local</div>
            <div>VITE_SUPABASE_URL=https://xxx.supabase.co</div>
            <div>VITE_SUPABASE_ANON_KEY=your-anon-key</div>
          </div>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 mx-auto text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <ArrowLeft size={14} /> Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="flex h-full items-center justify-center px-6">
        <div className="max-w-sm w-full text-center">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
            <Mail size={22} className="text-emerald-400" />
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Check your email</h1>
          <p className="text-sm text-white/50 mb-6">
            A confirmation link has been sent to <strong className="text-white">{email}</strong>.
            Click it to activate your account and enable cloud sync.
          </p>
          <button
            onClick={() => navigate('/')}
            className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 mx-auto"
          >
            <ArrowLeft size={14} /> Continue in local mode for now
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full items-center justify-center px-6">
      <div className="max-w-sm w-full">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 mb-8 transition-colors"
        >
          <ArrowLeft size={14} /> Back
        </button>

        <h1 className="text-2xl font-bold text-white mb-1">
          {mode === 'signin' ? 'Sign in' : 'Create account'}
        </h1>
        <p className="text-sm text-white/40 mb-8">
          {mode === 'signin'
            ? 'Sync your progress across devices.'
            : 'Your progress will be backed up and shareable.'}
        </p>

        {/* GitHub OAuth */}
        <button
          onClick={signInWithGitHub}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-medium text-white hover:bg-white/10 transition-colors mb-4"
        >
          <Github size={17} /> Continue with GitHub
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-white/5" />
          <span className="text-xs text-white/20">or</span>
          <div className="flex-1 h-px bg-white/5" />
        </div>

        {/* Email / password */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email address"
            required
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 focus:border-indigo-500/50 focus:outline-none"
          />
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
            required
            minLength={6}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 focus:border-indigo-500/50 focus:outline-none"
          />

          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-rose-500/10 border border-rose-500/20 px-3 py-2 text-xs text-rose-300">
              <AlertCircle size={13} /> {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={cn(
              'w-full rounded-xl py-3 text-sm font-medium transition-colors',
              loading
                ? 'bg-indigo-600/40 text-white/40 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-500'
            )}
          >
            {loading ? 'Loading...' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-white/30">
          {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(null) }}
            className="text-indigo-400 hover:text-indigo-300"
          >
            {mode === 'signin' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  )
}
