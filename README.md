# Zoom Workplace Clone

A full-stack clone of Zoom Workplace — real account auth, scheduled/instant
meetings, a live meeting room UI (gallery + speaker view), host controls,
chat, reactions/raise-hand, and shareable invite links that auto-join a
logged-in user.

- **Frontend:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4
- **Backend:** FastAPI · SQLAlchemy · SQLite
- **Auth:** JWT bearer tokens (`python-jose`) with bcrypt-hashed passwords (`passlib`)

---

## 1. Monorepo structure

```
zoom-workplace-clone/
├── backend/            FastAPI service — see backend/README.md
│   └── app/
│       ├── main.py         FastAPI app, CORS, router registration
│       ├── database.py     SQLAlchemy engine/session (SQLite)
│       ├── models.py       User, Meeting, Participant, Message
│       ├── schemas.py      Pydantic request/response models
│       ├── crud.py         Query + business logic (ID/passcode/invite-link generation, etc.)
│       ├── auth.py         Password hashing + JWT issue/verify
│       ├── seed.py         Wipes app.db and populates demo data
│       └── routers/        auth.py, users.py, meetings.py, participants.py
│
├── frontend/           Next.js app — see frontend/README.md
│   ├── app/                 Route segments (page.tsx per route)
│   ├── components/zoom/     All UI: home, meeting room, modals, sidebar, top bar
│   └── lib/                 api.ts (REST client), auth.ts, user-context.tsx
│
└── README.md           this file
```

---

## 2. Core features

- **Accounts:** email/password sign-up and login, JWT stored client-side,
  route-guarded (unauthenticated visitors are bounced to `/login`).
- **Meetings:** create instant meetings or schedule ones (30/60/90 min),
  edit or delete a meeting (host-only), view today/upcoming/recent/by-date
  agendas.
- **Real meeting IDs & invite links:** every meeting gets a unique 10-digit
  Zoom-style ID (`XXX XXXX XXXX`) and a 6-digit passcode. The generated
  invite link (`/join/{id}?pwd={passcode}`) pre-fills the join form and, for
  an already logged-in user, **auto-joins** straight into the meeting room.
- **Meeting room:** gallery layout and a speaker/spotlight layout (other
  participants shown as a horizontal strip above the main tile, matching
  Zoom's own layout), deterministic colored-initials avatars when video is
  off, mute/video toggles, raise hand, emoji reactions (nested inside the
  React button, matching Zoom's own UI), text chat, and a fake
  start/stop recording toggle.
- **Host tools:** mute all, remove a participant, end the meeting for
  everyone; host-only actions are enforced server-side, not just hidden in
  the UI.
- **Passcode-gated join:** hosts skip straight to "Start"; everyone else
  sees "Join" and must supply the meeting passcode; ended meetings show
  "This meeting has ended" instead of letting anyone back in.

---

## 3. Quick start (local)

Two terminals, backend first:

```bash
# Terminal 1 — backend
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
echo "SECRET_KEY=$(python -c 'import secrets; print(secrets.token_hex(32))')" > .env
python -m app.seed               # creates app.db + demo data
uvicorn app.main:app --reload --port 8000
```

```bash
# Terminal 2 — frontend
cd frontend
npm install -g pnpm              # if you don't already have it
pnpm install
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
pnpm dev
```

Open **http://localhost:3000** (frontend) — API docs at
**http://localhost:8000/docs**.

### Demo accounts

Seeded by `python -m app.seed`, all with password `password123`:

| Name | Email |
|---|---|
| Aanya Varshney | aanya.varshney@example.com |
| Priya Shah | priya.shah@example.com |
| Marcus Lee | marcus.lee@example.com |
| Jordan Rivera | jordan.rivera@example.com |
| Arpit Varshney | arpit.varshney@example.com |

Or just sign up a fresh account from `/signup` — it works end to end.

---

## 4. Deployment (summary)

- **Backend → Render** (or Railway/Fly.io): deploy `backend/` as a web
  service, set `SECRET_KEY` as an environment variable, start command
  `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
- **Frontend → Vercel**: deploy `frontend/` as the project root, set
  `NEXT_PUBLIC_API_URL` to the deployed backend's URL **before** the first
  build (it's inlined at build time).

See the assistant's step-by-step deployment walkthrough for the exact
click-by-click sequence, and `backend/README.md` / `frontend/README.md` for
service-specific detail.

---

## 5. Known limitations

- **SQLite is file-based.** Most free-tier PaaS hosts (Render free web
  services, for example) use an ephemeral filesystem — `app.db` resets on
  redeploy/restart unless you attach a persistent disk or move to a hosted
  Postgres/MySQL instance. Fine for a demo/portfolio deployment; worth
  noting explicitly if this is a graded submission.
- **No real WebRTC media.** Video tiles are UI state (avatar-when-off /
  colored tile when "on") — there's no actual camera/mic streaming between
  participants.
- **Not implemented:** co-host transfer, meeting lock, waiting room. These
  were intentionally out of scope.
