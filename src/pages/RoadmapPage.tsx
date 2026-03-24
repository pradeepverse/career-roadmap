import { useSearchParams, useNavigate } from 'react-router-dom'
import { ChevronRight, CheckCircle2, Circle } from 'lucide-react'
import { PHASES } from '../data/phases'
import { WEEKS } from '../data/weeks'
import { useApp } from '../contexts/AppContext'
import { ProgressBar } from '../components/shared/ProgressBar'
import { Badge } from '../components/shared/Badge'
import { weekCompletionPercent, phasePercent, categoryColor, cn } from '../lib/utils'

export function RoadmapPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { progress } = useApp()
  const activePhase = params.get('phase') ?? PHASES[0].id

  const phase = PHASES.find(p => p.id === activePhase) ?? PHASES[0]
  const weeks = WEEKS.filter(w => w.phase === activePhase)

  return (
    <div className="flex h-full">
      {/* Phase tabs — left column */}
      <div className="w-56 border-r border-white/5 py-6 px-3 flex-shrink-0">
        <div className="text-xs text-white/30 uppercase tracking-wider px-2 mb-3">Phases</div>
        {PHASES.map(p => {
          const pct = phasePercent(p.id, progress)
          const active = p.id === activePhase
          return (
            <button
              key={p.id}
              onClick={() => navigate(`/roadmap?phase=${p.id}`)}
              className={cn(
                'w-full text-left rounded-lg px-3 py-2.5 mb-1 transition-colors',
                active ? cn(p.bgColor, 'border', p.borderColor) : 'hover:bg-white/5'
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={cn('text-xs font-semibold', p.color)}>{p.label}</span>
                <span className="text-[10px] text-white/30">{pct}%</span>
              </div>
              <div className="text-[11px] text-white/50 mb-1.5">{p.name}</div>
              <ProgressBar value={pct} size="sm" />
            </button>
          )
        })}
      </div>

      {/* Phase content — right column */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {/* Phase header */}
        <div className={cn('rounded-xl border p-5 mb-6', phase.bgColor, phase.borderColor)}>
          <div className="flex items-center gap-2 mb-2">
            <Badge className={cn(phase.bgColor, phase.color, phase.borderColor)}>{phase.label}</Badge>
            <span className="text-xs text-white/40">Weeks {phase.weekStart}–{phase.weekEnd}</span>
          </div>
          <h1 className="text-xl font-bold text-white mb-2">{phase.name}</h1>
          <p className="text-sm text-white/60">{phase.goal}</p>
          <div className="flex items-center gap-3 mt-4">
            <ProgressBar value={phasePercent(phase.id, progress)} className="flex-1" color="bg-indigo-500" />
            <span className="text-sm text-white/50">{phasePercent(phase.id, progress)}%</span>
          </div>
        </div>

        {/* Weeks grid */}
        <div className="flex flex-col gap-4">
          {weeks.map(week => {
            const pct = weekCompletionPercent(week.id, progress)
            const isCurrent = week.number === progress.currentWeek
            const isCompleted = pct === 100

            return (
              <div
                key={week.id}
                className={cn(
                  'rounded-xl border transition-colors',
                  isCurrent
                    ? 'border-indigo-500/30 bg-indigo-600/5'
                    : isCompleted
                    ? 'border-emerald-500/20 bg-emerald-500/5'
                    : 'border-white/5 bg-white/[0.02]'
                )}
              >
                {/* Week header */}
                <div className="flex items-start justify-between p-4 pb-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold mt-0.5',
                        isCompleted
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : isCurrent
                          ? 'bg-indigo-500/20 text-indigo-400'
                          : 'bg-white/5 text-white/40'
                      )}
                    >
                      {week.number}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        {isCurrent && <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30">Current</Badge>}
                        {isCompleted && <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">Complete</Badge>}
                      </div>
                      <h3 className="text-sm font-semibold text-white">{week.theme}</h3>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/roadmap/week/${week.id}`)}
                    className="flex items-center gap-1 text-xs text-white/40 hover:text-white/70 transition-colors flex-shrink-0 mt-1"
                  >
                    Details <ChevronRight size={13} />
                  </button>
                </div>

                {/* Track pills */}
                <div className="px-4 pb-3 flex flex-wrap gap-2">
                  <span className="rounded-full bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 text-[10px] text-blue-300">
                    DSA: {week.trackAFocus.split('.')[0]}
                  </span>
                  <span className="rounded-full bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 text-[10px] text-cyan-300">
                    LLD: {week.trackBFocus.split('.')[0]}
                  </span>
                </div>

                {/* Deliverables */}
                <div className="border-t border-white/5 px-4 py-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] text-white/30 uppercase tracking-wider">Deliverables</span>
                    <span className="text-[10px] text-white/30">
                      {week.deliverables.filter(d => progress.completedDeliverables[d.id]).length}/{week.deliverables.length}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {week.deliverables.map(d => {
                      const done = progress.completedDeliverables[d.id]
                      return (
                        <div key={d.id} className="flex items-start gap-2">
                          {done
                            ? <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                            : <Circle size={14} className="text-white/20 flex-shrink-0 mt-0.5" />}
                          <span className={cn('text-xs', done ? 'text-white/40 line-through' : 'text-white/70')}>
                            {d.text}
                          </span>
                          <Badge className={cn('ml-auto flex-shrink-0', categoryColor(d.category))}>
                            {d.category}
                          </Badge>
                        </div>
                      )
                    })}
                  </div>
                  <div className="mt-3">
                    <ProgressBar value={pct} size="sm" color={isCompleted ? 'bg-emerald-500' : 'bg-indigo-500'} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
