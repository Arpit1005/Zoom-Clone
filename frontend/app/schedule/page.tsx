import type { Metadata } from 'next'
import { HomeView } from '@/components/zoom/home/home-view'

export const metadata: Metadata = { title: 'Schedule Meeting — Zoom Workplace' }

export default function SchedulePage() {
  return <HomeView initialModal="schedule" />
}
