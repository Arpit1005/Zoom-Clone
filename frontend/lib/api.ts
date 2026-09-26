export type UserOut = {
  id: number
  name: string
  email: string | null
  avatar_url: string | null
  is_online: boolean
  created_at: string
}

export type MeetingOut = {
  id: number
  meeting_id: string
  passcode?: string | null
  title: string
  description: string | null
  meeting_type: string
  start_time: string
  end_time: string | null
  duration_minutes: number | null
  status: string
  invite_link: string
  is_recording: boolean
  created_at: string
  host: UserOut
}

export type ParticipantOut = {
  id: number
  display_name: string
  is_host: boolean
  is_muted: boolean
  is_video_on: boolean
  is_active_speaker: boolean
  is_hand_raised: boolean
  reaction: string | null
  reaction_at: string | null
  joined_at: string
  left_at: string | null
  user: UserOut | null
}

export type MessageOut = {
  id: number
  participant_id: number
  display_name: string
  text: string
  created_at: string
}

export type MeetingDetailOut = MeetingOut & {
  participants: ParticipantOut[]
}

type InstantMeetingInput = { title?: string }
type ScheduledMeetingInput = {
  title: string
  description?: string
  start_time: string
  duration_minutes: 30 | 60 | 90
}
type MeetingUpdateInput = { title?: string; description?: string }
type JoinMeetingInput = {
  display_name: string
  passcode: string
  user_id?: number
  is_muted?: boolean
  is_video_on?: boolean
}
type ParticipantUpdateInput = {
  is_muted?: boolean
  is_video_on?: boolean
  is_active_speaker?: boolean
  is_hand_raised?: boolean
  reaction?: string
}

const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = typeof window !== 'undefined' ? window.localStorage.getItem('zoom-auth-token') : null
  const response = await fetch(`${baseUrl}/api${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  })

  if (!response.ok) {
    let detail = `Request failed with status ${response.status}`
    try {
      const body = (await response.json()) as { detail?: string }
      if (body.detail) detail = body.detail
    } catch {
      // Keep the status error when the response is not JSON.
    }
    throw new Error(detail)
  }

  return response.json() as Promise<T>
}

const json = (body: unknown): RequestInit => ({
  method: 'POST',
  body: JSON.stringify(body),
})

export const api = {
  getCurrentUser: () => request<UserOut>('/auth/me'),
  getUser: (userId: number) => request<UserOut>(`/users/${userId}`),
  getMeetingsToday: () => request<MeetingOut[]>('/meetings/today'),
  getMeetingsUpcoming: () => request<MeetingOut[]>('/meetings/upcoming'),
  getMeetingsRecent: () => request<MeetingOut[]>('/meetings/recent'),
  getMeetingsByDate: (date: string) => request<MeetingOut[]>(`/meetings/by-date?date=${encodeURIComponent(date)}`),
  createInstantMeeting: (payload: InstantMeetingInput) => request<MeetingOut>('/meetings/instant', json(payload)),
  scheduleMeeting: (payload: ScheduledMeetingInput) => request<MeetingOut>('/meetings/schedule', json(payload)),
  getMeeting: (meetingId: string) => request<MeetingDetailOut>(`/meetings/${encodeURIComponent(meetingId)}`),
  updateMeeting: (meetingId: string, payload: MeetingUpdateInput) =>
    request<MeetingOut>(`/meetings/${encodeURIComponent(meetingId)}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  deleteMeeting: (meetingId: string) =>
    request<{ success: boolean }>(`/meetings/${encodeURIComponent(meetingId)}`, { method: 'DELETE' }),
  endMeeting: (meetingId: string) => request<MeetingOut>(`/meetings/${encodeURIComponent(decodeURIComponent(meetingId))}/end`, json({})),
  startRecording: (meetingId: string) => request<MeetingOut>(`/meetings/${encodeURIComponent(meetingId)}/recording/start`, json({})),
  stopRecording: (meetingId: string) => request<MeetingOut>(`/meetings/${encodeURIComponent(meetingId)}/recording/stop`, json({})),
  joinMeeting: (meetingId: string, payload: JoinMeetingInput) =>
    request<ParticipantOut>(`/meetings/${encodeURIComponent(meetingId)}/join`, json(payload)),
  leaveMeeting: (meetingId: string, participantId: number) =>
    request<{ success: boolean }>(
      `/meetings/${encodeURIComponent(decodeURIComponent(meetingId))}/leave`, 
      json({ participant_id: participantId })
    ),
  getParticipants: (meetingId: string) => request<ParticipantOut[]>(`/meetings/${encodeURIComponent(meetingId)}/participants`),
  getMessages: (meetingId: string) => request<MessageOut[]>(`/meetings/${encodeURIComponent(meetingId)}/messages`),
  sendMessage: (meetingId: string, text: string) =>
    request<MessageOut>(`/meetings/${encodeURIComponent(meetingId)}/messages`, json({ text })),
  updateParticipant: (participantId: number, payload: ParticipantUpdateInput) =>
    request<ParticipantOut>(`/participants/${participantId}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  muteAll: (meetingId: string) => request<{ success: boolean }>(`/meetings/${encodeURIComponent(meetingId)}/mute-all`, json({})),
  removeParticipant: (participantId: number) => request<{ success: boolean }>(`/participants/${participantId}`, { method: 'DELETE' }),
}

const timeFormatter = new Intl.DateTimeFormat('en-US', { 
  hour: 'numeric', 
  minute: '2-digit',
  timeZone: 'Asia/Kolkata'
})

const dateFormatter = new Intl.DateTimeFormat('en-US', { 
  weekday: 'long', 
  month: 'long', 
  day: 'numeric', 
  year: 'numeric',
  timeZone: 'Asia/Kolkata'
})

const shortDateFormatter = new Intl.DateTimeFormat('en-US', { 
  weekday: 'short', 
  month: 'short', 
  day: 'numeric',
  timeZone: 'Asia/Kolkata'
})

// Helper to ensure date strings missing 'Z' or offset are treated as UTC
function parseAsUTC(dateString: string) {
  if (!dateString) return new Date();
  // If string has no 'Z' and no '+' or '-' offset, append 'Z'
  const isUtc = dateString.endsWith('Z') || dateString.includes('+') || (dateString.includes('-') && dateString.length > 10);
  return new Date(isUtc ? dateString : `${dateString}Z`);
}

export function meetingStart(meeting: MeetingOut) {
  // Check if 'Z' is missing, and append it so JS parses it as UTC
  const timeString = meeting.start_time.endsWith('Z') 
    ? meeting.start_time 
    : `${meeting.start_time}Z`;
    
  return new Date(timeString);
}

export function meetingEnd(meeting: MeetingOut) {
  if (meeting.end_time) {
    const timeString = meeting.end_time.endsWith('Z') 
      ? meeting.end_time 
      : `${meeting.end_time}Z`;
    return new Date(timeString);
  }
  
  return new Date(meetingStart(meeting).getTime() + (meeting.duration_minutes ?? 30) * 60_000);
}

export function formatMeetingDate(meeting: MeetingOut) {
  return dateFormatter.format(meetingStart(meeting))
}

export function formatMeetingShortDate(meeting: MeetingOut) {
  return shortDateFormatter.format(meetingStart(meeting))
}

export function formatMeetingTime(meeting: MeetingOut) {
  return `${timeFormatter.format(meetingStart(meeting))} - ${timeFormatter.format(meetingEnd(meeting))}`
}