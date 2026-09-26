'use client'

import { useState } from 'react'
import { Check, Copy, Grip, Info, LayoutGrid, PenLine, ShieldCheck, Sparkles } from 'lucide-react'
import { ZoomLogo } from '../zoom-logo'

const darkIcon =
  'inline-flex size-8 items-center justify-center rounded-md text-white/80 transition-colors hover:bg-white/10 hover:text-white'

export function MeetingTopBar({
  meetingId,
  host,
  passcode,
  isHost,
  isRecording,
  layout,
  name,
  onToggleLayout,
}: {
  meetingId: string
  host: string
  name: string
  passcode?: string | null
  isHost: boolean
  isRecording: boolean
  layout: 'dynamic' | 'gallery'
  onToggleLayout: () => void
}) {
  const [infoOpen, setInfoOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    // 1. Provide a fallback string to satisfy TypeScript
    const encodedPwd = encodeURIComponent(passcode || '')
    
    // 2. Dynamically get the domain and swap localhost for your network IP
    let baseDomain = window.location.origin
    if (baseDomain.includes('localhost')) {
      baseDomain = baseDomain.replace('localhost', '192.168.1.21')
    }

    const inviteUrl = `${baseDomain}/join/${meetingId.replace(/\s/g, '')}?pwd=${encodedPwd}`

    await navigator.clipboard?.writeText(inviteUrl).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <header className="flex h-12 shrink-0 items-center gap-3 px-3 md:px-4">
      <ZoomLogo variant="dark" className="scale-90 origin-left" />
      <div className="relative flex min-w-0 items-center gap-1.5">
        <span className="h-5 w-px bg-white/15" aria-hidden="true" />
        <h1 className="ml-1.5 truncate text-[13px] font-medium text-white/90">{name}</h1>
        <button
          type="button"
          onClick={() => setInfoOpen((v) => !v)}
          aria-expanded={infoOpen}
          aria-label="Meeting information"
          className="rounded p-1 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
        >
          <Info className="size-3.5" />
        </button>
        {infoOpen && (
          <div className="absolute top-9 left-0 z-40 w-72 rounded-lg border border-white/10 bg-zoom-room-3 p-4 text-[13px] text-white shadow-2xl">
            <p className="font-semibold">{`${host}'s Zoom Meeting`}</p>
            <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-white/70">
              <dt>Meeting ID</dt>
              <dd className="text-white tabular-nums">{meetingId}</dd>
              <dt>Host</dt>
              <dd className="text-white">{host}</dd>
              {isHost === true && passcode !== null && passcode !== undefined && (
                <>
                  <dt>Passcode</dt>
                  <dd className="text-white tabular-nums">{passcode}</dd>
                </>
              )}
            </dl>
            <button
              type="button"
              onClick={copy}
              className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-medium text-[#5c95ff] hover:underline"
            >
              {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
              {copied ? 'Link copied' : 'Copy invite link'}
            </button>
          </div>
        )}
      </div>

      <div className="ml-auto flex items-center gap-1">
        {isRecording && <span className="inline-flex items-center gap-1 rounded-md bg-zoom-red px-2 py-1 text-xs font-semibold text-white animate-pulse" aria-label="Recording active">● REC</span>}
        <button
          type="button"
          onClick={onToggleLayout}
          aria-label={layout === 'gallery' ? 'Switch to dynamic layout' : 'Switch to gallery layout'}
          title={layout === 'gallery' ? 'Dynamic layout' : 'Gallery layout'}
          className={darkIcon}
        >
          <LayoutGrid className="size-[18px]" />
        </button>
        <span className={`${darkIcon} text-zoom-speaker hover:text-zoom-speaker`} title="Encrypted connection" aria-label="Encrypted connection">
          <ShieldCheck className="size-[18px]" />
        </span>
        <button type="button" className={`${darkIcon} hidden sm:inline-flex`} aria-label="Annotate">
          <PenLine className="size-[18px]" />
        </button>
        <button type="button" className={darkIcon} aria-label="AI Companion">
          <Sparkles className="size-[18px]" />
        </button>
      </div>
    </header>
  )
}
