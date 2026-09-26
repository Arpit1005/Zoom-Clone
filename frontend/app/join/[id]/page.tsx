import type { Metadata } from 'next'
import { HomeView } from '@/components/zoom/home/home-view'

export const metadata: Metadata = { title: 'Join Meeting — Zoom Workplace' }

export default async function JoinPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ pwd?: string }>
}) {
  const { id } = await params
  const { pwd } = await searchParams

  return (
    <HomeView 
      initialModal="join" 
      initialMeetingId={id} 
      initialPasscode={pwd} 
    />
  )
}