from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import crud, schemas
from app.database import get_db
from app.auth import get_current_user

router = APIRouter(prefix="/api/participants", tags=["participants"])


def _get_participant_or_404(db: Session, participant_id: int):
    participant = crud.get_participant(db, participant_id)
    if not participant:
        raise HTTPException(status_code=404, detail="Participant not found")
    return participant


def _require_host(participant, current_user):
    if participant.meeting.host_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the meeting host can manage participants")


@router.patch("/{participant_id}", response_model=schemas.ParticipantOut)
def patch_participant(
    participant_id: int,
    payload: schemas.ParticipantUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    participant = _get_participant_or_404(db, participant_id)
    if participant.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only update your own participant session")
    return crud.update_participant(db, participant, payload)


@router.delete("/{participant_id}", response_model=schemas.SuccessOut)
def remove_participant(participant_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    participant = _get_participant_or_404(db, participant_id)
    _require_host(participant, current_user)
    if participant.is_host:
        raise HTTPException(status_code=400, detail="The meeting host cannot be removed")
    crud.remove_participant(db, participant)
    return schemas.SuccessOut()
