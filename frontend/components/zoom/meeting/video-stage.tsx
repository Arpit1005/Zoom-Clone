'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { Hand, Mic, MicOff, Pin, PinOff } from 'lucide-react'
import type { ParticipantOut } from '@/lib/api'
import { cn } from '@/lib/utils'
import { Avatar } from '../avatar'
import LocalMediaStream from './local-video-render' // Added import

function NameLabel({ p, isYou }: { p: ParticipantOut; isYou: boolean }) {
  return (
    <span className="absolute bottom-2 left-2 z-10 inline-flex max-w-[calc(100%-1rem)] items-center gap-1.5 rounded-md bg-black/60 px-2 py-1 text-xs text-white backdrop-blur-sm">
      {p.is_muted ? (
        <MicOff className="size-3.5 shrink-0 text-zoom-red" aria-label="Muted" />
      ) : (
        <Mic className="size-3.5 shrink-0" aria-label="Unmuted" />
      )}
      <span className="truncate">
        {p.display_name}
        {isYou && ' (You)'}
      </span>
    </span>
  )
}

function Tile({
  p,
  isYou,
  variant,
  onClick,
  pinned,
  onPin,
}: {
  p: ParticipantOut
  isYou: boolean
  variant: 'main' | 'side' | 'gallery'
  onClick?: () => void
  pinned: boolean
  onPin: () => void
}) {
  const isMain = variant === 'main'
  const isGallery = variant === 'gallery'
  const reactionIsFresh = p.reaction && p.reaction_at && Date.now() - new Date(p.reaction_at).getTime() <= 3000
  const [reactionState, setReactionState] = useState<'visible' | 'fading' | 'hidden'>('hidden')

  useEffect(() => {
    if (!reactionIsFresh) {
      setReactionState('hidden')
      return
    }
    setReactionState('visible')
    const fadeTimer = window.setTimeout(() => setReactionState('fading'), 2500)
    const hideTimer = window.setTimeout(() => setReactionState('hidden'), 3000)
    return () => {
      window.clearTimeout(fadeTimer)
      window.clearTimeout(hideTimer)
    }
  }, [p.reaction, p.reaction_at, reactionIsFresh])

  return (
    <div className={cn('group relative', isMain ? 'h-full' : 'w-full')}>
      {isMain ? (
        <div className="relative h-full min-h-[240px] overflow-hidden rounded-lg border-[3px] border-zoom-speaker bg-zoom-room-2">
          <TileContent p={p} isYou={isYou} isMain />
        </div>
      ) : (
        <button
          type="button"
          onClick={onClick}
          aria-label={`Spotlight ${p.display_name}`}
          className={cn(
            'relative flex w-full items-center justify-center overflow-hidden rounded-lg bg-zoom-room-2',
            isGallery ? 'aspect-video min-h-[180px] border border-white/5' : 'aspect-video w-40 md:w-48 shrink-0 border border-white/5 transition hover:border-white/30',
          )}
        >
          <TileContent p={p} isYou={isYou} />
        </button>
      )}
      <span className={cn('absolute top-2 left-2 z-20 inline-flex size-9 items-center justify-center rounded-full bg-amber-400 text-black opacity-0 shadow-lg transition-opacity duration-150', p.is_hand_raised && 'opacity-100')} aria-label={p.is_hand_raised ? `${p.display_name} has raised a hand` : undefined}>
          <Hand className="size-4" />
      </span>
      {reactionState !== 'hidden' && (
        <span className={cn('absolute top-2 left-2 z-20 inline-flex size-9 items-center justify-center rounded-full bg-black/60 text-2xl transition-opacity duration-500', reactionState === 'fading' ? 'opacity-0' : 'opacity-100')} aria-label={`${p.display_name} reaction`}>
          {p.reaction}
        </span>
      )}
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation()
          onPin()
        }}
        aria-label={pinned ? `Unpin ${p.display_name}` : `Pin ${p.display_name}`}
        title={pinned ? 'Unpin participant' : 'Pin participant'}
        className={cn(
          'absolute top-2 right-2 z-20 rounded-md bg-black/60 p-1.5 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 focus-visible:opacity-100',
          pinned && 'opacity-100 text-zoom-blue',
        )}
      >
        {pinned ? <PinOff className="size-3.5" /> : <Pin className="size-3.5" />}
      </button>
    </div>
  )
}

function TileContent({ p, isYou, isMain = false }: { p: ParticipantOut; isYou: boolean; isMain?: boolean }) {
  return (
    <>
      {isYou && p.is_video_on ? (
        // 1. If it's you and your video is on, show the live webcam
        <div className="absolute inset-0 h-full w-full">
          <LocalMediaStream />
        </div>
      ) : p.is_video_on && p.user?.avatar_url && !p.user.avatar_url.startsWith('/avatars/') ? (
        // 2. If it's someone else with video on (simulated with avatar Image)
        <Image
          src={p.user.avatar_url}
          alt={`${p.display_name} camera feed`}
          fill
          sizes={isMain ? '75vw' : '30vw'}
          className="origin-top scale-110 object-cover"
          priority={isMain}
        />
      ) : (
        // 3. If video is off, show the initials Avatar circle
        <Avatar 
          name={p.display_name} 
          seed={p.user?.id ?? p.display_name} 
          size={100} 
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" 
        />
      )}
      <NameLabel p={p} isYou={isYou} />
    </>
  )
}

export function VideoStage({
  participants,
  speakerId,
  youId,
  onSpotlight,
  layout,
  pinnedId,
  onPin,
}: {
  participants: ParticipantOut[]
  speakerId: string
  youId: string
  onSpotlight: (id: string) => void
  layout: 'dynamic' | 'gallery'
  pinnedId: string | null
  onPin: (id: string) => void
}) {
  if (layout === 'gallery') {
    return (
      <div className="grid min-h-0 flex-1 content-center justify-center grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3 overflow-y-auto p-3 md:p-4">
        {participants.map((p) => (
          <Tile
            key={p.id}
            p={p}
            isYou={String(p.id) === youId}
            variant="gallery"
            onClick={() => onSpotlight(String(p.id))}
            pinned={pinnedId === String(p.id)}
            onPin={() => onPin(String(p.id))}
          />
        ))}
      </div>
    )
  }

  const speaker = participants.find((p) => String(p.id) === (pinnedId ?? speakerId)) ?? participants[0]
  if (!speaker) return null
  const others = participants
    .filter((p) => p.id !== speaker.id)
    .sort((a, b) => Number(b.is_video_on) - Number(a.is_video_on))

  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 p-3 md:p-4">
      {others.length > 0 && (
        <div className="flex shrink-0 flex-row gap-3 overflow-x-auto md:h-[120px]">
          {others.map((p) => (
            <div key={p.id} className={cn('flex flex-1', p.is_video_on ? 'md:flex-none' : 'md:flex-1')}>
              <Tile
                p={p}
                isYou={String(p.id) === youId}
                variant="side"
                onClick={() => onSpotlight(String(p.id))}
                pinned={pinnedId === String(p.id)}
                onPin={() => onPin(String(p.id))}
              />
            </div>
          ))}
        </div>
      )}
      <div className="h-full min-h-0 min-w-0 w-full flex-1">
        <Tile
          p={speaker}
          isYou={String(speaker.id) === youId}
          variant="main"
          pinned={pinnedId === String(speaker.id)}
          onPin={() => onPin(String(speaker.id))}
        />
      </div>
      
    </div>
  )
}
