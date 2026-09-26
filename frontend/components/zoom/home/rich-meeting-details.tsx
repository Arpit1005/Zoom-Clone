'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { 
  Clock, 
  Video, 
  MessageCircle, 
  Sparkles, 
  MapPin, 
  Users, 
  UserPlus, 
  Paperclip, 
  FileText, 
  AlignLeft, 
  Pencil 
} from 'lucide-react'
import type { MeetingOut } from '@/lib/api'
import { useCurrentUser } from '@/lib/user-context'
import { EditMeetingModal } from '../modals/edit-meeting-modal'
import { HostAvatar, JoinInfo, MeetingActionsRow } from './meeting-parts'

export function RichMeetingDetails({
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

  const encodedPwd = encodeURIComponent(meeting.passcode || '')
  let baseDomain = typeof window !== 'undefined' ? window.location.origin : ''
  if (baseDomain.includes('localhost')) {
    baseDomain = baseDomain.replace('localhost', '192.168.1.21')
  }
  const inviteUrl = `${baseDomain}/join/${meeting.meeting_id.replace(/\s/g, '')}?pwd=${encodedPwd}`

  const meetingDate = new Date(meeting.start_time)
  const formattedDate = meetingDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  const timeString = meetingDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

  return (
    <section
      ref={ref}
      aria-label="Meeting details"
      className="flex w-full flex-col rounded-xl border border-zoom-line bg-white p-5 animate-in fade-in zoom-in-95 duration-150"
    >
      <MeetingActionsRow onClose={onClose} onEdit={() => setEditOpen(true)} onDelete={onDelete} isHost={isHost} />
      
      <div className="mt-2 flex flex-col gap-1">
        <h2 className="text-xl font-semibold text-zoom-ink">{meeting.title || `${user?.name}'s Zoom Meeting`}</h2>
        <div className="flex items-center gap-2 text-[13px] text-zoom-ink">
          <Clock className="size-4 text-zoom-muted" />
          <span>{formattedDate}, {timeString}</span>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-[13px] font-medium">
        {isHost ? (
          <Link
            href={`/meeting/${encodeURIComponent(meeting.meeting_id)}`}
            className="flex items-center gap-1.5 rounded-full bg-zoom-blue px-4 py-1.5 text-white transition-colors hover:bg-zoom-blue-hover"
          >
            <Video className="size-4" /> Start
          </Link>
        ) : (
          <button
            type="button"
            onClick={onJoin}
            className="flex items-center gap-1.5 rounded-full bg-zoom-blue px-4 py-1.5 text-white transition-colors hover:bg-zoom-blue-hover"
          >
            <Video className="size-4" /> Join
          </button>
        )}
        <button className="flex items-center gap-1.5 rounded-full border border-zoom-line bg-white px-4 py-1.5 text-zoom-ink transition-colors hover:bg-gray-50">
          <MessageCircle className="size-4" /> Chat
        </button>
        <button className="flex items-center gap-1.5 rounded-full border border-zoom-line bg-white px-4 py-1.5 text-zoom-ink transition-colors hover:bg-gray-50">
          <Sparkles className="size-4 text-blue-500" /> Ask AI
        </button>
      </div>

      <div className="mt-4">
        <JoinInfo meeting={meeting} isHost={isHost} />
      </div>

      <div className="mt-4 flex flex-col gap-4 border-t border-zoom-line pt-4">
        <div className="flex items-center gap-3 text-[13px]">
          <MapPin className="size-4 shrink-0 text-zoom-muted" />
          <a href={inviteUrl} className="truncate text-zoom-blue hover:underline">
            {inviteUrl}
          </a>
        </div>
        <div className="border-t border-zoom-line pt-4" />
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between text-[13px] text-zoom-ink">
            <div className="flex items-center gap-3">
              <Users className="size-4 text-zoom-muted" />
              <span>Invitees</span>
            </div>
            <button className="text-zoom-muted hover:text-zoom-ink"><UserPlus className="size-4" /></button>
          </div>
          <div className="ml-7 flex items-center gap-3">
            <HostAvatar name={meeting.host.name} seed={meeting.host.id} size={32} />
            <div className="flex flex-col text-[12px]">
              <span className="text-zoom-ink">{meeting.host.name} (Organizer)</span>
              <span className="text-zoom-muted">External</span>
            </div>
          </div>
        </div>
        <div className="border-t border-zoom-line pt-4" />
        <button className="flex items-center gap-3 text-[13px] text-zoom-blue hover:underline text-left">
          <Paperclip className="size-4 text-zoom-muted" /> Add attachments
        </button>
        <div className="border-t border-zoom-line pt-4" />
        <button className="flex items-center gap-3 text-[13px] text-zoom-blue hover:underline text-left">
          <FileText className="size-4 text-zoom-muted" /> Create agenda
        </button>
      </div>

      {editOpen && (
        <EditMeetingModal meeting={meeting} onClose={() => setEditOpen(false)} onSaved={onUpdate} />
      )}
    </section>
  )
}