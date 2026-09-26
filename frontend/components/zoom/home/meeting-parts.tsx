'use client'

import { useState } from 'react'
import { Check, ChevronDown, Clock, Copy, Ellipsis, Link2, Pencil, Sparkles, Trash2, Video, X } from 'lucide-react'
import type { MeetingOut } from '@/lib/api'
import { formatMeetingShortDate, formatMeetingTime } from '@/lib/api'
import { InfoBanner } from '../info-banner'
import { Avatar } from '../avatar'

const smallIcon =
  'inline-flex size-7 items-center justify-center rounded-md text-zoom-muted transition-colors hover:bg-zoom-field hover:text-zoom-ink'

export function MeetingActionsRow({ onClose, onEdit, onDelete, isHost = false }: { onClose: () => void; onEdit?: () => void; onDelete?: () => void; isHost?: boolean }) {
  return (
    <div className="flex items-center justify-end gap-0.5">
      {isHost && <button type="button" className={smallIcon} aria-label="Edit meeting" onClick={onEdit}>
        <Pencil className="size-4" />
      </button>}
      {isHost && <button type="button" className={smallIcon} aria-label="Delete meeting" onClick={onDelete}>
        <Trash2 className="size-4" />
      </button>}
      <button type="button" className={smallIcon} aria-label="More options">
        <Ellipsis className="size-4" />
      </button>
      <button type="button" className={`${smallIcon} text-zoom-blue`} aria-label="AI Companion">
        <Sparkles className="size-4" />
      </button>
      <button type="button" className={smallIcon} aria-label="Close" onClick={onClose}>
        <X className="size-4" />
      </button>
    </div>
  )
}

export function InstantMeetingsBanner() {
  const [show, setShow] = useState(true)
  if (!show) return null
  return (
    <InfoBanner onDismiss={() => setShow(false)} className="text-xs">
      Instant meetings are now displayed on your calendar. You can manage this in your{' '}
      <a href="#filter" className="font-medium text-zoom-blue hover:underline">
        filter
      </a>
      .
    </InfoBanner>
  )
}

export function MeetingTitle({ meeting, size = 'md' }: { meeting: MeetingOut; size?: 'md' | 'lg' }) {
  return (
    <div className="flex flex-col gap-1.5">
      <h2 className={`flex items-start gap-2 font-bold text-zoom-ink ${size === 'lg' ? 'text-xl' : 'text-[17px]'}`}>
        <Video className="mt-1 size-4 shrink-0 text-zoom-blue" aria-hidden="true" />
        <span className="text-balance">{meeting.title}</span>
      </h2>
      <p className="flex items-center gap-2 text-[13px] text-zoom-muted">
        <Clock className="size-4 shrink-0" aria-hidden="true" />
        {formatMeetingShortDate(meeting)}, {formatMeetingTime(meeting)}
      </p>
    </div>
  )
}

export function AskAiButton() {
  return (
    <button
      type="button"
      className="inline-flex h-8 w-fit items-center gap-1.5 rounded-full bg-zoom-field px-3 text-[13px] font-medium text-zoom-ink transition-colors hover:bg-[#e6e7ea]"
    >
      <Sparkles className="size-3.5 text-zoom-blue" aria-hidden="true" />
      Ask AI
      <ChevronDown className="size-3.5 text-zoom-muted" aria-hidden="true" />
    </button>
  )
}

export function HostAvatar({ name, seed, size = 32 }: { name: string; seed: string | number; size?: number }) {
  return (
    <span className="relative shrink-0">
      <Avatar name={name} seed={seed} size={size} />
      <span className="absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full border-2 border-white bg-zoom-speaker" />
    </span>
  )
}

export function JoinInfo({ meeting, isHost }: { meeting: MeetingOut; isHost: boolean }) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState<'meeting-id' | 'passcode' | 'link' | null>(null)

  const copy = async (value: string, kind: 'meeting-id' | 'passcode') => {
    await navigator.clipboard?.writeText(value).catch(() => {})
    setCopied(kind)
    setTimeout(() => setCopied(null), 1500)
  }

  const copyInviteLink = async () => {
    const encodedPwd = encodeURIComponent(meeting.passcode || '')
    let baseDomain = window.location.origin
    
    if (baseDomain.includes('localhost')) {
      baseDomain = baseDomain.replace('localhost', '192.168.1.21')
    }

    const inviteUrl = `${baseDomain}/join/${meeting.meeting_id.replace(/\s/g, '')}?pwd=${encodedPwd}`
    
    await navigator.clipboard?.writeText(inviteUrl).catch(() => {})
    setCopied('link')
    setTimeout(() => setCopied(null), 1500)
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="text-[13px] font-medium text-zoom-blue hover:underline"
      >
        View join info
      </button>
      {open && (
        <div className="mt-2 flex w-full max-w-sm items-start gap-2.5 rounded-lg border border-zoom-line bg-white px-3 py-2.5 shadow-md">
          <Link2 className="mt-0.5 size-4 shrink-0 text-zoom-muted" aria-hidden="true" />
          <div className="flex flex-1 flex-col gap-1 text-[13px] text-zoom-ink">
            <div className="flex items-center gap-2">
              <span>Meeting ID: <span className="font-semibold tabular-nums">{meeting.meeting_id}</span></span>
              <button
                type="button"
                onClick={() => copy(meeting.meeting_id, 'meeting-id')}
                aria-label={copied === 'meeting-id' ? 'Meeting ID copied' : 'Copy meeting ID'}
                className="rounded-md p-1 text-zoom-muted transition-colors hover:bg-zoom-field hover:text-zoom-blue"
              >
                {copied === 'meeting-id' ? <Check className="size-3.5 text-zoom-speaker" /> : <Copy className="size-3.5" />}
              </button>
            </div>
            
            {isHost === true && meeting.passcode !== null && meeting.passcode !== undefined && meeting.status !== 'ended' && (
              <div className="flex items-center gap-2">
                <span>Passcode: <span className="font-semibold tabular-nums">{meeting.passcode}</span></span>
                <button
                  type="button"
                  onClick={() => copy(meeting.passcode as string, 'passcode')}
                  aria-label={copied === 'passcode' ? 'Passcode copied' : 'Copy passcode'}
                  className="rounded-md p-1 text-zoom-muted transition-colors hover:bg-zoom-field hover:text-zoom-blue"
                >
                  {copied === 'passcode' ? <Check className="size-3.5 text-zoom-speaker" /> : <Copy className="size-3.5" />}
                </button>
              </div>
            )}
            {meeting.status != 'ended' && (
            <div className="mt-1 flex items-center gap-2 border-t border-zoom-line pt-1.5">
              <span>Invite Link</span>
              <button
                type="button"
                onClick={copyInviteLink}
                aria-label={copied === 'link' ? 'Invite link copied' : 'Copy invite link'}
                className="rounded-md p-1 text-zoom-muted transition-colors hover:bg-zoom-field hover:text-zoom-blue"
              >
                {copied === 'link' ? <Check className="size-3.5 text-zoom-speaker" /> : <Copy className="size-3.5" />}
              </button>
            </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}