from datetime import date as date_type

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.database import get_db
from app.auth import get_current_user

router = APIRouter(prefix="/api/meetings", tags=["meetings"])


def _get_meeting_or_404(db: Session, meeting_id: str):
    meeting = crud.get_meeting_by_meeting_id(db, meeting_id)
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return meeting


def _require_host(meeting, current_user):
    if meeting.host_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the meeting host can perform this action")


def _meeting_response(meeting, current_user):
    response = schemas.MeetingOut.model_validate(meeting)
    if current_user.id != meeting.host_id:
        response = response.model_copy(update={"passcode": None})
    return response


def _message_response(message):
    return schemas.MessageOut(
        id=message.id,
        participant_id=message.participant_id,
        display_name=message.participant.display_name,
        text=message.text,
        created_at=message.created_at,
    )


@router.get("/today", response_model=list[schemas.MeetingOut])
def read_meetings_today(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return [_meeting_response(meeting, current_user) for meeting in crud.get_meetings_today(db, current_user.id)]


@router.get("/upcoming", response_model=list[schemas.MeetingOut])
def read_meetings_upcoming(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return [_meeting_response(meeting, current_user) for meeting in crud.get_meetings_upcoming(db, current_user.id)]


@router.get("/recent", response_model=list[schemas.MeetingOut])
def read_meetings_recent(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return [_meeting_response(meeting, current_user) for meeting in crud.get_meetings_recent(db, current_user.id)]


@router.get("/by-date", response_model=list[schemas.MeetingOut])
def read_meetings_by_date(
    date: date_type = Query(..., description="YYYY-MM-DD"),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return [_meeting_response(meeting, current_user) for meeting in crud.get_meetings_by_date(db, date, current_user.id)]


@router.post("/instant", response_model=schemas.MeetingOut)
def create_instant_meeting(
    payload: schemas.MeetingCreateInstant,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    try:
        return _meeting_response(crud.create_instant_meeting(db, payload, current_user), current_user)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/schedule", response_model=schemas.MeetingOut)
def create_scheduled_meeting(
    payload: schemas.MeetingCreateScheduled,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    try:
        return _meeting_response(crud.create_scheduled_meeting(db, payload, current_user), current_user)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{meeting_id}", response_model=schemas.MeetingDetailOut)
def read_meeting(meeting_id: str, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    meeting = _get_meeting_or_404(db, meeting_id)
    if current_user.id == meeting.host_id:
        crud.ensure_host_participant(db, meeting, current_user)
    return schemas.MeetingDetailOut(
        **_meeting_response(meeting, current_user).model_dump(),
        participants=[schemas.ParticipantOut.model_validate(participant) for participant in crud.get_participants(db, meeting)],
    )


@router.patch("/{meeting_id}", response_model=schemas.MeetingOut)
def patch_meeting(
    meeting_id: str,
    payload: schemas.MeetingUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    meeting = _get_meeting_or_404(db, meeting_id)
    _require_host(meeting, current_user)
    return _meeting_response(crud.update_meeting(db, meeting, payload), current_user)


@router.delete("/{meeting_id}", response_model=schemas.SuccessOut)
def remove_meeting(meeting_id: str, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    meeting = _get_meeting_or_404(db, meeting_id)
    _require_host(meeting, current_user)
    crud.delete_meeting(db, meeting)
    return schemas.SuccessOut()


@router.post("/{meeting_id}/end", response_model=schemas.MeetingOut)
def end_meeting(meeting_id: str, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    meeting = _get_meeting_or_404(db, meeting_id)
    _require_host(meeting, current_user)
    return _meeting_response(crud.end_meeting(db, meeting), current_user)


@router.post("/{meeting_id}/recording/start", response_model=schemas.MeetingOut)
def start_recording(meeting_id: str, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    meeting = _get_meeting_or_404(db, meeting_id)
    _require_host(meeting, current_user)
    meeting.is_recording = True
    db.commit()
    db.refresh(meeting)
    return _meeting_response(meeting, current_user)


@router.post("/{meeting_id}/recording/stop", response_model=schemas.MeetingOut)
def stop_recording(meeting_id: str, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    meeting = _get_meeting_or_404(db, meeting_id)
    _require_host(meeting, current_user)
    meeting.is_recording = False
    db.commit()
    db.refresh(meeting)
    return _meeting_response(meeting, current_user)


@router.post("/{meeting_id}/join", response_model=schemas.ParticipantOut)
def join_meeting(
    meeting_id: str,
    payload: schemas.MeetingJoinRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    meeting = _get_meeting_or_404(db, meeting_id)
    if meeting.status == "ended":
        raise HTTPException(status_code=400, detail="This meeting has ended")
    try:
        return crud.join_meeting(db, meeting, payload.model_copy(update={"user_id": current_user.id}))
    except ValueError as error:
        if str(error) == "Incorrect passcode":
            raise HTTPException(status_code=401, detail=str(error))
        raise


@router.post("/{meeting_id}/leave", response_model=schemas.SuccessOut)
def leave_meeting(
    meeting_id: str,
    payload: schemas.ParticipantLeaveRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    meeting = _get_meeting_or_404(db, meeting_id)
    participant = crud.get_participant(db, payload.participant_id)
    if not participant or participant.meeting_id != meeting.id:
        raise HTTPException(status_code=404, detail="Participant not found")
    if participant.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only leave your own participant session")
    crud.leave_meeting(db, participant)
    return schemas.SuccessOut()


@router.get("/{meeting_id}/participants", response_model=list[schemas.ParticipantOut])
def read_participants(meeting_id: str, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    meeting = _get_meeting_or_404(db, meeting_id)
    return crud.get_participants(db, meeting)


@router.get("/{meeting_id}/messages", response_model=list[schemas.MessageOut])
def read_messages(meeting_id: str, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    meeting = _get_meeting_or_404(db, meeting_id)
    return [_message_response(message) for message in crud.get_messages(db, meeting)]


@router.post("/{meeting_id}/messages", response_model=schemas.MessageOut)
def send_message(
    meeting_id: str,
    payload: schemas.MessageCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    meeting = _get_meeting_or_404(db, meeting_id)
    participant = (
        db.query(models.Participant)
        .filter(
            models.Participant.meeting_id == meeting.id,
            models.Participant.user_id == current_user.id,
        )
        .first()
    )
    if not participant:
        raise HTTPException(status_code=403, detail="You must be a participant in this meeting to send messages")
    return _message_response(crud.create_message(db, meeting, participant, payload.text))


@router.post("/{meeting_id}/mute-all", response_model=schemas.SuccessOut)
def mute_all(meeting_id: str, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    meeting = _get_meeting_or_404(db, meeting_id)
    _require_host(meeting, current_user)
    crud.mute_all(db, meeting)
    return schemas.SuccessOut()
