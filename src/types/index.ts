export type DeliverableCategory = 'project' | 'dsa' | 'lld' | 'behavioral' | 'blog' | 'cloud' | 'other'

export interface Deliverable {
  id: string
  text: string
  category: DeliverableCategory
}

export interface DaySchedule {
  day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun'
  block1: string
  block2: string
  block3: string
}

export interface Week {
  id: string
  number: number
  phase: string
  theme: string
  description?: string
  schedule?: DaySchedule[]
  deliverables: Deliverable[]
  trackAFocus: string
  trackBFocus: string
  trackCFocus: string
  resources?: string[]
}

export interface Phase {
  id: string
  label: string
  name: string
  goal: string
  weekStart: number
  weekEnd: number
  color: string
  bgColor: string
  borderColor: string
}

export interface LogEntry {
  id: string
  weekNumber: number
  date: string
  title: string
  content: string
  tags: string[]
  type: 'learning' | 'reflection' | 'blocker' | 'win'
}

export interface ProgressState {
  completedDeliverables: Record<string, boolean>
  dsaCount: number
  starStoryCount: number
  blogCount: number
  projectCount: number
  currentWeek: number
  startDate: string | null
}
