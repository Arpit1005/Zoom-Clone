'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { useCurrentUser } from '@/lib/user-context'
import { Modal, fieldInput, fieldLabel, primaryBtn } from './modal'

export function JoinModal({
  onClose,
  initialMeetingId,
  initialPasscode,
  title = 'Join Meeting',
  description = 'Enter the meeting ID or paste the invite link.',
}: {
  onClose: () => void
  initialMeetingId?: string
  initialPasscode?: string
  title?: string
  description?: string
}) {
  const router = useRouter()
  const user = useCurrentUser()
  const [meetingId, setMeetingId] = useState(initialMeetingId ?? '')
  const [passcode, setPasscode] = useState(initialPasscode ?? '')
  const [name, setName] = useState(user?.name ?? '')
  const [noAudio, setNoAudio] = useState(false)
  const [videoOff, setVideoOff] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(!!initialPasscode)
  
  const autoJoinAttempted = useRef(false)

  useEffect(() => {
    if (user && !name) setName(user.name)
  }, [name, user])

  const digits = meetingId.match(/\d{9,11}/)?.[0] ?? meetingId.replace(/\D/g, '')
  const normalizedMeetingId = digits.length === 11
    ? `${digits.slice(0, 3)} ${digits.slice(3, 7)} ${digits.slice(7)}`
    : meetingId.trim()
  const valid = digits.length >= 9 && name.trim().length > 0 && passcode.trim().length > 0

  const performJoin = async (targetId: string, targetPasscode: string, targetName: string) => {
    setError(null)
    setSubmitting(true)
    try {
      // 1. Capture the meeting details
      const meeting = await api.getMeeting(targetId)

      // 2. Block the join attempt if the meeting is ended
      if (meeting.status === 'ended') {
        throw new Error('This meeting has already ended.')
      }

      // 3. Proceed only if the meeting is active/scheduled
      const participant = await api.joinMeeting(targetId, {
        display_name: targetName.trim(),
        passcode: targetPasscode.trim(),
        is_muted: noAudio,
        is_video_on: !videoOff,
      })
      
      sessionStorage.setItem(`zoom-participant-${digits}-${user?.id ?? 'anonymous'}`, String(participant.id))
      
      const params = new URLSearchParams()
      if (videoOff) params.set('video', 'off')
      if (noAudio) params.set('audio', 'off')
      const qs = params.toString()
      
      router.push(`/meeting/${encodeURIComponent(targetId)}${qs ? `?${qs}` : ''}`)
    } catch (err) {
      setError(
        err instanceof Error && err.message === 'Meeting not found' 
          ? 'Meeting not found. Check the ID and try again.' 
          : err instanceof Error 
            ? err.message 
            : 'Invalid link or passcode. Please try manually.'
      )
      setSubmitting(false)
      setPasscode('') // Clear the invalid passcode so the user can enter it manually
    }
  }

  // Auto-join effect: triggers when the modal opens with an ID, Passcode, and a Name loaded
  useEffect(() => {
    if (initialMeetingId && initialPasscode && name && !autoJoinAttempted.current) {
      autoJoinAttempted.current = true
      void performJoin(normalizedMeetingId, initialPasscode, name)
    }
  }, [initialMeetingId, initialPasscode, name, normalizedMeetingId])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!valid) return
    await performJoin(normalizedMeetingId, passcode, name)
  }

  return (
    <Modal title={title} description={description} onClose={onClose}>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <div>
          <label htmlFor="join-id" className={fieldLabel}>
            Meeting ID or Link
          </label>
          <input
            id="join-id"
            className={fieldInput}
            placeholder="e.g. 834 221 9087"
            value={meetingId}
            onChange={(e) => setMeetingId(e.target.value)}
            autoComplete="off"
            disabled={submitting}
          />
        </div>
        <div>
          <label htmlFor="join-passcode" className={fieldLabel}>
            Passcode
          </label>
          <input
            id="join-passcode"
            className={fieldInput}
            placeholder="Enter meeting passcode"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            inputMode="numeric"
            autoComplete="off"
            disabled={submitting}
          />
        </div>
        <div>
          <label htmlFor="join-name" className={fieldLabel}>
            Your Name
          </label>
          <input 
            id="join-name" 
            className={fieldInput} 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            disabled={submitting}
          />
        </div>
        <div className="flex flex-col gap-2.5">
          <label className="flex cursor-pointer items-center gap-2.5 text-sm text-zoom-ink">
            <input
              type="checkbox"
              checked={noAudio}
              onChange={(e) => setNoAudio(e.target.checked)}
              className="size-4 rounded accent-zoom-blue"
              disabled={submitting}
            />
            {"Don't connect audio"}
          </label>
          <label className="flex cursor-pointer items-center gap-2.5 text-sm text-zoom-ink">
            <input
              type="checkbox"
              checked={videoOff}
              onChange={(e) => setVideoOff(e.target.checked)}
              className="size-4 rounded accent-zoom-blue"
              disabled={submitting}
            />
            Turn off video
          </label>
        </div>
        {error && <p className="text-sm text-zoom-red" role="alert">{error}</p>}
        <button type="submit" disabled={!valid || submitting} className={`${primaryBtn} mt-1 w-full`}>
          {submitting ? 'Joining...' : 'Join'}
        </button>
      </form>
    </Modal>
  )
}