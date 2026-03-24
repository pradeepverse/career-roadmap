import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { LogEntry, ProgressState } from '../types'
import { loadProgress, saveProgress, loadLogs, saveLog, deleteLog } from '../lib/storage'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'

interface AppContextValue {
  // Auth
  user: User | null
  signInWithGitHub: () => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<string | null>
  signUpWithEmail: (email: string, password: string) => Promise<string | null>
  signOut: () => Promise<void>
  // Progress
  progress: ProgressState
  toggleDeliverable: (deliverableId: string) => void
  updateCounter: (key: 'dsaCount' | 'starStoryCount' | 'blogCount' | 'projectCount', value: number) => void
  setCurrentWeek: (week: number) => void
  setStartDate: (date: string) => void
  // Logs
  logs: LogEntry[]
  addLog: (entry: Omit<LogEntry, 'id'>) => void
  editLog: (entry: LogEntry) => void
  removeLog: (id: string) => void
  // Helpers
  isSupabase: boolean
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [progress, setProgressState] = useState<ProgressState>({
    completedDeliverables: {},
    dsaCount: 0,
    starStoryCount: 0,
    blogCount: 0,
    projectCount: 0,
    currentWeek: 1,
    startDate: null,
  })
  const [logs, setLogs] = useState<LogEntry[]>([])

  // Load initial data
  useEffect(() => {
    async function init() {
      let currentUser: User | null = null
      if (isSupabaseConfigured && supabase) {
        const { data } = await supabase.auth.getSession()
        currentUser = data.session?.user ?? null
        setUser(currentUser)
        supabase.auth.onAuthStateChange((_event, session) => {
          setUser(session?.user ?? null)
        })
      }
      const [p, l] = await Promise.all([
        loadProgress(currentUser?.id),
        loadLogs(currentUser?.id),
      ])
      setProgressState(p)
      setLogs(l)
    }
    init()
  }, [])

  // Reload data when user changes
  useEffect(() => {
    async function reload() {
      const [p, l] = await Promise.all([
        loadProgress(user?.id),
        loadLogs(user?.id),
      ])
      setProgressState(p)
      setLogs(l)
    }
    if (user !== null) reload()
  }, [user?.id])

  const persistProgress = useCallback(
    (next: ProgressState) => {
      setProgressState(next)
      saveProgress(next, user?.id)
    },
    [user?.id]
  )

  const toggleDeliverable = useCallback(
    (id: string) => {
      setProgressState(prev => {
        const next = {
          ...prev,
          completedDeliverables: {
            ...prev.completedDeliverables,
            [id]: !prev.completedDeliverables[id],
          },
        }
        saveProgress(next, user?.id)
        return next
      })
    },
    [user?.id]
  )

  const updateCounter = useCallback(
    (key: 'dsaCount' | 'starStoryCount' | 'blogCount' | 'projectCount', value: number) => {
      setProgressState(prev => {
        const next = { ...prev, [key]: Math.max(0, value) }
        saveProgress(next, user?.id)
        return next
      })
    },
    [user?.id]
  )

  const setCurrentWeek = useCallback(
    (week: number) => {
      setProgressState(prev => {
        const next = { ...prev, currentWeek: week }
        saveProgress(next, user?.id)
        return next
      })
    },
    [user?.id]
  )

  const setStartDate = useCallback(
    (date: string) => {
      setProgressState(prev => {
        const next = { ...prev, startDate: date }
        saveProgress(next, user?.id)
        return next
      })
    },
    [user?.id]
  )

  const addLog = useCallback(
    (entry: Omit<LogEntry, 'id'>) => {
      const full: LogEntry = { ...entry, id: crypto.randomUUID() }
      setLogs(prev => [full, ...prev])
      saveLog(full, user?.id)
    },
    [user?.id]
  )

  const editLog = useCallback(
    (entry: LogEntry) => {
      setLogs(prev => prev.map(e => (e.id === entry.id ? entry : e)))
      saveLog(entry, user?.id)
    },
    [user?.id]
  )

  const removeLog = useCallback(
    (id: string) => {
      setLogs(prev => prev.filter(e => e.id !== id))
      deleteLog(id, user?.id)
    },
    [user?.id]
  )

  // Auth methods
  const signInWithGitHub = async () => {
    if (!supabase) return
    await supabase.auth.signInWithOAuth({ provider: 'github' })
  }

  const signInWithEmail = async (email: string, password: string): Promise<string | null> => {
    if (!supabase) return 'Supabase not configured'
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return error?.message ?? null
  }

  const signUpWithEmail = async (email: string, password: string): Promise<string | null> => {
    if (!supabase) return 'Supabase not configured'
    const { error } = await supabase.auth.signUp({ email, password })
    return error?.message ?? null
  }

  const signOut = async () => {
    if (supabase) await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <AppContext.Provider
      value={{
        user,
        signInWithGitHub,
        signInWithEmail,
        signUpWithEmail,
        signOut,
        progress,
        toggleDeliverable,
        updateCounter,
        setCurrentWeek,
        setStartDate,
        logs,
        addLog,
        editLog,
        removeLog,
        isSupabase: isSupabaseConfigured,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
