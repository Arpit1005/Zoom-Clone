export type Meeting = {
  id: string
  title: string
  date: string
  shortDate: string
  start: string
  end: string
  host: string
  hostAvatar: string
  meetingId: string
}

export const currentUser = {
  name: 'Aanya Varshney',
  firstName: 'Aanya',
  avatar: '/images/avatar-aanya.png',
}

export const meetings: Meeting[] = [
  {
    id: '72165680811',
    title: "Aanya Varshney's Zoom Meeting",
    date: 'Friday, September 25, 2026',
    shortDate: 'Fri, Sep 25',
    start: '11:59 AM',
    end: '12:01 PM',
    host: 'Aanya Varshney',
    hostAvatar: '/images/avatar-aanya.png',
    meetingId: '721 6568 0811',
  },
  {
    id: '83422190870',
    title: 'Design Sync — Workplace Redesign',
    date: 'Friday, September 25, 2026',
    shortDate: 'Fri, Sep 25',
    start: '2:30 PM',
    end: '3:15 PM',
    host: 'Aanya Varshney',
    hostAvatar: '/images/avatar-aanya.png',
    meetingId: '834 2219 0870',
  },
]

export type Participant = {
  id: string
  name: string
  muted: boolean
  videoOn: boolean
  image?: string
}

export const participants: Participant[] = [
  { id: 'p1', name: 'Rohan Mehta', muted: true, videoOn: false },
  { id: 'p2', name: 'Aanya Varshney', muted: true, videoOn: true, image: '/images/camera-feed.png' },
  { id: 'p3', name: 'Priya Kapoor', muted: true, videoOn: false },
]
