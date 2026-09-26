'use client'

import { Info, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export function InfoBanner({
  children,
  onDismiss,
  className,
}: {
  children: React.ReactNode
  onDismiss: () => void
  className?: string
}) {
  return (
    <div
      role="status"
      className={cn('flex items-start gap-2.5 rounded-lg bg-zoom-blue-soft px-3.5 py-2.5 text-[13px] text-zoom-ink', className)}
    >
      <Info className="mt-px size-4 shrink-0 fill-zoom-blue text-white" aria-hidden="true" />
      <p className="flex-1 leading-snug">{children}</p>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss"
        className="-m-1 rounded p-1 text-zoom-muted transition-colors hover:bg-white/70 hover:text-zoom-ink"
      >
        <X className="size-4" />
      </button>
    </div>
  )
}
