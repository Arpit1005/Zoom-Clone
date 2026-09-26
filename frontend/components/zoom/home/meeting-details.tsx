'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import type { MeetingOut } from '@/lib/api'
import { useCurrentUser } from '@/lib/user-context'
import { EditMeetingModal } from '../modals/edit-meeting-modal'
import { AskAiButton, HostAvatar, InstantMeetingsBanner, JoinInfo, MeetingActionsRow, MeetingTitle } from './meeting-parts'

export function MeetingDetails({
  meeting,
  onClose,
  onDelete,
  onUpdate,
  onJoin,
}: {
  meeting: MeetingOut
  onClose: () => void
  onDelete: () => void
  onUpdate: (meeting: MeetingOut) => void
  onJoin: () => void
}) {
  const user = useCurrentUser()
  const [editOpen, setEditOpen] = useState(false)
  const isHost = user?.id === meeting.host.id
  const ref = useRef<HTMLElement>(null)

  // Retain the click-outside listener so it can be dismissed smoothly
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (ref.current?.contains(target) || target.closest('[data-meeting-row]')) return
      onClose()
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  return (
    <section
      ref={ref}
      aria-label="Meeting details"
      className="mx-auto flex min-h-full w-full max-w-3xl flex-col gap-4 bg-white px-5 py-5 shadow-sm animate-in fade-in zoom-in-95 duration-150 md:my-6 md:min-h-0 md:rounded-xl md:border md:border-zoom-line md:px-8 md:py-6"
    >
      <MeetingActionsRow onClose={onClose} onEdit={() => setEditOpen(true)} onDelete={onDelete} isHost={isHost} />
      <InstantMeetingsBanner />
      <MeetingTitle meeting={meeting} size="lg" />

      <div className="flex items-center gap-2.5">
        <HostAvatar name={meeting.host.name} seed={meeting.host.id} size={30} />
        <p className="text-[13px] text-zoom-ink">
          {meeting.host.name} <span className="text-zoom-muted">(Host)</span>
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <AskAiButton />
        {meeting.status === 'ended' ? (
          <span className="text-[13px] text-zoom-muted">This meeting has ended</span>
        ) : isHost ? (
          <Link
            href={`/meeting/${encodeURIComponent(meeting.meeting_id)}`}
            className="inline-flex h-8 items-center rounded-md bg-zoom-blue px-4 text-[13px] font-semibold text-white transition-colors hover:bg-zoom-blue-hover"
          >
            Start
          </Link>
        ) : (
          <button
            type="button"
            onClick={onJoin}
            className="inline-flex h-8 items-center rounded-md bg-zoom-blue px-4 text-[13px] font-semibold text-white transition-colors hover:bg-zoom-blue-hover"
          >
            Join
          </button>
        )}
      </div>
      <JoinInfo meeting={meeting} isHost={isHost} />

      <div className="flex flex-1 flex-col items-center justify-center gap-3 py-12">
        <Image
          src="/images/empty-details.png"
          alt=""
          width={200}
          height={200}
          className="size-40 object-contain mix-blend-multiply md:size-48"
        />
        <p className="text-sm text-zoom-muted">No event details</p>
      </div>
      
      {editOpen && (
        <EditMeetingModal
          meeting={meeting}
          onClose={() => setEditOpen(false)}
          onSaved={onUpdate}
        />
      )}
    </section>
  )
}