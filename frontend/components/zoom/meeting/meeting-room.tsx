'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { MeetingDetailOut, ParticipantOut } from '@/lib/api'
import { api } from '@/lib/api'
import { useCurrentUser } from '@/lib/user-context'
import { MeetingToolbar } from './meeting-toolbar'
import { MeetingTopBar } from './meeting-top-bar'
import { SidePanel } from './side-panel'
import { VideoStage } from './video-stage'
import LocalMediaStream from './local-video-render' // Added import

export function MeetingRoom({
  meetingId,
  initialVideoOn,
}: {
  meetingId: string
  initialVideoOn: boolean
}) {
  const router = useRouter()
  const user = useCurrentUser()
  const normalizedMeetingId = decodeURIComponent(meetingId)
  const [meeting, setMeeting] = useState<MeetingDetailOut | null>(null)
  const [participants, setParticipants] = useState<ParticipantOut[]>([])
  const [participantId, setParticipantId] = useState<number | null>(null)
  const [muted, setMuted] = useState(true)
  const [videoOn, setVideoOn] = useState(initialVideoOn)
  const [handRaised, setHandRaised] = useState(false)
  const [speakerId, setSpeakerId] = useState<string | null>(null)
  const [layout, setLayout] = useState<'dynamic' | 'gallery'>('dynamic')
  const [pinnedId, setPinnedId] = useState<string | null>(null)
  const [panel, setPanel] = useState<'participants' | 'chat' | 'host-tools' | null>(null)

  useEffect(() => {
    const storedId = sessionStorage.getItem(`zoom-participant-${normalizedMeetingId.replace(/\s/g, '')}-${user?.id ?? 'anonymous'}`)
    if (storedId) setParticipantId(Number(storedId))
    Promise.all([api.getMeeting(normalizedMeetingId), api.getParticipants(normalizedMeetingId)]).then(([detail, liveParticipants]) => {
      setMeeting(detail)
      setParticipants(liveParticipants)
      setSpeakerId(String(liveParticipants[0]?.id ?? ''))
    }).catch(() => router.push('/'))
  }, [normalizedMeetingId, router, user?.id])

  useEffect(() => {
    if (!participantId) return
    const participant = participants.find((item) => item.id === participantId)
    if (participant) {
      setMuted(participant.is_muted)
      setVideoOn(participant.is_video_on)
      setHandRaised(participant.is_hand_raised)
    }
  }, [participantId, participants])

  useEffect(() => {
    if (participantId || !user) return
    const ownParticipant = participants.find((item) => item.user?.id === user.id)
    if (ownParticipant) {
      setParticipantId(ownParticipant.id)
      setHandRaised(ownParticipant.is_hand_raised)
    }
  }, [participantId, participants, user])

  useEffect(() => {
    const refreshParticipants = async () => {
      try {
        const [liveParticipants, liveMeeting] = await Promise.all([
          api.getParticipants(normalizedMeetingId),
          api.getMeeting(normalizedMeetingId),
        ])
        if (participantId && !liveParticipants.some((participant) => participant.id === participantId)) {
          router.replace('/')
          return
        }
        setParticipants(liveParticipants)
        setMeeting(liveMeeting)
      } catch {
        // Keep the current room visible during a temporary polling failure.
      }
    }

    const intervalId = window.setInterval(refreshParticipants, 2000)
    return () => window.clearInterval(intervalId)
  }, [normalizedMeetingId, participantId, router])

  const updateParticipant = async (payload: { is_muted?: boolean; is_video_on?: boolean; is_hand_raised?: boolean; reaction?: string }) => {
    const ownParticipant = participants.find((item) => item.id === participantId || item.user?.id === user?.id)
      ?? meeting?.participants.find((item) => item.id === participantId || item.user?.id === user?.id)
      ?? (participants.length === 1 ? participants[0] : undefined)
    const targetParticipantId = participantId ?? ownParticipant?.id
    if (!targetParticipantId) return
    const updated = await api.updateParticipant(targetParticipantId, payload)
    setParticipants((current) => current.map((item) => (item.id === updated.id ? updated : item)))
    setMuted(updated.is_muted)
    setVideoOn(updated.is_video_on)
    setHandRaised(updated.is_hand_raised)
  }

  const leave = async () => {
    if (participantId) await api.leaveMeeting(meetingId, participantId)
    router.push('/')
  }

  const end = async () => {
    await api.endMeeting(meetingId)
    router.push('/')
  }

  const toggleRecording = async () => {
    if (!meeting) return
    const updated = meeting.is_recording
      ? await api.stopRecording(meeting.meeting_id)
      : await api.startRecording(meeting.meeting_id)
    setMeeting((current) => (current ? { ...current, is_recording: updated.is_recording } : current))
  }

  const isHost = user?.id === meeting?.host.id

  const removeParticipant = (removedId: number) => {
    setParticipants((current) => current.filter((participant) => participant.id !== removedId))
    if (participantId === removedId) void leave()
  }

  const muteAll = () => {
    setParticipants((current) => current.map((participant) => ({ ...participant, is_muted: participant.is_host ? participant.is_muted : true })))
  }

  if (!meeting) return null

  const youId = String(participantId ?? meeting.participants.find((item) => item.user?.id === user?.id)?.id ?? '')
  const currentParticipant = participants.find((item) => item.id === participantId || item.user?.id === user?.id)
    ?? meeting.participants.find((item) => item.id === participantId || item.user?.id === user?.id)
    ?? (participants.length === 1 ? participants[0] : undefined)
  const currentHandRaised = currentParticipant?.is_hand_raised ?? handRaised
  const displayHost = meeting.host.name

  return (
    <div className="flex h-dvh flex-col bg-zoom-room text-white">
      <MeetingTopBar
        meetingId={meeting.meeting_id}
        host={displayHost}
        passcode={meeting.passcode}
        isHost={isHost}
        isRecording={meeting.is_recording}
        layout={layout}
        name={meeting.title}
        onToggleLayout={() => setLayout((current) => (current === 'dynamic' ? 'gallery' : 'dynamic'))}
      />
      
      {/* Main Grid & Side Panel Area */}
      <div className="flex min-h-0 flex-1 relative">
        
        <VideoStage
          participants={participants}
          speakerId={speakerId ?? youId}
          youId={youId}
          onSpotlight={setSpeakerId}
          layout={layout}
          pinnedId={pinnedId}
          onPin={(id) => setPinnedId((current) => (current === id ? null : id))}
        />

        {/* Side Panel (Chat, Participants, etc.) */}
        {panel && (panel !== 'host-tools' || isHost) && (
          <SidePanel
            kind={panel}
            participants={participants}
            youId={youId}
            meetingId={meetingId}
            onClose={() => setPanel(null)}
            onRemoveParticipant={removeParticipant}
            onMuteAll={muteAll}
          />
        )}
      </div>

      <MeetingToolbar
        muted={muted}
        videoOn={videoOn}
        participantCount={participants.length}
        panel={panel}
        isHost={isHost}
        onToggleMute={() => void updateParticipant({ is_muted: !muted })}
        onToggleVideo={() => void updateParticipant({ is_video_on: !videoOn })}
        handRaised={currentHandRaised}
        isRecording={meeting.is_recording}
        onToggleHand={() => void updateParticipant({ is_hand_raised: !currentHandRaised })}
        onReaction={(reaction) => void updateParticipant({ reaction })}
        onToggleRecording={() => void toggleRecording()}
        onTogglePanel={(p) => setPanel((cur) => (cur === p ? null : p))}
        onLeave={() => void leave()}
        onEnd={() => void end()}
      />
    </div>
  )
}