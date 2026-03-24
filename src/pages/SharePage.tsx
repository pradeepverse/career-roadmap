import { useState } from 'react'
import { Copy, Check, Share2, Lock, ExternalLink } from 'lucide-react'
import { useApp } from '../contexts/AppContext'
import { PHASES } from '../data/phases'
import { WEEKS } from '../data/weeks'
import { ProgressBar } from '../components/shared/ProgressBar'
import { Badge } from '../components/shared/Badge'
import {
  overallPercent, phasePercent, weekCompletionPercent,
  logTypeColor, formatDate, cn
} from '../lib/utils'

export function SharePage() {
  const { user, progress, logs, isSupabase } = useApp()
  const [copied, setCopied] = useState(false)

  const shareUrl = user
    ? `${window.location.origin}/share/${user.id}`
    : null

  function copyLink() {
    if (!shareUrl) return
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const overall = overallPercent(progress)
  const completedWeeks = WEEKS.filter(w => weekCompletionPercent(w.id, progress) === 100)
  const recentLogs = logs.slice(0, 8)

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Share2 size={20} className="text-indigo-400" />
        <div>
          <h1 className="text-2xl font-bold text-white">Share Progress</h1>
          <p className="text-sm text-white/40">Share your roadmap journey with anyone</p>
        </div>
      </div>

      {/* Share link */}
      <div className={cn(
        'rounded-xl border p-5 mb-8',
        isSupabase && user
          ? 'border-indigo-500/20 bg-indigo-600/5'
          : 'border-white/5 bg-white/[0.02]'
      )}>
        {isSupabase && user ? (
          <>
            <div className="text-sm font-medium text-white mb-1">Your public profile URL</div>
            <div className="text-xs text-white/40 mb-4">
              Anyone with this link can see your progress snapshot. No sign-in required.
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/60 truncate">
                {shareUrl}
              </code>
              <button
                onClick={copyLink}
                className={cn(
                  'flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors flex-shrink-0',
                  copied
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-indigo-600 text-white hover:bg-indigo-500'
                )}
              >
                {copied ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Copy link</>}
              </button>
              <a
                href={shareUrl!}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-xs text-white/50 hover:text-white/80 transition-colors"
              >
                <ExternalLink size={12} /> Open
              </a>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
              <Lock size={16} className="text-white/30" />
            </div>
            <div>
              <div className="text-sm font-medium text-white/70">Sign in to get a shareable link</div>
              <div className="text-xs text-white/30 mt-0.5">
                {isSupabase
                  ? 'Create an account to share your public progress profile with employers and peers.'
                  : 'Configure Supabase in .env.local to enable cloud sync and public sharing.'}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Progress preview card — this is what others see */}
      <div className="text-xs text-white/30 uppercase tracking-wider mb-3">Preview — what others will see</div>
      <div className="rounded-xl border border-white/10 bg-surface-800 overflow-hidden">
        {/* Profile header */}
        <div className="bg-gradient-to-r from-indigo-900/50 to-violet-900/30 px-6 py-6 border-b border-white/5">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-lg font-bold text-white mb-0.5">Career Roadmap</div>
              <div className="text-xs text-white/40">Services → Senior/Staff/Architect at Tier-1 Product Companies</div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-white">{overall}%</div>
              <div className="text-xs text-white/40">overall</div>
            </div>
          </div>
          <div className="mt-4">
            <ProgressBar value={overall} size="md" color="bg-indigo-500" />
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 border-b border-white/5">
          {[
            { label: 'DSA Problems', value: progress.dsaCount, target: 150, color: 'text-blue-400' },
            { label: 'STAR Stories', value: progress.starStoryCount, target: 20, color: 'text-amber-400' },
            { label: 'Blog Posts', value: progress.blogCount, target: 8, color: 'text-pink-400' },
            { label: 'Projects Built', value: progress.projectCount, target: 8, color: 'text-violet-400' },
          ].map(({ label, value, target, color }) => (
            <div key={label} className="px-4 py-4 border-r border-white/5 last:border-0">
              <div className={cn('text-2xl font-bold', color)}>{value}</div>
              <div className="text-xs text-white/30">{label}</div>
              <ProgressBar value={(value / target) * 100} size="sm" className="mt-2" />
            </div>
          ))}
        </div>

        {/* Phase grid */}
        <div className="px-6 py-5 border-b border-white/5">
          <div className="text-xs text-white/30 uppercase tracking-wider mb-3">Phase Progress</div>
          <div className="grid grid-cols-1 gap-2">
            {PHASES.map(phase => {
              const pct = phasePercent(phase.id, progress)
              return (
                <div key={phase.id} className="flex items-center gap-3">
                  <span className={cn('text-xs font-medium w-20 flex-shrink-0', phase.color)}>
                    {phase.label}
                  </span>
                  <ProgressBar value={pct} size="sm" className="flex-1" />
                  <span className="text-xs text-white/30 w-8 text-right">{pct}%</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Completed weeks */}
        {completedWeeks.length > 0 && (
          <div className="px-6 py-5 border-b border-white/5">
            <div className="text-xs text-white/30 uppercase tracking-wider mb-3">
              Completed Weeks ({completedWeeks.length})
            </div>
            <div className="flex flex-wrap gap-1.5">
              {completedWeeks.map(w => (
                <span
                  key={w.id}
                  className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-xs text-emerald-400"
                >
                  Week {w.number}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Recent log entries */}
        {recentLogs.length > 0 && (
          <div className="px-6 py-5">
            <div className="text-xs text-white/30 uppercase tracking-wider mb-3">Recent Learning Log</div>
            <div className="flex flex-col gap-2">
              {recentLogs.map(entry => (
                <div key={entry.id} className="flex items-start gap-2.5">
                  <Badge className={cn('flex-shrink-0 mt-0.5', logTypeColor(entry.type))}>
                    {entry.type}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white/70 truncate">{entry.title}</div>
                    <div className="text-xs text-white/30">Week {entry.weekNumber} · {formatDate(entry.date)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
