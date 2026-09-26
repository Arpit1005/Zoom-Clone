from datetime import datetime
from typing import Optional, List, Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator


# ---------- Users ----------


class UserBase(BaseModel):
    name: str
    email: Optional[str] = None
    avatar_url: Optional[str] = None
    is_online: bool = True


class UserOut(UserBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime


class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ---------- Meetings ----------


class MeetingCreateInstant(BaseModel):
    title: Optional[str] = None


class MeetingCreateScheduled(BaseModel):
    title: str
    description: Optional[str] = None
    start_time: datetime
    duration_minutes: Literal[30, 60, 90]


class MeetingUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None


class MeetingOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    meeting_id: str
    passcode: Optional[str] = None
    title: str
    description: Optional[str] = None
    meeting_type: str
    start_time: datetime
    end_time: Optional[datetime] = None
    duration_minutes: Optional[int] = None
    status: str
    invite_link: str
    is_recording: bool
    created_at: datetime
    host: UserOut


# ---------- Participants ----------


class MeetingJoinRequest(BaseModel):
    display_name: str
    passcode: str
    user_id: Optional[int] = None
    is_muted: Optional[bool] = False
    is_video_on: Optional[bool] = False


class ParticipantUpdate(BaseModel):
    is_muted: Optional[bool] = None
    is_video_on: Optional[bool] = None
    is_active_speaker: Optional[bool] = None
    is_hand_raised: Optional[bool] = None
    reaction: Optional[str] = None


class ParticipantReactionUpdate(BaseModel):
    is_hand_raised: Optional[bool] = None
    reaction: Optional[str] = None


class ParticipantLeaveRequest(BaseModel):
    participant_id: int


class ParticipantOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    display_name: str
    is_host: bool
    is_muted: bool
    is_video_on: bool
    is_active_speaker: bool
    is_hand_raised: bool
    reaction: Optional[str] = None
    reaction_at: Optional[datetime] = None
    joined_at: datetime
    left_at: Optional[datetime] = None
    user: Optional[UserOut] = None


class MeetingDetailOut(MeetingOut):
    participants: List[ParticipantOut] = []


class MessageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    participant_id: int
    display_name: str
    text: str
    created_at: datetime


class MessageCreate(BaseModel):
    text: str = Field(min_length=1)

    @field_validator("text")
    @classmethod
    def validate_text(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Message cannot be empty")
        return value


class SuccessOut(BaseModel):
    success: bool = True
