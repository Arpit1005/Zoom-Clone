# Zoom Workplace Clone — Frontend

Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS v4 client for
the Zoom Workplace clone. Talks to the FastAPI backend over a small typed
REST client (`lib/api.ts`); no mock data — every screen is backed by real
API calls.

## Setup

```bash
npm install -g pnpm     # if you don't already have it
pnpm install
```

Create `frontend/.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

(This must point at your backend — see the root README for running the
backend locally.)

```bash
pnpm dev
```

Open http://localhost:3000. Sign up a new account or use one of the seeded
demo accounts (see root README) at `/login`.

## Routes

| Route | Renders |
|---|---|
| `/` | Home — agenda, quick actions (New meeting / Join / Schedule) |
| `/login`, `/signup` | Auth forms, call `lib/auth.ts` |
| `/schedule` | Home view, opened straight into the Schedule modal |
| `/join` | Home view, opened straight into the Join modal |
| `/join/[id]` | Same, but pre-fills the meeting ID + passcode from an invite link's `?pwd=` query param, and **auto-joins** once the logged-in user's name is available |
| `/meeting/[id]` | The live meeting room (`MeetingRoom`) |

## Folder structure

```
frontend/
├── app/                     Route segments — thin, delegate to components/
│   ├── page.tsx
│   ├── login/page.tsx, signup/page.tsx
│   ├── schedule/page.tsx, join/page.tsx, join/[id]/page.tsx
│   └── meeting/[id]/page.tsx
├── components/zoom/
│   ├── home/                Home dashboard: home-view, agenda-card, meeting-details,
│   │                        meeting-parts (HostAvatar wrapper), rich-meeting-details, live-clock
│   ├── meeting/              meeting-room, video-stage (gallery + speaker layouts),
│   │                        meeting-toolbar, meeting-top-bar, local-video-render
│   ├── modals/               join-modal, schedule-modal, edit-meeting-modal, modal (shared primitives)
│   ├── avatar.tsx            Shared deterministic initials + seeded-color avatar
│   ├── sidebar.tsx            Left nav (Home / ZoomMate / Meetings / Chat / Hub / More)
│   ├── top-bar.tsx            Home dashboard top bar
│   └── app-shell.tsx          Layout wrapper (sidebar + top bar + content)
└── lib/
    ├── api.ts                Typed REST client, reads NEXT_PUBLIC_API_URL, attaches the bearer token
    ├── auth.ts                login()/register()/clearAuth(), stores the JWT in localStorage
    └── user-context.tsx       UserProvider — loads the current user on mount, redirects to /login if unauthenticated
```

## Auth flow

- `lib/auth.ts` stores the backend's JWT in `localStorage` under
  `zoom-auth-token`.
- `UserProvider` (`lib/user-context.tsx`) checks for that token on every
  route change; if it's missing (or `/api/auth/me` rejects it), it clears
  storage and redirects to `/login` — except `/login` and `/signup`
  themselves.
- `useCurrentUser()` / `useAuth()` expose the logged-in user and a
  `logout()` helper to any component.

> Note: the redirect-to-login above does **not** currently preserve the
> original URL, so a signed-out visitor who clicks a `/join/[id]` invite
> link lands on a plain login page rather than being sent back into the
> join flow after signing in. Already-logged-in users following the same
> link auto-join correctly.

## Key UI details worth knowing before you touch them

- **Avatar** (`components/zoom/avatar.tsx`): initials + a color derived
  deterministically from a seed (user id or display name), so the same
  person always gets the same color. Pass `size` explicitly; avoid
  `inset-0`/`size-full` in `className` unless you want it to stretch to
  fill its container (`fillsContainer` mode) — the meeting-room usage
  centers a fixed-size circle instead via translate classes.
- **Video stage speaker layout** (`components/zoom/meeting/video-stage.tsx`):
  the non-gallery layout renders other participants as a horizontal,
  horizontally-scrollable strip **above** the main speaker tile
  (`flex-col`, others block first) — not a sidebar, matching Zoom's actual
  layout.
- **Toolbar** (`components/zoom/meeting/meeting-toolbar.tsx`): Raise Hand
  lives inside the React (reactions) popup as its own row below the emoji
  strip, not as a separate toolbar icon; Record is a "More" menu item
  rather than a standalone icon — both match the reference Zoom Workplace
  toolbar rather than a naive 1:1 feature-to-icon mapping.

## Build

```bash
pnpm build
pnpm start
```

`NEXT_PUBLIC_API_URL` is inlined at **build time** — set it in your hosting
provider's environment variables before the build runs, not after.
`next.config.js` already sets `typescript.ignoreBuildErrors: true` and
`images.unoptimized: true`, so the build won't fail on type errors or
require an image loader.

## Deployment (Vercel)

1. Push this repo to GitHub.
2. Vercel → Add New Project → import the repo → set **Root Directory** to `frontend` (Next.js is auto-detected; `pnpm` is auto-detected from `pnpm-lock.yaml`).
3. Environment Variables → add `NEXT_PUBLIC_API_URL` = your deployed backend's URL (e.g. `https://<name>.onrender.com`).
4. Deploy.
5. If you change `NEXT_PUBLIC_API_URL` later, trigger a redeploy — it won't take effect until the app is rebuilt.
