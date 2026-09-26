import random
import urllib.parse
from datetime import datetime, date, timedelta
from typing import Optional

from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app import models, schemas


# ---------- Helpers ----------


def generate_meeting_id(db: Session) -> str:
    """Random 10-digit number formatted as 'XXX XXXX XXXX', unique in DB."""
    while True:
        digits = "".join(str(random.randint(0, 9)) for _ in range(10))
        formatted = f"{digits[0:3]} {digits[3:7]} {digits[7:10]}"
        exists = (
            db.query(models.Meeting)
            .filter(models.Meeting.meeting_id == formatted)
            .first()
        )
        if not exists:
            return formatted


def generate_passcode() -> str:
    return "".join(str(random.randint(0, 9)) for _ in range(6))


def build_invite_link(meeting_id: str, passcode: str) -> str:
    clean_id = meeting_id.replace(' ', '')
    # URL-encode the passcode just in case it contains special characters like + or &
    encoded_pwd = urllib.parse.quote(passcode)
    
    return f"https://zoom-clone-azure-three.vercel.app/join/{clean_id}?pwd={encoded_pwd}"


def normalize_meeting_id(meeting_id: str) -> str:
    """Accept IDs with or without spaces; normalize back to the stored
    'XXX XXXX XXXX' format for lookup."""
    stripped = meeting_id.replace(" ", "").replace("%20", "")
    if len(stripped) == 10 and stripped.isdigit():
        return f"{stripped[0:3]} {stripped[3:7]} {stripped[7:10]}"
    return meeting_id


# ---------- Users ----------


def get_default_user(db: Session) -> Optional[models.User]:
    return (
        db.query(models.User)
        .filter(models.User.name == "Aanya Varshney")
        .first()
        or db.query(models.User).order_by(models.User.id.asc()).first()
    )


def get_user(db: Session, user_id: int) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.id == user_id).first()


# ---------- Meetings ----------


def get_meeting_by_meeting_id(
    db: Session, meeting_id: str
) -> Optional[models.Meeting]:
    normalized = normalize_meeting_id(meeting_id)
    return (
        db.query(models.Meeting)
        .filter(models.Meeting.meeting_id == normalized)
        .first()
    )


def _meetings_visible_to_user(db: Session, user_id: int):
    joined_meeting_ids = db.query(models.Participant.meeting_id).filter(
        models.Participant.user_id == user_id
    )
    return db.query(models.Meeting).filter(
        or_(models.Meeting.host_id == user_id, models.Meeting.id.in_(joined_meeting_ids))
    )


def get_meetings_today(db: Session, user_id: int):
    today = date.today()
    start = datetime.combine(today, datetime.min.time())
    end = datetime.combine(today, datetime.max.time())
    return (
        _meetings_visible_to_user(db, user_id)
        .filter(models.Meeting.start_time >= start, models.Meeting.start_time <= end)
        .order_by(models.Meeting.start_time.asc())
        .all()
    )


def get_meetings_upcoming(db: Session, user_id: int):
    now = datetime.now()
    return (
        _meetings_visible_to_user(db, user_id)
        .filter(
            models.Meeting.status == "scheduled",
            models.Meeting.start_time > now,
        )
        .order_by(models.Meeting.start_time.asc())
        .all()
    )


def get_meetings_recent(db: Session, user_id: int, limit: int = 10):
    return (
        _meetings_visible_to_user(db, user_id)
        .filter(models.Meeting.status == "ended")
        .order_by(models.Meeting.start_time.desc())
        .limit(limit)
        .all()
    )


def get_meetings_by_date(db: Session, target_date: date, user_id: int):
    start = datetime.combine(target_date, datetime.min.time())
    end = datetime.combine(target_date, datetime.max.time())
    return (
        _meetings_visible_to_user(db, user_id)
        .filter(models.Meeting.start_time >= start, models.Meeting.start_time <= end)
        .order_by(models.Meeting.start_time.asc())
        .all()
    )


def ensure_host_participant(
    db: Session, meeting: models.Meeting, host: models.User
) -> models.Participant:
    participant = (
        db.query(models.Participant)
        .filter(
            models.Participant.meeting_id == meeting.id,
            models.Participant.user_id == host.id,
        )
        .first()
    )
    if participant:
        return participant
    participant = models.Participant(
        meeting_id=meeting.id,
        user_id=host.id,
        display_name=host.name,
        is_host=True,
        is_muted=False,
        is_video_on=False,
        is_active_speaker=False,
    )
    db.add(participant)
    db.commit()
    db.refresh(participant)
    return participant


