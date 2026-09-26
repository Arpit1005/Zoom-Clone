import { cn } from '@/lib/utils'

export function ZoomLogo({ variant = 'light', className }: { variant?: 'light' | 'dark'; className?: string }) {
  return (
    <span className={cn('flex flex-col leading-none select-none', className)} aria-label="Zoom Workplace">
      <span
        className={cn(
          'text-[22px] font-extrabold tracking-[-0.04em] lowercase',
          variant === 'light' ? 'text-zoom-blue' : 'text-white',
        )}
      >
        zoom
      </span>
      <span
        className={cn(
          '-mt-0.5 text-[11px] font-normal tracking-tight',
          variant === 'light' ? 'text-zoom-ink' : 'text-white/70',
        )}
      >
        Workplace
      </span>
    </span>
  )
}
