'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { login } from '@/lib/auth'
import { fieldInput, fieldLabel, primaryBtn } from '@/components/zoom/modals/modal'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await login(email.trim(), password)
      router.replace('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to log in.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-zoom-canvas px-4">
      <section className="w-full max-w-md rounded-xl border border-zoom-line bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-zoom-ink">Log in to Zoom Workplace</h1>
        <p className="mt-1 text-sm text-zoom-muted">Use your account to continue.</p>
        <form onSubmit={submit} className="mt-6 flex flex-col gap-4">
          <div><label htmlFor="login-email" className={fieldLabel}>Email</label><input id="login-email" type="email" required className={fieldInput} value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <div><label htmlFor="login-password" className={fieldLabel}>Password</label><input id="login-password" type="password" required className={fieldInput} value={password} onChange={(e) => setPassword(e.target.value)} /></div>
          {error && <p role="alert" className="text-sm text-zoom-red">{error}</p>}
          <button type="submit" disabled={submitting} className={`${primaryBtn} w-full`}>Log in</button>
        </form>
        <p className="mt-5 text-center text-sm text-zoom-muted">Need an account? <Link href="/signup" className="font-medium text-zoom-blue hover:underline">Sign up</Link></p>
      </section>
    </main>
  )
}