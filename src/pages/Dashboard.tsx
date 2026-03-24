import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Target, TrendingUp, BookOpen, FileText, Layers,
  ChevronRight, Calendar, Edit3, Check
} from 'lucide-react'
import { useApp } from '../contexts/AppContext'
import { PHASES } from '../data/phases'
import { WEEKS } from '../data/weeks'
import { ProgressBar } from '../components/shared/ProgressBar'
import { Badge } from '../components/shared/Badge'
import {
  overallPercent, phasePercent, weekCompletionPercent,
  logTypeColor, formatDate, cn
} from '../lib/utils'

export function Dashboard() {
  const { progress, logs, updateCounter, setCurrentWeek, setStartDate } = useApp()
  const navigate = useNavigate()
  const [editingWeek, setEditingWeek] = useState(false)
  const [weekInput, setWeekInput] = useState(String(progress.currentWeek))

  const overall = overallPercent(progress)
  const currentWeekData = WEEKS.find(w => w.number === progress.currentWeek)
  const recentLogs = logs.slice(0, 5)

  const stats = [
    {
      key: 'dsaCount' as const,
      label: 'DSA Problems',
      value: progress.dsaCount,
      target: 150,
      icon: Target,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
    },
    {
      key: 'starStoryCount' as const,
      label: 'STAR Stories',
      value: progress.starStoryCount,
      target: 20,
      icon: FileText,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
    },
    {
      key: 'blogCount' as const,
      label: 'Blog Posts',
      value: progress.blogCount,
      target: 8,
      icon: BookOpen,
      color: 'text-pink-400',
      bg: 'bg-pink-500/10',
    },
    {
      key: 'projectCount' as const,
      label: 'Projects',
      value: progress.projectCount,
      target: 8,
      icon: Layers,
      color: 'text-violet-400',
      bg: 'bg-violet-500/10',
    },
  ]

  function handleWeekSave() {
    const n = parseInt(weekInput)
    if (n >= 1 && n <= 40) {
      setCurrentWeek(n)
    }
    setEditingWeek(false)
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          {!progress.startDate && (
            <button
              onClick={() => setStartDate(new Date().toISOString().split('T')[0])}
              className="flex items-center gap-1.5 rounded-full bg-indigo-600/20 border border-indigo-500/30 px-3 py-1 text-xs text-indigo-300 hover:bg-indigo-600/30 transition-colors"
            >
              <Calendar size={11} /> Set start date (today)
            </button>
          )}
        </div>
        <p className="text-white/40 text-sm">
          Services engineer → Senior/Staff/Architect at Tier-1 Product Companies
        </p>
      </div>

      {/* Overall progress */}
      <div className="rounded-xl border border-white/5 bg-white/[0.03] p-6 mb-6">
        <div className="flex items-end justify-between mb-3">
          <div>
            <div className="text-xs text-white/40 uppercase tracking-wider mb-1">Overall Progress</div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-white">{overall}%</span>
              <span className="text-sm text-white/40">complete</span>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 justify-end">
              {editingWeek ? (
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={1}
                    max={40}
                    value={weekInput}
                    onChange={e => setWeekInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleWeekSave() }}
                    className="w-16 rounded bg-white/10 border border-white/10 px-2 py-1 text-sm text-white text-center focus:outline-none focus:border-indigo-500"
                    autoFocus
                  />
                  <button onClick={handleWeekSave} className="text-indigo-400 hover:text-indigo-300">
                    <Check size={14} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { setEditingWeek(true); setWeekInput(String(progress.currentWeek)) }}
                  className="flex items-center gap-1.5 text-white/60 hover:text-white transition-colors"
                >
                  <span className="text-3xl font-bold text-white">Week {progress.currentWeek}</span>
                  <Edit3 size={13} />
                </button>
              )}
            </div>
            <div className="text-xs text-white/30">of 40 weeks</div>
          </div>
        </div>
        <ProgressBar value={overall} size="lg" color="bg-indigo-500" />
      </div>

      {/* Stat counters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map(({ key, label, value, target, icon: Icon, color, bg }) => (
          <div key={key} className="rounded-xl border border-white/5 bg-white/[0.03] p-4">
            <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center mb-3', bg)}>
              <Icon size={16} className={color} />
            </div>
            <div className="text-2xl font-bold text-white mb-0.5">{value}</div>
            <div className="text-xs text-white/40 mb-3">{label}</div>
            <div className="flex items-center gap-2">
              <ProgressBar value={(value / target) * 100} size="sm" className="flex-1" />
              <span className="text-xs text-white/30">{target}</span>
            </div>
            <div className="flex items-center gap-1 mt-3">
              <button
                onClick={() => updateCounter(key, value - 1)}
                className="flex-1 rounded bg-white/5 hover:bg-white/10 py-1 text-xs text-white/50 transition-colors"
              >
                −
              </button>
              <button
                onClick={() => updateCounter(key, value + 1)}
                className="flex-1 rounded bg-white/5 hover:bg-white/10 py-1 text-xs text-white/50 transition-colors"
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Current week card */}
      {currentWeekData && (
        <div className="rounded-xl border border-indigo-500/20 bg-indigo-600/5 p-5 mb-6">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30">Current Week</Badge>
                <Badge className="bg-white/5 text-white/40 border-white/10">Week {currentWeekData.number}</Badge>
              </div>
              <h2 className="font-semibold text-white">{currentWeekData.theme}</h2>
            </div>
            <button
              onClick={() => navigate(`/roadmap/week/${currentWeekData.id}`)}
              className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              View details <ChevronRight size={13} />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div className="rounded-lg bg-white/[0.03] p-2.5">
              <div className="text-[10px] text-blue-400 uppercase tracking-wider mb-1">Track A — DSA</div>
              <div className="text-xs text-white/60">{currentWeekData.trackAFocus}</div>
            </div>
            <div className="rounded-lg bg-white/[0.03] p-2.5">
              <div className="text-[10px] text-cyan-400 uppercase tracking-wider mb-1">Track B — LLD/HLD</div>
              <div className="text-xs text-white/60">{currentWeekData.trackBFocus}</div>
            </div>
            <div className="rounded-lg bg-white/[0.03] p-2.5">
              <div className="text-[10px] text-amber-400 uppercase tracking-wider mb-1">Track C — Behavioral</div>
              <div className="text-xs text-white/60">{currentWeekData.trackCFocus}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ProgressBar
              value={weekCompletionPercent(currentWeekData.id, progress)}
              size="sm"
              className="flex-1"
              color="bg-indigo-500"
            />
            <span className="text-xs text-white/40">
              {weekCompletionPercent(currentWeekData.id, progress)}% of this week's deliverables
            </span>
          </div>
        </div>
      )}

      {/* Phase overview grid */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-white/60 mb-3">Phase Progress</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {PHASES.map(phase => {
            const pct = phasePercent(phase.id, progress)
            const active = progress.currentWeek >= phase.weekStart && progress.currentWeek <= phase.weekEnd
            return (
              <button
                key={phase.id}
                onClick={() => navigate(`/roadmap?phase=${phase.id}`)}
                className={cn(
                  'text-left rounded-xl border p-4 transition-colors hover:bg-white/5',
                  active ? cn(phase.bgColor, phase.borderColor) : 'border-white/5 bg-white/[0.02]'
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={cn('text-xs font-semibold', phase.color)}>{phase.label}</span>
                  <span className="text-xs text-white/30">Wk {phase.weekStart}–{phase.weekEnd}</span>
                </div>
                <div className="text-sm font-medium text-white/80 mb-3">{phase.name}</div>
                <div className="flex items-center gap-2">
                  <ProgressBar value={pct} size="sm" className="flex-1" />
                  <span className="text-xs text-white/40 w-8 text-right">{pct}%</span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Recent log */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-white/60">Recent Log Entries</h3>
          <button
            onClick={() => navigate('/log')}
            className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
          >
            View all <ChevronRight size={13} />
          </button>
        </div>
        {recentLogs.length === 0 ? (
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6 text-center">
            <TrendingUp size={24} className="mx-auto mb-2 text-white/20" />
            <div className="text-sm text-white/40">No log entries yet</div>
            <button
              onClick={() => navigate('/log')}
              className="mt-3 text-xs text-indigo-400 hover:text-indigo-300"
            >
              Add your first entry
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {recentLogs.map(entry => (
              <div
                key={entry.id}
                onClick={() => navigate('/log')}
                className="flex items-start gap-3 rounded-lg border border-white/5 bg-white/[0.02] p-3 cursor-pointer hover:bg-white/[0.04] transition-colors"
              >
                <Badge className={logTypeColor(entry.type)}>{entry.type}</Badge>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white/80 truncate">{entry.title}</div>
                  <div className="text-xs text-white/30">Week {entry.weekNumber} · {formatDate(entry.date)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
