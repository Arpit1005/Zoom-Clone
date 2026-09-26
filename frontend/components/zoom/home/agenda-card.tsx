'use client'

import { 
  Calendar, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  MessageCircle, 
  MoreHorizontal,
  Video,
  MoveRight,
  MoveLeft
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { MeetingOut } from '@/lib/api'
import { cn } from '@/lib/utils'
import { MeetingPopover } from './meeting-popover'
import { RichMeetingDetails } from './rich-meeting-details'

type Props = {
  meetings: MeetingOut[]
  loading: boolean
  selectedId: string | null
  currentDate?: Date
  onPreviousDay?: () => void
  onNextDay?: () => void
  onGoToToday?: () => void // Added to power the new Today button
  onSelect: (id: string | null) => void
  onViewDetails: (id: string) => void
  onDelete: (id: string) => void
  onUpdate: (meeting: MeetingOut) => void
  onAdd: () => void
}

function getUrgencyStatus(startTime: string) {
  const start = new Date(startTime).getTime()
  const now = new Date().getTime()
  const diffMinutes = Math.floor((start - now) / 60000)

  if (diffMinutes > 0 && diffMinutes <= 30) {
    return <div className="text-[12.5px] font-medium text-[#d8222b] leading-tight">In {diffMinutes} min</div>
  }
  if (diffMinutes <= 0 && diffMinutes > -60) {
    return <div className="text-[12.5px] font-medium text-[#d8222b] leading-tight">Now</div>
  }
  return null
}

const iconBtn =
  'inline-flex size-7 items-center justify-center rounded-md text-zoom-muted transition-colors hover:bg-zoom-field hover:text-zoom-ink'

export function AgendaCard({ 
  meetings, loading, selectedId, currentDate, onPreviousDay, onNextDay, onGoToToday, onSelect, onViewDetails, onDelete, onUpdate, onAdd 
}: Props) {
  const router = useRouter()
  
  // Calculate date differences for dynamic headers
  const displayDate = currentDate || new Date()
  const today = new Date()
  
  // Reset time to accurately compare calendar days
  today.setHours(0, 0, 0, 0)
  const target = new Date(displayDate)
  target.setHours(0, 0, 0, 0)
  
  const diffDays = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  const isToday = diffDays === 0
  
  // Format the header text dynamically based on the day offset
  let headerText = ''
  const formattedDate = target.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  if (diffDays === 0) headerText = `Today, ${formattedDate}`
  else if (diffDays === -1) headerText = `Yesterday, ${formattedDate}`
  else if (diffDays === 1) headerText = `Tomorrow, ${formattedDate}`
  else {
    const weekday = target.toLocaleDateString('en-US', { weekday: 'short' })
    headerText = `${weekday}, ${formattedDate}`
  }

  const selectedMeeting = meetings.find((m) => String(m.id) === selectedId)
  const selectedStart = selectedMeeting ? new Date(selectedMeeting.start_time).getTime() : 0
  const selectedIsFuture = selectedStart > new Date().getTime()
  const selectedIsEnded = selectedMeeting?.status === 'ended'

  return (
    <section aria-label="Today's agenda" className="relative rounded-xl border border-zoom-line bg-white shadow-sm">
      <div className="flex flex-col gap-2 border-b border-zoom-line px-4 pb-2 pt-3">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center">
          <div className="flex justify-start">
            <button type="button" onClick={onAdd} className={iconBtn} aria-label="Schedule a meeting">
              <Plus className="size-[18px]" />
            </button>
          </div>

          <button
            type="button"
            className="flex items-center justify-center gap-1 rounded-md px-1.5 py-1 text-[15px] font-semibold text-zoom-ink hover:bg-zoom-field"
          >
            {headerText}
            <ChevronDown className="size-4 text-zoom-muted" aria-hidden="true" />
          </button>

          <div></div>
        </div>

        <div className="mt-1 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              type="button" 
              onClick={onGoToToday}
              className="inline-flex h-7 items-center gap-1.5 rounded-full border border-zoom-line bg-white px-3 text-xs font-medium text-zoom-ink transition-colors hover:bg-gray-50"
            >
              {isToday && <Calendar className="size-3.5 text-zoom-muted" aria-hidden="true" />}
              {diffDays < 0 && <MoveRight className="size-3.5 text-zoom-muted" aria-hidden="true" />}
              {diffDays > 0 && <MoveLeft className="size-3.5 text-zoom-muted" aria-hidden="true" />}
              Today
            </button>
            <div className="flex items-center gap-1">
              <button onClick={onPreviousDay} className="rounded-md p-1 text-zoom-muted transition-colors hover:bg-gray-100 hover:text-zoom-ink">
                <ChevronLeft className="size-4" />
              </button>
              <button onClick={onNextDay} className="rounded-md p-1 text-zoom-muted transition-colors hover:bg-gray-100 hover:text-zoom-ink">
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
          <button className={iconBtn}>
            <MoreHorizontal className="size-[18px]" />
          </button>
        </div>
      </div>

      <ul className="flex min-h-[180px] flex-col gap-2.5 p-3">
        {loading && <li className="py-10 text-center text-sm text-zoom-muted">Loading meetings...</li>}
        {!loading && meetings.length === 0 && (
          <li className="py-10 text-center text-sm text-zoom-muted">No meetings scheduled for this date</li>
        )}
        
        {meetings.map((m) => {
          const selected = selectedId === String(m.id)
          const start = new Date(m.start_time)
          const end = new Date(start.getTime() + 30 * 60000) 
          const timeFormatter = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' })
          const timeString = `${timeFormatter.format(start)} - ${timeFormatter.format(end)}`
          const isEnded = m.status === 'ended'

          return (
            <li key={m.id} className="relative">
              <div
                data-meeting-row
                onClick={() => onSelect(selected ? null : String(m.id))}
                className={cn(
                  'group relative flex w-full cursor-pointer flex-col rounded-xl border px-3.5 py-3 text-left transition-colors',
                  selected && !isEnded ? 'border-blue-300 bg-[#f4f7fe]' : 'border-zoom-line hover:border-gray-300',
                  isEnded ? 'bg-[#f7f8fa] text-zoom-muted' : 'bg-white text-zoom-ink'
                )}
              >
                {isEnded ? (
                  <div className="flex flex-col">
                    <div className="mb-0.5 flex items-center gap-1.5 text-zoom-muted">
                      <Video className="size-4" strokeWidth={1.5} />
                      <h3 className="text-[13px] font-medium">{m.title}</h3>
                    </div>
                    <div className="text-[12px] leading-[18px] text-zoom-muted">
                      {new Date(m.start_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                    <div className="text-[12px] leading-[18px] text-zoom-muted">{timeString}</div>
                    <div className="flex items-end justify-between">
                      <div className="text-[12px] leading-[18px] text-zoom-muted">Host: {m.host.name}</div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation()
                          onSelect(selected ? null : String(m.id))
                        }} 
                        className="-mb-1 -mr-1 rounded-md p-1 text-zoom-muted hover:bg-gray-200"
                      >
                        <MoreHorizontal className="size-[16px]" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    <h3 className="mb-0.5 text-[14px] font-medium text-zoom-ink">{m.title}</h3>
                    {getUrgencyStatus(m.start_time)}
                    <div className="text-[12.5px] leading-[18px] text-zoom-ink">{timeString}</div>
                    <div className="text-[12.5px] leading-[18px] text-zoom-ink">Organizer: {m.host.email || m.host.name}</div>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex gap-2.5">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/meeting/${encodeURIComponent(m.meeting_id)}`)
                          }}
                          className="rounded-full bg-[#0b5cff] px-4 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-blue-700"
                        >
                          Start
                        </button>
                      </div>
                      <div className="flex items-center gap-1 text-zoom-muted">
                        <button onClick={(e) => e.stopPropagation()} className="rounded-md p-1.5 hover:bg-gray-100 hover:text-zoom-ink">
                          <MessageCircle className="size-[18px]" />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation()
                            onSelect(selected ? null : String(m.id))
                          }} 
                          className="rounded-md p-1.5 hover:bg-gray-100 hover:text-zoom-ink"
                        >
                          <MoreHorizontal className="size-[18px]" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {selected && isEnded && (
                <div className="absolute right-0 top-full z-10 mt-2" onClick={(e) => e.stopPropagation()}>
                  <MeetingPopover
                    meeting={m}
                    onClose={() => onSelect(null)}
                    onViewDetails={() => onViewDetails(String(m.id))}
                    onDelete={() => onDelete(String(m.id))}
                    onUpdate={onUpdate}
                  />
                </div>
              )}
            </li>
          )
        })}
      </ul>

      <div className="border-t border-zoom-line px-2 py-1.5">
        <a
          href="#recordings"
          className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-[13px] font-medium text-zoom-ink transition-colors hover:bg-zoom-field"
        >
          Open recordings
          <ChevronRight className="size-4 text-zoom-muted" aria-hidden="true" />
        </a>
      </div>

      {selectedMeeting && !selectedIsEnded && (
        <div 
          className="absolute right-[calc(100%+24px)] top-0 z-50 w-[420px] rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] ring-1 ring-black/5" 
          onClick={(e) => e.stopPropagation()}
        >
          <RichMeetingDetails
            meeting={selectedMeeting}
            onClose={() => onSelect(null)}
            onDelete={() => {
              onDelete(String(selectedMeeting.id))
              onSelect(null)
            }}
            onUpdate={onUpdate}
            onJoin={() => router.push(`/join/${encodeURIComponent(selectedMeeting.meeting_id)}`)}
          />
        </div>
      )}
    </section>
  )
}