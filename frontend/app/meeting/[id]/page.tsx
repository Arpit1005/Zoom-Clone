import type { Metadata, Viewport } from 'next'
import { MeetingRoom } from '@/components/zoom/meeting/meeting-room'

export const metadata: Metadata = { title: 'Zoom Meeting — Zoom Workplace' }
export const viewport: Viewport = { themeColor: '#0e0e10' }

export default async function MeetingPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ video?: string; audio?: string }>
}) {
  const { id } = await params
  const { video } = await searchParams
  return (
    <MeetingRoom
      meetingId={id}
      initialVideoOn={video !== 'off'}
    />
  )
}
