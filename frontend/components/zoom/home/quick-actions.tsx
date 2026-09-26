'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CalendarDays, ChevronDown, MonitorUp, NotebookPen, SquarePlus, Video, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { api } from '@/lib/api'
import { useCurrentUser } from '@/lib/user-context'

type Props = {
  onJoin: () => void
  onSchedule: () => void
  onShare: () => void
}

function ActionTile({
  icon: Icon,
  label,
  color = 'blue',
  onClick,
  children,
}: {
  icon: LucideIcon
  label: string
  color?: 'blue' | 'orange'
  onClick?: () => void
  children?: React.ReactNode
}) {
  return (
    <div className="flex w-[76px] flex-col items-center gap-2">
      <button
        type="button"
        onClick={onClick}
        aria-label={label}
        className={cn(
          'flex size-12 items-center justify-center rounded-[14px] text-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2',
          color === 'orange'
            ? 'bg-zoom-orange hover:bg-zoom-orange-hover focus-visible:outline-zoom-orange'
            : 'bg-zoom-blue hover:bg-zoom-blue-hover focus-visible:outline-zoom-blue',
        )}
      >
        <Icon className="size-6" strokeWidth={2} aria-hidden="true" />
      </button>
      {children ?? <span className="text-xs text-zoom-ink">{label}</span>}
    </div>
  )
}

export function QuickActions({ onJoin, onSchedule, onShare }: Props) {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const user = useCurrentUser()
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    const onDown = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [menuOpen])

  const startMeeting = async (video = true) => {
    if (!user) return
    const meeting = await api.createInstantMeeting({})
    router.push(`/meeting/${meeting.meeting_id.replace(/\s/g, '')}${video ? '' : '?video=off'}`)
  }

  return (
    <div className="flex flex-wrap items-start justify-center gap-x-4 gap-y-5 sm:gap-x-8">
      <ActionTile icon={Video} label="New meeting" color="orange" onClick={() => startMeeting()}>
        <div ref={menuRef} className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            className="flex items-center gap-0.5 rounded px-1 text-xs whitespace-nowrap text-zoom-ink hover:bg-zoom-field"
          >
            New meeting
            <ChevronDown className="size-3.5 text-zoom-muted" aria-hidden="true" />
          </button>
          {menuOpen && (
            <div
              role="menu"
              className="absolute top-7 left-1/2 z-20 w-60 -translate-x-1/2 rounded-lg border border-zoom-line bg-white p-1 shadow-lg"
            >
              <button
                role="menuitem"
                type="button"
                onClick={() => startMeeting(true)}
                className="w-full rounded-md px-3 py-2 text-left text-[13px] hover:bg-zoom-field"
              >
                Start with video
              </button>
              <button
                role="menuitem"
                type="button"
                onClick={() => startMeeting(false)}
                className="w-full rounded-md px-3 py-2 text-left text-[13px] hover:bg-zoom-field"
              >
                Start without video
              </button>
              <div className="my-1 h-px bg-zoom-line" />
              <button
                role="menuitem"
                type="button"
                onClick={() => startMeeting(true)}
                className="w-full rounded-md px-3 py-2 text-left text-[13px] hover:bg-zoom-field"
              >
                Use my personal meeting ID
                <span className="block text-xs text-zoom-muted">Use a new meeting ID</span>
              </button>
            </div>
          )}
        </div>
      </ActionTile>
      <ActionTile icon={SquarePlus} label="Join" onClick={onJoin} />
      <ActionTile icon={CalendarDays} label="Schedule" onClick={onSchedule} />
      <ActionTile icon={MonitorUp} label="Share screen" onClick={onShare} />
      <ActionTile icon={NotebookPen} label="My Notes" />
    </div>
  )
}
