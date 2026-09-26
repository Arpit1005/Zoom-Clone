'use client'

import { useEffect, useId, useRef } from 'react'
import { X } from 'lucide-react'

export function Modal({
  title,
  description,
  onClose,
  children,
}: {
  title: string
  description: string
  onClose: () => void
  children: React.ReactNode
}) {
  const titleId = useId()
  const descId = useId()
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    panelRef.current?.querySelector<HTMLElement>('input, textarea, select')?.focus()
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 animate-in fade-in duration-150" onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 rounded-md p-1 text-zoom-muted transition-colors hover:bg-zoom-field hover:text-zoom-ink"
        >
          <X className="size-4" />
        </button>
        <h2 id={titleId} className="text-xl font-bold text-zoom-ink">
          {title}
        </h2>
        <p id={descId} className="mt-1 text-sm text-zoom-muted">
          {description}
        </p>
        <div className="mt-5">{children}</div>
      </div>
    </div>
  )
}

export const fieldLabel = 'mb-1.5 block text-[13px] font-medium text-zoom-ink'
export const fieldInput =
  'h-10 w-full rounded-md border border-zoom-line bg-white px-3 text-sm text-zoom-ink outline-none transition-colors placeholder:text-zoom-muted/70 hover:border-[#cfd3da] focus:border-zoom-blue focus:ring-2 focus:ring-zoom-blue/20'
export const primaryBtn =
  'h-10 rounded-md bg-zoom-blue px-5 text-sm font-semibold text-white transition-colors hover:bg-zoom-blue-hover disabled:cursor-not-allowed disabled:opacity-50'
