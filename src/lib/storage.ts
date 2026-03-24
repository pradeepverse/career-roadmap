/**
 * Storage abstraction — works with localStorage by default.
 * When Supabase is configured, syncs to the cloud.
 */
import type { LogEntry, ProgressState } from '../types'
import { supabase, isSupabaseConfigured } from './supabase'

const LS_PROGRESS = 'roadmap_progress'
const LS_LOGS = 'roadmap_logs'

// ─── Progress ────────────────────────────────────────────────────────────────

function defaultProgress(): ProgressState {
  return {
    completedDeliverables: {},
    dsaCount: 0,
    starStoryCount: 0,
    blogCount: 0,
    projectCount: 0,
    currentWeek: 1,
    startDate: null,
  }
}

export async function loadProgress(userId?: string): Promise<ProgressState> {
  if (isSupabaseConfigured && supabase && userId) {
    const { data, error } = await supabase
      .from('progress')
      .select('*')
      .eq('user_id', userId)
      .single()
    if (!error && data) {
      return data.state as ProgressState
    }
  }
  const raw = localStorage.getItem(LS_PROGRESS)
  return raw ? (JSON.parse(raw) as ProgressState) : defaultProgress()
}

export async function saveProgress(state: ProgressState, userId?: string): Promise<void> {
  localStorage.setItem(LS_PROGRESS, JSON.stringify(state))

  if (isSupabaseConfigured && supabase && userId) {
    await supabase.from('progress').upsert({
      user_id: userId,
      state,
      updated_at: new Date().toISOString(),
    })
  }
}

// ─── Log Entries ──────────────────────────────────────────────────────────────

export async function loadLogs(userId?: string): Promise<LogEntry[]> {
  if (isSupabaseConfigured && supabase && userId) {
    const { data, error } = await supabase
      .from('log_entries')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
    if (!error && data) return data as LogEntry[]
  }
  const raw = localStorage.getItem(LS_LOGS)
  const entries: LogEntry[] = raw ? JSON.parse(raw) : []
  return entries.sort((a, b) => b.date.localeCompare(a.date))
}

export async function saveLog(entry: LogEntry, userId?: string): Promise<void> {
  const raw = localStorage.getItem(LS_LOGS)
  const entries: LogEntry[] = raw ? JSON.parse(raw) : []
  const idx = entries.findIndex(e => e.id === entry.id)
  if (idx >= 0) entries[idx] = entry
  else entries.unshift(entry)
  localStorage.setItem(LS_LOGS, JSON.stringify(entries))

  if (isSupabaseConfigured && supabase && userId) {
    await supabase.from('log_entries').upsert({ ...entry, user_id: userId })
  }
}

export async function deleteLog(entryId: string, userId?: string): Promise<void> {
  const raw = localStorage.getItem(LS_LOGS)
  const entries: LogEntry[] = raw ? JSON.parse(raw) : []
  localStorage.setItem(LS_LOGS, JSON.stringify(entries.filter(e => e.id !== entryId)))

  if (isSupabaseConfigured && supabase && userId) {
    await supabase.from('log_entries').delete().eq('id', entryId).eq('user_id', userId)
  }
}

// ─── Public profile (for share page) ─────────────────────────────────────────

export async function loadPublicProfile(userId: string): Promise<{ progress: ProgressState; logs: LogEntry[] } | null> {
  if (!isSupabaseConfigured || !supabase) return null
  const [{ data: progData }, { data: logData }] = await Promise.all([
    supabase.from('progress').select('state').eq('user_id', userId).single(),
    supabase.from('log_entries').select('*').eq('user_id', userId).order('date', { ascending: false }).limit(20),
  ])
  if (!progData) return null
  return {
    progress: progData.state as ProgressState,
    logs: (logData ?? []) as LogEntry[],
  }
}
