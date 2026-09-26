'use client'

import { useEffect, useRef, useState } from 'react'
import {
  Captions,
  ChevronUp,
  Circle,
  CircleDot,
  CircleEllipsis,
  CircleX,
  FileText,
  Hand,
  Heart,
  Info,
  MessageCircle,
  Mic,
  MicOff,
  Presentation,
  Settings,
  Shapes,
  Shield,
  Square,
  SquareArrowUp,
  Users,
  Video,
  VideoOff,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type MenuKey = 'audio' | 'video' | 'participants' | 'chat' | 'react' | 'share' | 'host' | 'more' | 'end'

type Props = {
  muted: boolean
  videoOn: boolean
  participantCount: number
  panel: 'participants' | 'chat' | 'host-tools' | null
  isHost: boolean
  handRaised: boolean
  isRecording: boolean
  onToggleMute: () => void
  onToggleVideo: () => void
  onToggleHand: () => void
  onReaction: (reaction: string) => void
  onToggleRecording: () => void
  onTogglePanel: (p: 'participants' | 'chat' | 'host-tools') => void
  onLeave: () => void
  onEnd: () => void
}

function Menu({ items, onPick }: { items: string[]; onPick: () => void }) {
  return (
    <div
      role="menu"
      className="absolute bottom-[calc(100%+8px)] left-1/2 z-40 w-56 -translate-x-1/2 rounded-lg border border-white/10 bg-zoom-room-3 p-1 shadow-2xl"
    >
      {items.map((it, i) =>
        it === '---' ? (
          <div key={i} className="my-1 h-px bg-white/10" />
        ) : (
          <button
            key={it}
            role="menuitem"
            type="button"
            onClick={onPick}
            className="w-full rounded-md px-3 py-1.5 text-left text-[13px] text-white/90 hover:bg-white/10"
          >
            {it}
          </button>
        ),
      )}
    </div>
  )
}

function ToolbarItem({
  icon: Icon,
  label,
  onClick,
  menuKey,
  openMenu,
  setOpenMenu,
  menuItems,
  hasCaret,
  danger,
  active,
  badge,
  className,
}: {
  icon: LucideIcon
  label: string
  onClick?: () => void
  menuKey: MenuKey
  openMenu: MenuKey | null
  setOpenMenu: (k: MenuKey | null) => void
  menuItems?: string[]
  hasCaret?: boolean
  danger?: boolean
  active?: boolean
  badge?: number
  className?: string
}) {
  const open = openMenu === menuKey
  const showCaret = hasCaret || !!menuItems

  return (
    <div className={cn('relative flex items-stretch', className)}>
      <button
        type="button"
        onClick={onClick ?? (() => setOpenMenu(open ? null : menuKey))}
        aria-pressed={active}
        className={cn(
          'flex min-w-[52px] flex-col items-center gap-1 rounded-lg px-2 py-1.5 transition-colors hover:bg-white/10 md:min-w-[64px]',
          active && 'bg-white/10',
        )}
      >
        <span className="relative">
          <Icon className={cn('size-[22px]', danger ? 'text-zoom-red' : 'text-white')} strokeWidth={1.5} aria-hidden="true" />
          {badge !== undefined && (
            <span className="absolute -top-1.5 -right-2.5 min-w-4 rounded-full bg-white/20 px-1 text-center text-[10px] leading-4 font-semibold text-white">
              {badge}
            </span>
          )}
        </span>
        <span className="text-[11px] whitespace-nowrap text-white/80">{label}</span>
      </button>
      {showCaret && (
        <button
          type="button"
          onClick={() => setOpenMenu(open ? null : menuKey)}
          aria-label={`${label} options`}
          aria-haspopup="menu"
          aria-expanded={open}
          className="-ml-1.5 mb-5 self-center rounded p-0.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
        >
          <ChevronUp className="size-3.5" />
        </button>
      )}
      {open && menuItems && menuItems.length > 0 && <Menu items={menuItems} onPick={() => setOpenMenu(null)} />}
    </div>
  )
}

export function MeetingToolbar({
  muted,
  videoOn,
  participantCount,
  panel,
  isHost,
  handRaised,
  isRecording,
  onToggleMute,
  onToggleVideo,
  onToggleHand,
  onReaction,
  onToggleRecording,
  onTogglePanel,
  onLeave,
  onEnd,
}: Props) {
  const [openMenu, setOpenMenu] = useState<MenuKey | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!openMenu) return
    const onDown = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpenMenu(null)
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpenMenu(null)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [openMenu])

  const common = { openMenu, setOpenMenu }

  return (
    <div
      ref={ref}
      role="toolbar"
      aria-label="Meeting controls"
      className="flex h-[68px] shrink-0 items-center gap-1 border-t border-white/5 bg-zoom-room px-2 md:px-4"
    >
      <div className="flex items-center">
        <ToolbarItem
          {...common}
          menuKey="audio"
          icon={muted ? MicOff : Mic}
          danger={muted}
          label="Audio"
          onClick={onToggleMute}
          menuItems={['MacBook Pro Microphone', 'AirPods Pro', '---', 'Test speaker & microphone', 'Audio settings']}
        />
        <ToolbarItem
          {...common}
          menuKey="video"
          icon={videoOn ? Video : VideoOff}
          danger={!videoOn}
          label="Video"
          onClick={onToggleVideo}
          menuItems={['FaceTime HD Camera', 'OBS Virtual Camera', '---', 'Choose virtual background', 'Video settings']}
        />
      </div>

      <div className="flex flex-1 items-center justify-center gap-0.5 md:gap-1">
        <ToolbarItem
          {...common}
          menuKey="participants"
          icon={Users}
          label="Participants"
          badge={participantCount}
          active={panel === 'participants'}
          onClick={() => onTogglePanel('participants')}
          menuItems={['Invite', 'Copy invite link']}
        />

        <ToolbarItem
          {...common}
          menuKey="chat"
          icon={MessageCircle}
          label="Chat"
          active={panel === 'chat'}
          onClick={() => onTogglePanel('chat')}
          menuItems={['Open in new window', 'Chat settings']}
          className="hidden sm:flex"
        />
        <div className="relative hidden md:flex">
          <ToolbarItem
            {...common}
            menuKey="react"
            icon={Heart}
            label="React"
            hasCaret
            onClick={() => setOpenMenu(openMenu === 'react' ? null : 'react')}
          />
          {openMenu === 'react' && (
            <div role="menu" className="absolute bottom-[calc(100%+8px)] left-1/2 z-40 flex flex-col -translate-x-1/2 gap-1.5 rounded-lg border border-white/10 bg-zoom-room-3 p-2 shadow-2xl">
              <div className="flex gap-1">
                {['👍', '❤️', '😂', '👏', '🎉'].map((reaction) => (
                  <button
                    key={reaction}
                    type="button"
                    role="menuitem"
                    aria-label={`Send ${reaction} reaction`}
                    onClick={() => {
                      onReaction(reaction)
                      setOpenMenu(null)
                    }}
                    className="rounded-md p-2 text-xl hover:bg-white/10"
                  >
                    {reaction}
                  </button>
                ))}
              </div>

              <div className="my-1 h-px bg-white/10" />

              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  onToggleHand()
                  setOpenMenu(null)
                }}
                className="flex w-full items-center justify-center gap-2 rounded-md px-3 py-1.5 text-[13px] text-white/90 hover:bg-white/10"
              >
                <Hand size={16} />
                <span>{handRaised ? 'Lower hand' : 'Raise hand'}</span>
              </button>
            </div>
          )}
        </div>
        <ToolbarItem
          {...common}
          menuKey="share"
          icon={SquareArrowUp}
          label="Share"
          hasCaret
          menuItems={['Share screen', 'Share a portion of screen', '---', 'Multiple participants can share']}
          onClick={() => setOpenMenu(openMenu === 'share' ? null : 'share')}
          className="hidden md:flex"
        />
        {isHost && (
          <ToolbarItem
            {...common}
            menuKey="host"
            icon={Shield}
            label="Host tools"
            active={panel === 'host-tools'}
            onClick={() => onTogglePanel('host-tools')}
            className="hidden lg:flex"
          />
        )}
        
        <div className="relative hidden sm:flex">
          <ToolbarItem
            {...common}
            menuKey="more"
            icon={CircleEllipsis}
            label="More"
            active={openMenu === 'more'}
            onClick={() => setOpenMenu(openMenu === 'more' ? null : 'more')}
          />
          {openMenu === 'more' && (
            <div
              role="menu"
              className="absolute bottom-[calc(100%+8px)] right-0 z-40 w-[270px] rounded-xl border border-white/10 bg-zoom-room-3 p-4 shadow-2xl"
            >
              <div className="grid grid-cols-3 gap-y-6 gap-x-2">
                {[
                  { id: 'record', icon: isRecording ? Square : CircleDot, label: isRecording ? 'Stop recording' : 'Record', danger: isRecording },
                  { id: 'cc', icon: Captions, label: 'Show captions' },
                  { id: 'docs', icon: FileText, label: 'Docs' },
                  { id: 'whiteboards', icon: Presentation, label: 'Whiteboards' },
                  { id: 'apps', icon: Shapes, label: 'Apps' },
                  { id: 'info', icon: Info, label: 'Meeting info' },
                  { id: 'settings', icon: Settings, label: 'Settings' },
                ].map((item) => (
                  <button
                    key={item.id}
                    className={cn(
                      "flex flex-col items-center gap-2 transition-colors hover:text-white", 
                      item.danger ? "text-zoom-red" : "text-white/80"
                    )}
                    onClick={() => {
                      if (item.id === 'record') onToggleRecording()
                      setOpenMenu(null)
                    }}
                  >
                    <item.icon className="size-[22px]" strokeWidth={1.2} />
                    <span className="text-[11px] leading-tight text-center">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="relative">
        <ToolbarItem
          {...common}
          menuKey="end"
          icon={CircleX}
          label={isHost ? 'End' : 'Leave'}
          danger
          onClick={() => setOpenMenu(openMenu === 'end' ? null : 'end')}
        />
        {openMenu === 'end' && (
          <div
            role="menu"
            className="absolute right-0 bottom-[calc(100%+8px)] z-40 flex w-56 flex-col gap-1.5 rounded-lg border border-white/10 bg-zoom-room-3 p-2 shadow-2xl"
          >
            {isHost && (
              <button
                role="menuitem"
                type="button"
                onClick={onEnd}
                className="h-9 rounded-md bg-zoom-red text-[13px] font-semibold text-white hover:bg-[#c41f1f]"
              >
                End meeting for all
              </button>
            )}
            <button
              role="menuitem"
              type="button"
              onClick={onLeave}
              className="h-9 rounded-md bg-white/10 text-[13px] font-medium text-white hover:bg-white/15"
            >
              Leave meeting
            </button>
          </div>
        )}
      </div>
    </div>
  )
}