def create_instant_meeting(
    db: Session, payload: schemas.MeetingCreateInstant, host: models.User
) -> models.Meeting:
    meeting_id = generate_meeting_id(db)
    now = datetime.now()
    title = payload.title or f"{host.name}'s Zoom Meeting"
    passcode = generate_passcode()
    meeting = models.Meeting(
        meeting_id=meeting_id,
        passcode=passcode,
        host_id=host.id,
        title=title,
        description=None,
        meeting_type="instant",
        start_time=now,
        end_time=None,
        duration_minutes=30,
        status="active",
        invite_link=build_invite_link(meeting_id, passcode),
    )
    db.add(meeting)
    db.flush()  # get meeting.id

    host_participant = models.Participant(
        meeting_id=meeting.id,
        user_id=host.id,
        display_name=host.name,
        is_host=True,
        is_muted=False,
        is_video_on=False,
        is_active_speaker=False,
    )
    db.add(host_participant)
    db.commit()
    db.refresh(meeting)
    return meeting


def create_scheduled_meeting(
    db: Session, payload: schemas.MeetingCreateScheduled, host: models.User
) -> models.Meeting:
    meeting_id = generate_meeting_id(db)
    end_time = payload.start_time + timedelta(minutes=payload.duration_minutes)
    passcode = generate_passcode()
    meeting = models.Meeting(
        meeting_id=meeting_id,
        passcode=passcode,
        host_id=host.id,
        title=payload.title,
        description=payload.description,
        meeting_type="scheduled",
        start_time=payload.start_time,
        end_time=end_time,
        duration_minutes=payload.duration_minutes,
        status="scheduled",
        invite_link=build_invite_link(meeting_id, passcode),
    )
    db.add(meeting)
    db.commit()
    db.refresh(meeting)
    return meeting


def update_meeting(
    db: Session, meeting: models.Meeting, payload: schemas.MeetingUpdate
) -> models.Meeting:
    if payload.title is not None:
        meeting.title = payload.title
    if payload.description is not None:
        meeting.description = payload.description
    db.commit()
    db.refresh(meeting)
    return meeting


def delete_meeting(db: Session, meeting: models.Meeting) -> None:
    db.delete(meeting)
    db.commit()


def end_meeting(db: Session, meeting: models.Meeting) -> models.Meeting:
    meeting.status = "ended"
    meeting.end_time = datetime.now()
    db.query(models.Participant).filter(
        models.Participant.meeting_id == meeting.id,
        models.Participant.left_at.is_(None),
    ).update({models.Participant.left_at: datetime.now()})
    db.commit()
    db.refresh(meeting)
    return meeting


# ---------- Participants ----------


def join_meeting(
    db: Session, meeting: models.Meeting, payload: schemas.MeetingJoinRequest
) -> models.Participant:
    if payload.passcode != meeting.passcode:
        raise ValueError("Incorrect passcode")
    if meeting.status == "scheduled":
        meeting.status = "active"

    participant = models.Participant(
        meeting_id=meeting.id,
        user_id=payload.user_id,
        display_name=payload.display_name,
        is_host=False,
        is_muted=bool(payload.is_muted),
        is_video_on=bool(payload.is_video_on),
        is_active_speaker=False,
    )
    db.add(participant)
    db.commit()
    db.refresh(participant)
    return participant


def leave_meeting(db: Session, participant: models.Participant) -> None:
    participant.left_at = datetime.now()
    db.commit()


def get_participants(db: Session, meeting: models.Meeting):
    return (
        db.query(models.Participant)
        .filter(
            models.Participant.meeting_id == meeting.id,
            models.Participant.left_at.is_(None),
        )
        .all()
    )


def get_messages(db: Session, meeting: models.Meeting):
    return (
        db.query(models.Message)
        .filter(models.Message.meeting_id == meeting.id)
        .order_by(models.Message.created_at.asc(), models.Message.id.asc())
        .all()
    )


def create_message(
    db: Session,
    meeting: models.Meeting,
    participant: models.Participant,
    text: str,
) -> models.Message:
    message = models.Message(
        meeting_id=meeting.id,
        participant_id=participant.id,
        text=text,
    )
    db.add(message)
    db.commit()
    db.refresh(message)
    return message


def get_participant(db: Session, participant_id: int) -> Optional[models.Participant]:
    return (
        db.query(models.Participant)
        .filter(models.Participant.id == participant_id)
        .first()
    )


def update_participant(
    db: Session, participant: models.Participant, payload: schemas.ParticipantUpdate
) -> models.Participant:
    if payload.is_muted is not None:
        participant.is_muted = payload.is_muted
    if payload.is_video_on is not None:
        participant.is_video_on = payload.is_video_on
    if payload.is_active_speaker is not None:
        participant.is_active_speaker = payload.is_active_speaker
    if payload.is_hand_raised is not None:
        participant.is_hand_raised = payload.is_hand_raised
    if payload.reaction is not None:
        participant.reaction = payload.reaction
        participant.reaction_at = datetime.now()
    db.commit()
    db.refresh(participant)
    return participant


def mute_all(db: Session, meeting: models.Meeting) -> None:
    (
        db.query(models.Participant)
        .filter(
            models.Participant.meeting_id == meeting.id,
            models.Participant.is_host.is_(False),
        )
        .update({models.Participant.is_muted: True})
    )
    db.commit()


def remove_participant(db: Session, participant: models.Participant) -> None:
    db.delete(participant)
    db.commit()
