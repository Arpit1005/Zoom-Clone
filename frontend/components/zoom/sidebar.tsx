'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Ellipsis, Hexagon, House, MessageCircle, Orbit, Settings, Video,Calendar, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

type NavItem = { label: string; icon: LucideIcon; href: string; badge?: string }

const items: NavItem[] = [
  { label: 'Home', icon: House, href: '/' },
  { label: 'ZoomMate', icon: Orbit, href: '#zoommate' },
  { label: 'Calendar', icon: Calendar, href: '#calendar' },
  { label: 'Chat', icon: MessageCircle, href: '#chat' },
  { label: 'Hub', icon: Hexagon, href: '#hub' },
  { label: 'More', icon: Ellipsis, href: '#more' },
]

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/' || pathname === '/join' || pathname === '/schedule'
  return pathname.startsWith(href)
}

function NavLink({ item, active, compact }: { item: NavItem; active: boolean; compact?: boolean }) {
  const Icon = item.icon
  return (
    <Link
      href={item.href}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'group relative flex flex-col items-center gap-1 rounded-lg transition-colors',
        compact ? 'flex-1 py-1.5' : 'w-[64px] py-2',
        active ? 'text-zoom-blue' : 'text-zoom-muted hover:bg-zoom-field hover:text-zoom-ink',
      )}
    >
      <span
        className={cn(
          'flex items-center justify-center rounded-lg transition-colors',
          compact ? 'h-7 w-10' : 'size-9',
          active && 'bg-zoom-blue-soft',
        )}
      >
        <Icon className="size-[22px]" strokeWidth={active ? 2.2 : 1.8} aria-hidden="true" />
      </span>
      <span className={cn('text-[11px] leading-none', active ? 'font-semibold' : 'font-medium')}>{item.label}</span>
      {item.badge && (
        <span
          className={cn(
            'absolute rounded-full bg-zoom-blue px-1.5 py-px text-[9px] font-semibold leading-tight text-white',
            compact ? 'top-0 right-1/2 translate-x-6' : 'top-0.5 right-0',
          )}
        >
          {item.badge}
        </span>
      )}
    </Link>
  )
}

export function Sidebar() {
  const pathname = usePathname()

  return (
    <>
      <nav
        aria-label="Primary"
        className="hidden w-[84px] shrink-0 flex-col items-center justify-between border-r border-zoom-line bg-white py-3 md:flex"
      >
        <ul className="flex flex-col items-center gap-3">
          {items.map((item) => (
            <li key={item.label}>
              <NavLink item={item} active={isActive(pathname, item.href)} />
            </li>
          ))}
        </ul>
        <NavLink item={{ label: 'Settings', icon: Settings, href: '#settings' }} active={false} />
      </nav>

      <nav
        aria-label="Primary mobile"
        className="fixed inset-x-0 bottom-0 z-30 flex border-t border-zoom-line bg-white px-1 pt-1 pb-[max(env(safe-area-inset-bottom),4px)] md:hidden"
      >
        {items.slice(0, 5).map((item) => (
          <NavLink key={item.label} item={item} active={isActive(pathname, item.href)} compact />
        ))}
        <NavLink item={items[5]} active={false} compact />
      </nav>
    </>
  )
}
