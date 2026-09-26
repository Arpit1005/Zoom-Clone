'use client'

import { useEffect, useRef, useState } from 'react'
import type { MeetingOut } from '@/lib/api'
import { useCurrentUser } from '@/lib/user-context'
import { EditMeetingModal } from '../modals/edit-meeting-modal'
import { AskAiButton, HostAvatar, InstantMeetingsBanner, JoinInfo, MeetingActionsRow, MeetingTitle } from './meeting-parts'

type Props = {
  meeting: MeetingOut
  onClose: () => void
  onViewDetails: () => void
  onDelete: () => void
  onUpdate: (meeting: MeetingOut) => void
}

export function MeetingPopover({ meeting, onClose, onViewDetails, onDelete, onUpdate }: Props) {
  const user = useCurrentUser()
  const [editOpen, setEditOpen] = useState(false)
  const isHost = user?.id === meeting.host.id
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (ref.current?.contains(target) || target.closest('[data-meeting-row]')) return
      onClose()
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    ref.current?.focus()
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  return (
    <div
      ref={ref}
      role="dialog"
      aria-label={meeting.title}
      tabIndex={-1}
      className="absolute top-[calc(100%-8px)] right-2 z-30 flex w-[min(380px,calc(100vw-2rem))] flex-col gap-3 rounded-xl border border-zoom-line bg-white p-4 shadow-[0_12px_40px_-8px_rgba(16,24,40,0.25)] outline-none animate-in fade-in zoom-in-95 duration-150 sm:left-auto"
    >
      <MeetingActionsRow onClose={onClose} onEdit={() => setEditOpen(true)} onDelete={onDelete} isHost={isHost} />
      <InstantMeetingsBanner />
      <MeetingTitle meeting={meeting} />
      <AskAiButton />
      <JoinInfo meeting={meeting} isHost={isHost} />

      <div className="h-px bg-zoom-line" />

      <div className="flex flex-col gap-2">
        <p className="text-[11px] font-semibold tracking-wider text-zoom-muted uppercase">Invitees</p>
        <div className="flex items-center gap-2.5">
          <HostAvatar name={meeting.host.name} seed={meeting.host.id} size={28} />
          <p className="text-[13px] text-zoom-ink">
            {meeting.host.name} <span className="text-zoom-muted">(Host)</span>
          </p>
        </div>
      </div>

      <div className="h-px bg-zoom-line" />

      <button
        type="button"
        onClick={onViewDetails}
        className="h-9 w-full rounded-lg bg-zoom-field text-[13px] font-semibold text-zoom-ink transition-colors hover:bg-zoom-blue-soft hover:text-zoom-blue"
      >
        View full details
      </button>
      {editOpen && (
        <EditMeetingModal
          meeting={meeting}
          onClose={() => setEditOpen(false)}
          onSaved={onUpdate}
        />
      )}
    </div>
  )
}
