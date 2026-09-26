'use client'

import { useEffect, useState } from 'react'

const timeFmt = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' })
const dateFmt = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })

export function LiveClock() {
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    setNow(new Date())
    const id = setInterval(() => setNow(new Date()), 1000 * 15)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="flex flex-col items-center text-center">
      <p className="text-5xl font-bold tracking-tight text-zoom-ink tabular-nums md:text-[40px] md:leading-[1.1]">
        {now ? timeFmt.format(now) : '12:01 PM'}
      </p>
      <p className="mt-1.5 text-sm text-zoom-muted">{now ? dateFmt.format(now) : 'Friday, September 25, 2026'}</p>
    </div>
  )
}
