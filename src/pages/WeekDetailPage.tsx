import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, Circle, Plus } from 'lucide-react'
import { WEEKS } from '../data/weeks'
import { PHASES } from '../data/phases'
import { useApp } from '../contexts/AppContext'
import { Badge } from '../components/shared/Badge'
import { ProgressBar } from '../components/shared/ProgressBar'
import { categoryColor, weekCompletionPercent, cn } from '../lib/utils'

export function WeekDetailPage() {
  const { weekId } = useParams<{ weekId: string }>()
  const navigate = useNavigate()
  const { progress, toggleDeliverable, addLog } = useApp()

  const week = WEEKS.find(w => w.id === weekId)
  if (!week) return (
    <div className="flex items-center justify-center h-full text-white/40">Week not found</div>
  )

  const phase = PHASES.find(p => p.id === week.phase)!
  const pct = weekCompletionPercent(week.id, progress)
  const isCurrent = week.number === progress.currentWeek

  function handleQuickLog() {
    addLog({
      weekNumber: week!.number,
      date: new Date().toISOString().split('T')[0],
      title: `Week ${week!.number} — Progress update`,
      content: '',
      tags: [`week-${week!.number}`],
      type: 'learning',
    })
    navigate('/log')
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      {/* Back */}
      <button
        onClick={() => navigate(`/roadmap?phase=${week.phase}`)}
        className="flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 mb-6 transition-colors"
      >
        <ArrowLeft size={14} /> Back to {phase.label}
      </button>

      {/* Header */}
      <div className={cn('rounded-xl border p-5 mb-6', phase.bgColor, phase.borderColor)}>
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <Badge className={cn(phase.bgColor, phase.color, phase.borderColor)}>{phase.label}</Badge>
          <Badge className="bg-white/5 text-white/40 border-white/10">Week {week.number}</Badge>
          {isCurrent && <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30">Current Week</Badge>}
        </div>
        <h1 className="text-xl font-bold text-white mb-3">{week.theme}</h1>
        {week.description && <p className="text-sm text-white/60 mb-3">{week.description}</p>}
        <div className="flex items-center gap-3">
          <ProgressBar value={pct} className="flex-1" color="bg-indigo-500" />
          <span className="text-sm text-white/50 flex-shrink-0">{pct}% done</span>
        </div>
      </div>

      {/* Track focus */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-3">
          <div className="text-[10px] text-blue-400 uppercase tracking-wider mb-1.5">Track A — DSA</div>
          <div className="text-xs text-white/70">{week.trackAFocus}</div>
        </div>
        <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-3">
          <div className="text-[10px] text-cyan-400 uppercase tracking-wider mb-1.5">Track B — LLD/HLD</div>
          <div className="text-xs text-white/70">{week.trackBFocus}</div>
        </div>
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
          <div className="text-[10px] text-amber-400 uppercase tracking-wider mb-1.5">Track C — Behavioral</div>
          <div className="text-xs text-white/70">{week.trackCFocus}</div>
        </div>
      </div>

      {/* Daily schedule */}
      {week.schedule && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3">Daily Schedule</h2>
          <div className="rounded-xl border border-white/5 overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left p-3 text-white/30 font-medium w-16">Day</th>
                  <th className="text-left p-3 text-blue-400/70 font-medium">Block 1 — DSA (30m)</th>
                  <th className="text-left p-3 text-indigo-400/70 font-medium">Block 2 — Core (2h)</th>
                  <th className="text-left p-3 text-emerald-400/70 font-medium">Block 3 — Docs (30m)</th>
                </tr>
              </thead>
              <tbody>
                {week.schedule.map((day, i) => (
                  <tr
                    key={day.day}
                    className={cn(
                      'border-b border-white/5 last:border-0',
                      i % 2 === 0 ? 'bg-white/[0.01]' : ''
                    )}
                  >
                    <td className="p-3 text-white/50 font-medium">{day.day}</td>
                    <td className="p-3 text-white/60">{day.block1 || '—'}</td>
                    <td className="p-3 text-white/80">{day.block2}</td>
                    <td className="p-3 text-white/60">{day.block3 || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Deliverables checklist */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Deliverables</h2>
          <span className="text-xs text-white/30">
            {week.deliverables.filter(d => progress.completedDeliverables[d.id]).length} / {week.deliverables.length} done
          </span>
        </div>
        <div className="flex flex-col gap-2">
          {week.deliverables.map(d => {
            const done = progress.completedDeliverables[d.id]
            return (
              <button
                key={d.id}
                onClick={() => toggleDeliverable(d.id)}
                className={cn(
                  'flex items-start gap-3 rounded-lg border px-4 py-3 text-left transition-all',
                  done
                    ? 'border-emerald-500/20 bg-emerald-500/5 hover:border-emerald-500/30'
                    : 'border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]'
                )}
              >
                {done
                  ? <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                  : <Circle size={16} className="text-white/20 flex-shrink-0 mt-0.5" />}
                <span className={cn('text-sm flex-1', done ? 'text-white/40 line-through' : 'text-white/80')}>
                  {d.text}
                </span>
                <Badge className={cn('flex-shrink-0 mt-0.5', categoryColor(d.category))}>
                  {d.category}
                </Badge>
              </button>
            )
          })}
        </div>
      </div>

      {/* Quick log button */}
      <button
        onClick={handleQuickLog}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/10 py-4 text-sm text-white/40 hover:border-indigo-500/30 hover:text-indigo-400 transition-colors"
      >
        <Plus size={16} /> Log today's learning for Week {week.number}
      </button>
    </div>
  )
}
