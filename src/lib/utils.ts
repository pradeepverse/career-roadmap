import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { WEEKS } from '../data/weeks'
import type { ProgressState } from '../types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function totalDeliverables() {
  return WEEKS.reduce((sum, w) => sum + w.deliverables.length, 0)
}

export function completedDeliverablesCount(progress: ProgressState) {
  return Object.values(progress.completedDeliverables).filter(Boolean).length
}

export function weekCompletionPercent(weekId: string, progress: ProgressState) {
  const week = WEEKS.find(w => w.id === weekId)
  if (!week || week.deliverables.length === 0) return 0
  const done = week.deliverables.filter(d => progress.completedDeliverables[d.id]).length
  return Math.round((done / week.deliverables.length) * 100)
}

export function overallPercent(progress: ProgressState) {
  const total = totalDeliverables()
  if (total === 0) return 0
  return Math.round((completedDeliverablesCount(progress) / total) * 100)
}

export function phasePercent(phaseId: string, progress: ProgressState) {
  const weeks = WEEKS.filter(w => w.phase === phaseId)
  const total = weeks.reduce((s, w) => s + w.deliverables.length, 0)
  if (total === 0) return 0
  const done = weeks.reduce(
    (s, w) => s + w.deliverables.filter(d => progress.completedDeliverables[d.id]).length,
    0
  )
  return Math.round((done / total) * 100)
}

export function categoryColor(category: string) {
  switch (category) {
    case 'project': return 'bg-violet-500/20 text-violet-300 border-violet-500/30'
    case 'dsa': return 'bg-blue-500/20 text-blue-300 border-blue-500/30'
    case 'lld': return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
    case 'behavioral': return 'bg-amber-500/20 text-amber-300 border-amber-500/30'
    case 'blog': return 'bg-pink-500/20 text-pink-300 border-pink-500/30'
    case 'cloud': return 'bg-sky-500/20 text-sky-300 border-sky-500/30'
    default: return 'bg-slate-500/20 text-slate-300 border-slate-500/30'
  }
}

export function logTypeColor(type: string) {
  switch (type) {
    case 'win': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
    case 'learning': return 'bg-blue-500/20 text-blue-300 border-blue-500/30'
    case 'blocker': return 'bg-rose-500/20 text-rose-300 border-rose-500/30'
    case 'reflection': return 'bg-amber-500/20 text-amber-300 border-amber-500/30'
    default: return 'bg-slate-500/20 text-slate-300 border-slate-500/30'
  }
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}
