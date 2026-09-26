'use client'

import { useState } from 'react'
import type { MeetingOut } from '@/lib/api'
import { api } from '@/lib/api'
import { Modal, fieldInput, fieldLabel, primaryBtn } from './modal'

export function EditMeetingModal({
  meeting,
  onClose,
  onSaved,
}: {
  meeting: MeetingOut
  onClose: () => void
  onSaved: (updated: MeetingOut) => void
}) {
  const [title, setTitle] = useState(meeting.title)
  const [description, setDescription] = useState(meeting.description ?? '')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!title.trim()) return
    setError(null)
    setSubmitting(true)
    try {
      const updatedMeeting = await api.updateMeeting(meeting.meeting_id, {
        title: title.trim(),
        description: description.trim(),
      })
      onSaved(updatedMeeting)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update this meeting.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal title="Edit Meeting" description="Update the meeting details." onClose={onClose}>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <div>
          <label htmlFor="edit-meeting-title" className={fieldLabel}>
            Title
          </label>
          <input
            id="edit-meeting-title"
            className={fieldInput}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="edit-meeting-description" className={fieldLabel}>
            Description
          </label>
          <textarea
            id="edit-meeting-description"
            rows={3}
            className={`${fieldInput} h-auto resize-none py-2`}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </div>
        {error && <p className="text-sm text-zoom-red" role="alert">{error}</p>}
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-md px-4 text-sm font-medium text-zoom-ink transition-colors hover:bg-zoom-field"
          >
            Cancel
          </button>
          <button type="submit" disabled={!title.trim() || submitting} className={primaryBtn}>
            {submitting ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
