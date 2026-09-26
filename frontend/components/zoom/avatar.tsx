'use client'

import Image from 'next/image'
import { useState } from 'react'
import { cn } from '@/lib/utils'

const avatarColors = ['#0b5cff', '#ff7a00', '#2ecc71', '#8b5cf6', '#ec4899', '#0891b2']

export function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return '?'
  return `${words[0][0]}${words.length > 1 ? words[words.length - 1][0] : ''}`.toUpperCase()
}

export function getAvatarColor(seed: string | number): string {
  const value = String(seed)
  let hash = 0
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) | 0
  }
  return avatarColors[Math.abs(hash) % avatarColors.length]
}

export function Avatar({
  name,
  seed,
  size,
  imageUrl,
  className,
}: {
  name: string
  seed: string | number
  size: number
  imageUrl?: string | null
  className?: string
}) {
  const [imageFailed, setImageFailed] = useState(false)
  const showImage = Boolean(imageUrl && !imageUrl.startsWith('/avatars/') && !imageFailed)
  const fillsContainer = className?.includes('inset-0') || className?.includes('size-full')

  return (
    <span
      className={cn('relative flex shrink-0 items-center justify-center overflow-hidden rounded-full font-bold text-white', className)}
      style={{ width: fillsContainer ? undefined : size, height: fillsContainer ? undefined : size, minWidth: fillsContainer ? undefined : size, minHeight: fillsContainer ? undefined : size, backgroundColor: getAvatarColor(seed), fontSize: size * 0.4 }}
      aria-label={name}
    >
      {showImage ? (
        <Image src={imageUrl as string} alt={name} fill sizes={`${size}px`} className="object-cover" onError={() => setImageFailed(true)} />
      ) : (
        getInitials(name)
      )}
    </span>
  )
}