'use client'

import { useEffect, useState } from 'react'
import { Mic, MicOff, SendHorizontal, Video, VideoOff, VolumeX, X } from 'lucide-react'
import { api, type MessageOut, type ParticipantOut } from '@/lib/api'

const timeFmt = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' })

export function SidePanel({
  kind,
  participants,
  youId,
  meetingId,
  onClose,
  onRemoveParticipant,
  onMuteAll,
}: {
  kind: 'participants' | 'chat' | 'host-tools'
  participants: ParticipantOut[]
  youId: string
  meetingId: string
  onClose: () => void
  onRemoveParticipant: (participantId: number) => void
  onMuteAll: () => void
}) {
  const [messages, setMessages] = useState<MessageOut[]>([])
  const [draft, setDraft] = useState('')
  const [hostAction, setHostAction] = useState<'mute-all' | number | null>(null)
  const [hostError, setHostError] = useState<string | null>(null)
  const you = participants.find((p) => String(p.id) === youId)

  useEffect(() => {
    if (kind !== 'chat') return

    const refreshMessages = async () => {
      try {
        setMessages(await api.getMessages(meetingId))
      } catch {
        // Keep the current chat visible during a temporary polling failure.
      }
    }

    void refreshMessages()
    const intervalId = window.setInterval(refreshMessages, 2000)
    return () => window.clearInterval(intervalId)
  }, [kind, meetingId])

  const send = async () => {
    const text = draft.trim()
    if (!text) return
    try {
      const message = await api.sendMessage(meetingId, text)
      setMessages((current) => [...current, message])
      setDraft('')
    } catch {
      // Keep the draft available when sending temporarily fails.
    }
  }

  return (
    <aside
      aria-label={kind === 'participants' ? 'Participants' : kind === 'host-tools' ? 'Host tools' : 'Meeting chat'}
      className="fixed inset-x-0 bottom-[68px] z-30 flex h-[60dvh] flex-col border-t border-white/10 bg-zoom-room-3 text-white md:order-last md:static md:ml-auto md:h-auto md:w-80 md:border-t-0 md:border-l"
    >
      <div className="flex h-11 shrink-0 items-center justify-between border-b border-white/10 px-4">
        <h2 className="text-sm font-semibold">
          {kind === 'participants' ? `Participants (${participants.length})` : kind === 'host-tools' ? 'Host tools' : 'Meeting Chat'}
        </h2>
        <button type="button" onClick={onClose} aria-label="Close panel" className="rounded p-1 text-white/60 hover:bg-white/10 hover:text-white">
          <X className="size-4" />
        </button>
      </div>

      {kind === 'host-tools' ? (
        <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-3">
          <button
            type="button"
            disabled={hostAction === 'mute-all'}
            onClick={async () => {
              setHostError(null)
              setHostAction('mute-all')
              try {
                await api.muteAll(meetingId)
                onMuteAll()
              } catch (error) {
                setHostError(error instanceof Error ? error.message : 'Unable to mute participants.')
              } finally {
                setHostAction(null)
              }
            }}
            className="flex h-9 items-center justify-center gap-2 rounded-md bg-white/10 text-[13px] font-semibold text-white transition-colors hover:bg-white/15 disabled:opacity-50"
          >
            <VolumeX className="size-4" />
            Mute All
          </button>
          {hostError && <p role="alert" className="text-xs text-zoom-red">{hostError}</p>}
          <ul className="flex flex-col gap-1">
            {participants.map((p) => (
              <li key={p.id} className="flex items-center gap-2 rounded-md px-2 py-2 hover:bg-white/5">
                <span className="flex size-8 items-center justify-center rounded-md bg-zoom-blue text-xs font-semibold">
                  {p.display_name.split(' ').map((name) => name[0]).join('')}
                </span>
                <span className="min-w-0 flex-1 truncate text-[13px]">
                  {p.display_name}
                  {String(p.id) === youId && <span className="text-white/50"> (You)</span>}
                </span>
                <button
                  type="button"
                  disabled={p.is_host || String(p.id) === youId || hostAction === p.id}
                  onClick={async () => {
                    setHostError(null)
                    setHostAction(p.id)
                    try {
                      await api.removeParticipant(p.id)
                      onRemoveParticipant(p.id)
                    } catch (error) {
                      setHostError(error instanceof Error ? error.message : 'Unable to remove participant.')
                    } finally {
                      setHostAction(null)
                    }
                  }}
                  className="rounded-md px-2 py-1 text-xs font-medium text-zoom-red transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : kind === 'participants' ? (
        <ul className="flex-1 overflow-y-auto p-2">
          {participants.map((p) => (
            <li key={p.id} className="flex items-center gap-3 rounded-md px-2 py-2 hover:bg-white/5">
              <span className="flex size-8 items-center justify-center rounded-md bg-zoom-blue text-xs font-semibold">
                {p.display_name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </span>
              <span className="flex-1 truncate text-[13px]">
                {p.display_name}
                {String(p.id) === youId && <span className="text-white/50"> (Host, me)</span>}
              </span>
              {p.is_muted ? <MicOff className="size-4 text-zoom-red" aria-label="Muted" /> : <Mic className="size-4" aria-label="Unmuted" />}
              {p.is_video_on ? <Video className="size-4" aria-label="Video on" /> : <VideoOff className="size-4 text-zoom-red" aria-label="Video off" />}
            </li>
          ))}
        </ul>
      ) : (
        <>
          <ul className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
            {messages.map((m) => (
              <li key={m.id}>
                <p className="text-xs text-white/50">
                  <span className="font-semibold text-white/80">{m.display_name}</span> · {timeFmt.format(new Date(m.created_at))}
                </p>
                <p className="mt-0.5 text-[13px] leading-snug text-white/90">{m.text}</p>
              </li>
            ))}
          </ul>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              send()
            }}
            className="flex items-center gap-2 border-t border-white/10 p-3"
          >
            <label htmlFor="chat-input" className="sr-only">
              Message everyone
            </label>
            <input
              id="chat-input"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Message everyone"
              className="h-9 flex-1 rounded-md border border-white/10 bg-white/5 px-3 text-[13px] text-white outline-none placeholder:text-white/40 focus:border-zoom-blue"
            />
            <button
              type="submit"
              aria-label="Send"
              disabled={!draft.trim()}
              className="rounded-md p-2 text-zoom-blue hover:bg-white/10 disabled:opacity-40"
            >
              <SendHorizontal className="size-4" />
            </button>
          </form>
        </>
      )}
    </aside>
  )
}
