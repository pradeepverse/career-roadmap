import { useState } from 'react'
import { Plus, Trash2, Edit3, X, Check, Search, Filter } from 'lucide-react'
import { useApp } from '../contexts/AppContext'
import { Badge } from '../components/shared/Badge'
import { logTypeColor, formatDate, cn } from '../lib/utils'
import type { LogEntry } from '../types'
import { WEEKS } from '../data/weeks'

const LOG_TYPES = ['learning', 'reflection', 'blocker', 'win'] as const

function EntryForm({
  initial,
  currentWeek,
  onSave,
  onCancel,
}: {
  initial?: Partial<LogEntry>
  currentWeek: number
  onSave: (e: Omit<LogEntry, 'id'>) => void
  onCancel: () => void
}) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [content, setContent] = useState(initial?.content ?? '')
  const [type, setType] = useState<LogEntry['type']>(initial?.type ?? 'learning')
  const [weekNumber, setWeekNumber] = useState(initial?.weekNumber ?? currentWeek)
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>(initial?.tags ?? [])

  function addTag(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault()
      const t = tagInput.trim().toLowerCase()
      if (!tags.includes(t)) setTags([...tags, t])
      setTagInput('')
    }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    onSave({
      weekNumber,
      date: initial?.date ?? new Date().toISOString().split('T')[0],
      title: title.trim(),
      content: content.trim(),
      type,
      tags,
    })
  }

  return (
    <form onSubmit={submit} className="rounded-xl border border-indigo-500/20 bg-indigo-600/5 p-5 mb-4">
      <div className="flex gap-3 mb-4">
        {LOG_TYPES.map(t => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className={cn(
              'flex-1 rounded-lg border py-1.5 text-xs font-medium transition-colors capitalize',
              type === t ? logTypeColor(t) : 'border-white/5 text-white/30 hover:border-white/10'
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="flex gap-3 mb-3">
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Title — what did you do / learn / struggle with?"
          className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/30 focus:border-indigo-500/50 focus:outline-none"
          autoFocus
        />
        <select
          value={weekNumber}
          onChange={e => setWeekNumber(Number(e.target.value))}
          className="rounded-lg border border-white/10 bg-surface-800 px-2 py-2 text-sm text-white/70 focus:outline-none"
        >
          {WEEKS.map(w => (
            <option key={w.id} value={w.number}>Week {w.number}</option>
          ))}
        </select>
      </div>

      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="Details... (what you built, what broke, what clicked, what to do next)"
        rows={4}
        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/30 focus:border-indigo-500/50 focus:outline-none resize-none mb-3"
      />

      <div className="flex items-center gap-2 mb-4">
        <div className="flex flex-wrap gap-1.5">
          {tags.map(tag => (
            <span key={tag} className="flex items-center gap-1 rounded-full bg-white/5 border border-white/10 px-2 py-0.5 text-xs text-white/50">
              {tag}
              <button type="button" onClick={() => setTags(tags.filter(t => t !== tag))} className="text-white/30 hover:text-white/60">
                <X size={10} />
              </button>
            </span>
          ))}
        </div>
        <input
          value={tagInput}
          onChange={e => setTagInput(e.target.value)}
          onKeyDown={addTag}
          placeholder="Add tag, press Enter"
          className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-white/50 placeholder-white/20 focus:outline-none focus:border-white/20 w-40"
        />
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/40 hover:text-white/60 transition-colors"
        >
          <X size={13} /> Cancel
        </button>
        <button
          type="submit"
          className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-1.5 text-xs text-white hover:bg-indigo-500 transition-colors"
        >
          <Check size={13} /> Save Entry
        </button>
      </div>
    </form>
  )
}

export function LogPage() {
  const { logs, addLog, editLog, removeLog, progress } = useApp()
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterWeek, setFilterWeek] = useState<string>('all')

  const filtered = logs.filter(e => {
    if (filterType !== 'all' && e.type !== filterType) return false
    if (filterWeek !== 'all' && String(e.weekNumber) !== filterWeek) return false
    if (search && !e.title.toLowerCase().includes(search.toLowerCase()) &&
        !e.content.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const weekNumbers = [...new Set(logs.map(e => e.weekNumber))].sort((a, b) => b - a)

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Learning Log</h1>
          <p className="text-sm text-white/40 mt-0.5">{logs.length} entries — your engineering growth journal</p>
        </div>
        {!adding && (
          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-500 transition-colors"
          >
            <Plus size={15} /> New Entry
          </button>
        )}
      </div>

      {/* New entry form */}
      {adding && (
        <EntryForm
          currentWeek={progress.currentWeek}
          onSave={e => { addLog(e); setAdding(false) }}
          onCancel={() => setAdding(false)}
        />
      )}

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search entries..."
            className="w-full rounded-lg border border-white/10 bg-white/5 pl-8 pr-3 py-2 text-sm text-white placeholder-white/30 focus:border-indigo-500/50 focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={13} className="text-white/30" />
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="rounded-lg border border-white/10 bg-surface-800 px-2 py-2 text-xs text-white/60 focus:outline-none"
          >
            <option value="all">All types</option>
            {LOG_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select
            value={filterWeek}
            onChange={e => setFilterWeek(e.target.value)}
            className="rounded-lg border border-white/10 bg-surface-800 px-2 py-2 text-xs text-white/60 focus:outline-none"
          >
            <option value="all">All weeks</option>
            {weekNumbers.map(n => <option key={n} value={n}>Week {n}</option>)}
          </select>
        </div>
      </div>

      {/* Entries */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/10 py-16 text-center">
          <p className="text-white/30 text-sm">No entries found</p>
          <button
            onClick={() => setAdding(true)}
            className="mt-3 text-xs text-indigo-400 hover:text-indigo-300"
          >
            Add your first entry
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(entry => {
            if (editingId === entry.id) {
              return (
                <EntryForm
                  key={entry.id}
                  initial={entry}
                  currentWeek={progress.currentWeek}
                  onSave={e => { editLog({ ...e, id: entry.id }); setEditingId(null) }}
                  onCancel={() => setEditingId(null)}
                />
              )
            }
            return (
              <div
                key={entry.id}
                className="rounded-xl border border-white/5 bg-white/[0.02] p-4 hover:border-white/10 transition-colors"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={logTypeColor(entry.type)}>{entry.type}</Badge>
                    <span className="text-xs text-white/30">Week {entry.weekNumber}</span>
                    <span className="text-xs text-white/20">{formatDate(entry.date)}</span>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => setEditingId(entry.id)}
                      className="p-1.5 rounded text-white/20 hover:text-white/50 hover:bg-white/5 transition-colors"
                    >
                      <Edit3 size={13} />
                    </button>
                    <button
                      onClick={() => removeLog(entry.id)}
                      className="p-1.5 rounded text-white/20 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
                <h3 className="text-sm font-semibold text-white mb-1">{entry.title}</h3>
                {entry.content && (
                  <p className="text-sm text-white/50 whitespace-pre-wrap">{entry.content}</p>
                )}
                {entry.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {entry.tags.map(tag => (
                      <span
                        key={tag}
                        className="rounded-full bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] text-white/40"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
