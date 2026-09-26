'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Bell, Calendar, ChevronLeft, ChevronRight, History, Search } from 'lucide-react'
import { useState } from 'react'
import { ZoomLogo } from './zoom-logo'
import { useAuth } from '@/lib/user-context'
import { Avatar } from './avatar'

const iconBtn =
  'inline-flex size-8 items-center justify-center rounded-full text-zoom-muted transition-colors hover:bg-zoom-field hover:text-zoom-ink focus-visible:outline-2 focus-visible:outline-zoom-blue'

export function TopBar() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-zoom-line bg-white px-3 md:px-4">
      <div className="flex items-center gap-1 md:w-[260px]">
        <Link href="/" className="mr-2 rounded-md px-1 hover:opacity-80 md:mr-4">
          <ZoomLogo />
        </Link>
        <div className="hidden items-center gap-0.5 sm:flex">
          <button type="button" className={iconBtn} aria-label="Back" onClick={() => router.back()}>
            <ChevronLeft className="size-[18px]" />
          </button>
          <button type="button" className={`${iconBtn} opacity-40 hover:bg-transparent`} aria-label="Forward" disabled>
            <ChevronRight className="size-[18px]" />
          </button>
          <button type="button" className={iconBtn} aria-label="History">
            <History className="size-[17px]" />
          </button>
        </div>
      </div>

      <div className="flex flex-1 justify-center">
        <label className="hidden h-8 w-full max-w-[440px] cursor-text items-center gap-2 rounded-full bg-zoom-field px-3 transition-colors hover:bg-[#e8e9ec] focus-within:bg-white focus-within:ring-2 focus-within:ring-zoom-blue md:flex">
          <Search className="size-4 text-zoom-muted" aria-hidden="true" />
          <span className="sr-only">Search</span>
          <input
            type="search"
            placeholder="Search (Ctrl+E)"
            className="w-full bg-transparent text-[13px] text-zoom-ink outline-none placeholder:text-zoom-muted"
          />
        </label>
      </div>

      <div className="flex items-center justify-end gap-1 md:w-[260px] md:gap-1.5">
        <button type="button" className={`${iconBtn} md:hidden`} aria-label="Search">
          <Search className="size-[18px]" />
        </button>
        
        <button type="button" className={iconBtn} aria-label="Notifications">
          <Bell className="size-[18px]" />
        </button>
        <button type="button" className={`${iconBtn} hidden sm:inline-flex`} aria-label="Calendar">
          <Calendar className="size-[18px]" />
        </button>
        <div className="relative ml-1">
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
          className="relative ml-1 rounded-full ring-offset-2 transition hover:ring-2 hover:ring-zoom-line"
          aria-label={`${user?.name ?? 'Current user'}, available`}
          >
          <Avatar name={user?.name ?? 'Current user'} seed={user?.id ?? user?.name ?? 'user'} size={30} />
          <span className="absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full border-2 border-white bg-zoom-speaker" />
          </button>
          {menuOpen && (
            <div className="absolute top-10 right-0 z-20 w-44 rounded-lg border border-zoom-line bg-white p-1 shadow-lg">
              <p className="px-3 py-2 text-xs text-zoom-muted">{user?.email}</p>
              <button type="button" onClick={logout} className="w-full rounded-md px-3 py-2 text-left text-sm text-zoom-ink hover:bg-zoom-field">
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
