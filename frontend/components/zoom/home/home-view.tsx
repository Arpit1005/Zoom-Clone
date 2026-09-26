'use client'

import { useCallback, useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import type { MeetingOut } from '@/lib/api'
import { api } from '@/lib/api'
import { AppShell } from '../app-shell'
import { InfoBanner } from '../info-banner'
import { JoinModal } from '../modals/join-modal'
import { ScheduleModal } from '../modals/schedule-modal'
import { AgendaCard } from './agenda-card'
import { LiveClock } from './live-clock'
import { MeetingDetails } from './meeting-details'
import { QuickActions } from './quick-actions'

type ModalKind = 'join' | 'schedule' | 'share' | null

export function HomeView({ 
  initialModal = null,
  initialMeetingId = null,
  initialPasscode = null
}: { 
  initialModal?: ModalKind
  initialMeetingId?: string | null
  initialPasscode?: string | null
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [modal, setModal] = useState<ModalKind>(initialModal)
  
  const [meetings, setMeetings] = useState<MeetingOut[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [detailsId, setDetailsId] = useState<string | null>(null)
  const [joinMeetingId, setJoinMeetingId] = useState<string | null>(initialMeetingId)
  const [showCalendarBanner, setShowCalendarBanner] = useState(true)

  // 1. Add state for the currently viewed date (defaults to today)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  const loadMeetings = useCallback(async () => {
    setLoading(true)
    try {
      // 2. Format the local date to YYYY-MM-DD for the API
      const year = selectedDate.getFullYear()
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0')
      const day = String(selectedDate.getDate()).padStart(2, '0')
      const dateString = `${year}-${month}-${day}`
      
      const data = await api.getMeetingsByDate(dateString)
      setMeetings(data)
    } finally {
      setLoading(false)
    }
  }, [selectedDate]) // Re-run automatically when selectedDate changes

  useEffect(() => {
    loadMeetings().catch(() => setMeetings([]))
  }, [loadMeetings])

  const closeModal = useCallback(() => {
    setModal(null)
    setJoinMeetingId(null)
    if (pathname !== '/') router.replace('/')
  }, [pathname, router])

  const deleteMeeting = async (id: string) => {
    const meeting = meetings.find((item) => String(item.id) === id)
    if (!meeting) return
    
    await api.deleteMeeting(meeting.meeting_id)
    setMeetings((ms) => ms.filter((m) => m.id !== meeting.id))
    setSelectedId(null)
    setDetailsId(null)
  }

  const updateMeeting = (updatedMeeting: MeetingOut) => {
    setMeetings((current) => current.map((m) => (m.id === updatedMeeting.id ? updatedMeeting : m)))
  }

  const detailsMeeting = meetings.find((m) => String(m.id) === detailsId)

  // 3. Handlers to change the date forward and backward
  const goToPreviousDay = () => {
    setSelectedDate(prev => {
      const newDate = new Date(prev)
      newDate.setDate(prev.getDate() - 1)
      return newDate
    })
  }

  const goToNextDay = () => {
    setSelectedDate(prev => {
      const newDate = new Date(prev)
      newDate.setDate(prev.getDate() + 1)
      return newDate
    })
  }

  return (
    <AppShell>
      {detailsMeeting ? (
        <MeetingDetails
          meeting={detailsMeeting}
          onClose={() => setDetailsId(null)}
          onDelete={() => void deleteMeeting(String(detailsMeeting.id))}
          onUpdate={updateMeeting}
          onJoin={() => {
            setJoinMeetingId(detailsMeeting.meeting_id)
            setModal('join')
          }}
        />
      ) : (
        <div className="mx-auto flex w-full max-w-[720px] flex-col gap-8 px-4 pt-10 pb-10 md:pt-14">
          <LiveClock />
          <QuickActions
            onJoin={() => setModal('join')}
            onSchedule={() => setModal('schedule')}
            onShare={() => setModal('share')}
          />
          
          <div className="flex flex-col gap-8">
            {showCalendarBanner && (
              <InfoBanner onDismiss={() => setShowCalendarBanner(false)}>
                {"You haven't connected your calendar yet. "}
                <a href="#connect-calendar" className="font-medium text-zoom-blue hover:underline">
                  Connect now
                </a>{' '}
                to manage all your meetings and events in one place.
              </InfoBanner>
            )}
            
            {/* 4. Pass the date handlers down to the AgendaCard */}
            <AgendaCard
              meetings={meetings}
              loading={loading}
              selectedId={selectedId}
              
              currentDate={selectedDate}
              onPreviousDay={goToPreviousDay}
              onNextDay={goToNextDay}

              onSelect={setSelectedId}
              onViewDetails={(id) => {
                setSelectedId(null)
                setDetailsId(id)
              }}
              onDelete={(id) => void deleteMeeting(id)}
              onUpdate={updateMeeting}
              onAdd={() => setModal('schedule')}
            />
          </div>
        </div>
      )}

      {modal === 'join' && (
        <JoinModal 
          onClose={closeModal} 
          initialMeetingId={joinMeetingId ?? undefined} 
          initialPasscode={initialPasscode ?? undefined}
        />
      )}
      {modal === 'share' && (
        <JoinModal
          onClose={closeModal}
          title="Share Screen"
          description="Enter the sharing key or meeting ID to share your screen."
        />
      )}
      {modal === 'schedule' && (
        <ScheduleModal
          onClose={closeModal}
          onSchedule={async () => {
            closeModal()
            await loadMeetings()
          }}
        />
      )}
    </AppShell>
  )
}