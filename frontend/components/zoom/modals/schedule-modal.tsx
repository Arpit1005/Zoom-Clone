'use client'

import { useState } from 'react'
import type { MeetingOut } from '@/lib/api'
import { api } from '@/lib/api'
import { useCurrentUser } from '@/lib/user-context'
import { Modal, fieldInput, fieldLabel, primaryBtn } from './modal'

export function ScheduleModal({ onClose, onSchedule }: { onClose: () => void; onSchedule: (m: MeetingOut) => void }) {
  const user = useCurrentUser()
  const [topic, setTopic] = useState(`${user?.name ?? 'Aanya Varshney'}'s Zoom Meeting`)
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('2026-09-25')
  const [time, setTime] = useState('15:30')
  const [duration, setDuration] = useState('30')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!topic.trim() || !date || !time || !user) return
    setError(null)
    setSubmitting(true)
    try {
      const meeting = await api.scheduleMeeting({
        title: topic.trim(),
        description: description.trim() || undefined,
        start_time: new Date(`${date}T${time}`).toISOString(),
        duration_minutes: Number(duration) as 30 | 60 | 90,
      })
      onSchedule(meeting)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to schedule this meeting.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal title="Schedule Meeting" description="Set the details and invite others when you're ready." onClose={onClose}>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <div>
          <label htmlFor="sch-topic" className={fieldLabel}>
            Topic
          </label>
          <input id="sch-topic" className={fieldInput} value={topic} onChange={(e) => setTopic(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="sch-desc" className={fieldLabel}>
            Description
          </label>
          <textarea
            id="sch-desc"
            rows={3}
            placeholder="Add an agenda or notes (optional)"
            className={`${fieldInput} h-auto resize-none py-2`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="sch-date" className={fieldLabel}>
              Date
            </label>
            <input id="sch-date" type="date" className={fieldInput} value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>
          <div>
            <label htmlFor="sch-time" className={fieldLabel}>
              Start time
            </label>
            <input id="sch-time" type="time" className={fieldInput} value={time} onChange={(e) => setTime(e.target.value)} required />
          </div>
        </div>
        <div>
          <label htmlFor="sch-duration" className={fieldLabel}>
            Duration
          </label>
          <select id="sch-duration" className={fieldInput} value={duration} onChange={(e) => setDuration(e.target.value)}>
            <option value="30">30 min</option>
            <option value="60">60 min</option>
            <option value="90">90 min</option>
          </select>
        </div>
        <div className="mt-1 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-md px-4 text-sm font-medium text-zoom-ink transition-colors hover:bg-zoom-field"
          >
            Cancel
          </button>
          {error && <p className="mr-auto text-sm text-zoom-red" role="alert">{error}</p>}
          <button type="submit" disabled={!user || submitting} className={primaryBtn}>
            Schedule
          </button>
        </div>
      </form>
    </Modal>
  )
}
