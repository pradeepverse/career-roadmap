import { cn } from '../../lib/utils'

interface Props {
  value: number // 0–100
  className?: string
  size?: 'sm' | 'md' | 'lg'
  color?: string
}

export function ProgressBar({ value, className, size = 'md', color = 'bg-indigo-500' }: Props) {
  const heights = { sm: 'h-1', md: 'h-2', lg: 'h-3' }
  return (
    <div className={cn('w-full rounded-full bg-white/5', heights[size], className)}>
      <div
        className={cn('h-full rounded-full transition-all duration-500', color)}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
}
