"""
Populates app.db with the sample data described in the project spec.
Run with: python -m app.seed
Safe to re-run: it wipes and recreates all tables first.
"""

from datetime import datetime, timedelta, date

from app.database import Base, engine, SessionLocal
from app import models
from app.auth import hash_password
from app.crud import build_invite_link, generate_passcode


def combine(d: date, hour: int, minute: int) -> datetime:
    return datetime(d.year, d.month, d.day, hour, minute)


def run():
    # Fresh schema every time this script runs.
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # ---------- Users ----------
        aanya = models.User(
            name="Aanya Varshney",
            email="aanya.varshney@example.com",
            avatar_url="/avatars/aanya.png",
            is_online=True,
            hashed_password=hash_password("password123"),
        )
        priya = models.User(
            name="Priya Shah",
            email="priya.shah@example.com",
            avatar_url="/avatars/priya.png",
            is_online=True,
            hashed_password=hash_password("password123"),
        )
        marcus = models.User(
            name="Marcus Lee",
            email="marcus.lee@example.com",
            avatar_url="/avatars/marcus.png",
            is_online=False,
            hashed_password=hash_password("password123"),
        )
        jordan = models.User(
            name="Jordan Rivera",
            email="jordan.rivera@example.com",
            avatar_url="/avatars/jordan.png",
            is_online=True,
            hashed_password=hash_password("password123"),
        )
        arpit = models.User(
            name="Arpit Varshney",
            email="arpit.varshney@example.com",
            avatar_url="/avatars/arpit.png",
            is_online=True,
            hashed_password=hash_password("password123"),
        )

        db.add_all([aanya, priya, marcus, jordan, arpit])
        db.flush()  # assign ids

        today = date.today()
        tomorrow = today + timedelta(days=1)
        in_3_days = today + timedelta(days=3)
        yesterday = today - timedelta(days=1)
        days_ago_3 = today - timedelta(days=3)
        days_ago_4 = today - timedelta(days=4)

        # ---------- Meeting 1: instant/today, ended ----------
        m1_start = combine(today, 11, 59)
        m1_end = combine(today, 12, 1)
        m1_id = "721 6568 0811"
        passcode = generate_passcode()
        meeting1 = models.Meeting(
            meeting_id=m1_id,
            passcode=passcode,
            host_id=aanya.id,
            title=f"{aanya.name}'s Zoom Meeting",
            description=None,
            meeting_type="instant",
            start_time=m1_start,
            end_time=m1_end,
            duration_minutes=2,
            status="ended",
            invite_link=build_invite_link(m1_id, passcode),
        )
        db.add(meeting1)
        db.flush()

        db.add_all(
            [
                models.Participant(
                    meeting_id=meeting1.id,
                    user_id=aanya.id,
                    display_name=aanya.name,
                    is_host=True,
                    is_muted=True,
                    is_video_on=False,
                    is_active_speaker=True,
                ),
                models.Participant(
                    meeting_id=meeting1.id,
                    user_id=arpit.id,
                    display_name=arpit.name,
                    is_host=False,
                    is_muted=True,
                    is_video_on=False,
                    is_active_speaker=False,
                ),
            ]
        )

        # ---------- Meeting 2: upcoming, today ----------
        m2_start = combine(today, 10, 30)
        passcode = generate_passcode()
        meeting2 = models.Meeting(
            meeting_id="304 1122 5599",
            passcode=passcode,
            host_id=aanya.id,
            title="Product Design Sync",
            description=None,
            meeting_type="scheduled",
            start_time=m2_start,
            end_time=m2_start + timedelta(minutes=30),
            duration_minutes=30,
            status="scheduled",
            invite_link=build_invite_link("304 1122 5599", passcode),
        )
        db.add(meeting2)

        # ---------- Meeting 3: upcoming, today, host = Priya ----------
        m3_start = combine(today, 14, 0)
        passcode = generate_passcode()
        meeting3 = models.Meeting(
            meeting_id="512 8834 9021",
            passcode=passcode,
            host_id=priya.id,
            title="Q4 Roadmap Review",
            description=None,
            meeting_type="scheduled",
            start_time=m3_start,
            end_time=m3_start + timedelta(minutes=60),
            duration_minutes=60,
            status="scheduled",
            invite_link=build_invite_link("512 8834 9021", passcode),
        )
        db.add(meeting3)

        # ---------- Meeting 4: upcoming, tomorrow ----------
        m4_start = combine(tomorrow, 9, 0)
        passcode = generate_passcode()
        meeting4 = models.Meeting(
            meeting_id="877 2201 6634",
            passcode=passcode,
            host_id=aanya.id,
            title="Weekly Engineering Standup",
            description=None,
            meeting_type="scheduled",
            start_time=m4_start,
            end_time=m4_start + timedelta(minutes=30),
            duration_minutes=30,
            status="scheduled",
            invite_link=build_invite_link("877 2201 6634", passcode),
        )
        db.add(meeting4)

        # ---------- Meeting 5: upcoming, 3 days from now, host = Marcus ----------
        m5_start = combine(in_3_days, 11, 0)
        passcode = generate_passcode()
        meeting5 = models.Meeting(
            meeting_id="639 4470 1183",
            passcode=passcode,
            host_id=marcus.id,
            title="Customer Onboarding Workshop",
            description=None,
            meeting_type="scheduled",
            start_time=m5_start,
            end_time=m5_start + timedelta(minutes=90),
            duration_minutes=90,
            status="scheduled",
            invite_link=build_invite_link("639 4470 1183", passcode),
        )
        db.add(meeting5)

        # ---------- Meeting 6: recent/ended, yesterday, 8 participants ----------
        m6_start = combine(yesterday, 16, 0)
        m6_id = "204 5567 8812"
        passcode = generate_passcode()
        meeting6 = models.Meeting(
            meeting_id=m6_id,
            passcode=passcode,
            host_id=aanya.id,
            title="Marketing Campaign Kickoff",
            description=None,
            meeting_type="scheduled",
            start_time=m6_start,
            end_time=m6_start + timedelta(minutes=45),
            duration_minutes=45,
            status="ended",
            invite_link=build_invite_link(m6_id, passcode),
        )
        db.add(meeting6)
        db.flush()

        m6_names = [
            "Aanya Varshney",
            "Guest User 1",
            "Guest User 2",
            "Guest User 3",
            "Guest User 4",
            "Guest User 5",
            "Guest User 6",
            "Guest User 7",
        ]
        for i, name in enumerate(m6_names):
            db.add(
                models.Participant(
                    meeting_id=meeting6.id,
                    user_id=aanya.id if name == "Aanya Varshney" else None,
                    display_name=name,
                    is_host=(i == 0),
                    is_muted=False,
                    is_video_on=False,
                    is_active_speaker=False,
                )
            )

        # ---------- Meeting 7: recent/ended, 3 days ago, host = Jordan ----------
        m7_start = combine(days_ago_3, 13, 30)
        m7_id = "998 3301 4456"
        passcode = generate_passcode()
        meeting7 = models.Meeting(
            meeting_id=m7_id,
            passcode=passcode,
            host_id=jordan.id,
            title="1:1 with Jordan",
            description=None,
            meeting_type="scheduled",
            start_time=m7_start,
            end_time=m7_start + timedelta(minutes=30),
            duration_minutes=30,
            status="ended",
            invite_link=build_invite_link(m7_id,passcode),
        )
        db.add(meeting7)
        db.flush()

        db.add_all(
            [
                models.Participant(
                    meeting_id=meeting7.id,
                    user_id=jordan.id,
                    display_name=jordan.name,
                    is_host=True,
                    is_muted=False,
                    is_video_on=False,
                    is_active_speaker=False,
                ),
                models.Participant(
                    meeting_id=meeting7.id,
                    user_id=aanya.id,
                    display_name=aanya.name,
                    is_host=False,
                    is_muted=False,
                    is_video_on=False,
                    is_active_speaker=False,
                ),
            ]
        )

        # ---------- Meeting 8: recent/ended, 4 days ago, 142 participants ----------
        m8_start = combine(days_ago_4, 10, 0)
        m8_id = "460 7789 2245"
        passcode = generate_passcode()
        meeting8 = models.Meeting(
            meeting_id=m8_id,
            passcode=passcode,
            host_id=aanya.id,
            title="All Hands — September",
            description=None,
            meeting_type="scheduled",
            start_time=m8_start,
            end_time=m8_start + timedelta(minutes=60),
            duration_minutes=60,
            status="ended",
            invite_link=build_invite_link(m8_id, passcode),
        )
        db.add(meeting8)
        db.flush()

        db.add(
            models.Participant(
                meeting_id=meeting8.id,
                user_id=aanya.id,
                display_name=aanya.name,
                is_host=True,
                is_muted=False,
                is_video_on=False,
                is_active_speaker=False,
            )
        )
        for i in range(1, 142):
            db.add(
                models.Participant(
                    meeting_id=meeting8.id,
                    user_id=None,
                    display_name=f"Attendee {i}",
                    is_host=False,
                    is_muted=True,
                    is_video_on=False,
                    is_active_speaker=False,
                )
            )

        db.commit()
        print("Seed complete: app.db created and populated.")
    finally:
        db.close()


if __name__ == "__main__":
    run()
