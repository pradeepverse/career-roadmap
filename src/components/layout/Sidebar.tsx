import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Map, BookOpen, Share2, LogOut, LogIn, User } from 'lucide-react'
import { PHASES } from '../../data/phases'
import { WEEKS } from '../../data/weeks'
import { useApp } from '../../contexts/AppContext'
import { phasePercent, cn } from '../../lib/utils'
import { ProgressBar } from '../shared/ProgressBar'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/roadmap', icon: Map, label: 'Roadmap' },
  { to: '/log', icon: BookOpen, label: 'Learning Log' },
  { to: '/share', icon: Share2, label: 'Share' },
]

export function Sidebar() {
  const { progress, user, signOut, isSupabase } = useApp()
  const navigate = useNavigate()

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-white/5 bg-surface-800 overflow-y-auto">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold text-sm">CR</div>
        <div>
          <div className="text-sm font-semibold text-white">Career Roadmap</div>
          <div className="text-xs text-white/40">40-Week Sprint</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 px-3 py-4">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                isActive
                  ? 'bg-indigo-600/20 text-indigo-300'
                  : 'text-white/50 hover:bg-white/5 hover:text-white'
              )
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Current week indicator */}
      <div className="mx-3 mb-4 rounded-lg border border-white/5 bg-white/[0.03] p-3">
        <div className="text-xs text-white/40 mb-1">Current Week</div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-white">{progress.currentWeek}</span>
          <span className="text-xs text-white/40">/ 40</span>
        </div>
        {progress.startDate && (
          <div className="text-xs text-white/30 mt-1">
            Started {new Date(progress.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
          </div>
        )}
      </div>

      {/* Phase progress */}
      <div className="px-3 flex-1">
        <div className="text-xs text-white/30 uppercase tracking-wider mb-3 px-1">Phases</div>
        <div className="flex flex-col gap-2">
          {PHASES.map(phase => {
            const pct = phasePercent(phase.id, progress)
            const currentWeekInPhase =
              progress.currentWeek >= phase.weekStart && progress.currentWeek <= phase.weekEnd
            const weeksInPhase = WEEKS.filter(w => w.phase === phase.id).length
            return (
              <NavLink
                key={phase.id}
                to={`/roadmap?phase=${phase.id}`}
                className={cn(
                  'rounded-lg p-2.5 text-xs transition-colors',
                  currentWeekInPhase
                    ? cn(phase.bgColor, 'border', phase.borderColor)
                    : 'hover:bg-white/5'
                )}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={cn('font-medium', phase.color)}>{phase.label}</span>
                  <span className="text-white/30">Wk {phase.weekStart}–{phase.weekEnd}</span>
                </div>
                <div className="text-white/50 mb-2 leading-tight text-[11px]">{phase.name}</div>
                <div className="flex items-center gap-2">
                  <ProgressBar value={pct} size="sm" color={cn('bg-indigo-500')} className="flex-1" />
                  <span className="text-white/30 w-8 text-right">{pct}%</span>
                </div>
              </NavLink>
            )
          })}
        </div>
      </div>

      {/* User / Auth */}
      <div className="border-t border-white/5 p-3 mt-4">
        {user ? (
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600/30 text-indigo-300">
              <User size={13} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-white/70 truncate">{user.email}</div>
              <div className="text-[10px] text-white/30">Cloud synced</div>
            </div>
            <button onClick={signOut} className="text-white/30 hover:text-white/60 transition-colors">
              <LogOut size={14} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => navigate('/auth')}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-white/40 hover:bg-white/5 hover:text-white/70 transition-colors"
          >
            <LogIn size={14} />
            {isSupabase ? 'Sign in to sync' : 'Local mode (no sync)'}
          </button>
        )}
      </div>
    </aside>
  )
}
