'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { register } from '@/lib/auth'
import { fieldInput, fieldLabel, primaryBtn } from '@/components/zoom/modals/modal'

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await register(name.trim(), email.trim(), password)
      router.replace('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create your account.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-zoom-canvas px-4">
      <section className="w-full max-w-md rounded-xl border border-zoom-line bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-zoom-ink">Create your Zoom Workplace account</h1>
        <p className="mt-1 text-sm text-zoom-muted">Start hosting and joining meetings.</p>
        <form onSubmit={submit} className="mt-6 flex flex-col gap-4">
          <div><label htmlFor="signup-name" className={fieldLabel}>Name</label><input id="signup-name" required className={fieldInput} value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div><label htmlFor="signup-email" className={fieldLabel}>Email</label><input id="signup-email" type="email" required className={fieldInput} value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <div><label htmlFor="signup-password" className={fieldLabel}>Password</label><input id="signup-password" type="password" minLength={8} required className={fieldInput} value={password} onChange={(e) => setPassword(e.target.value)} /></div>
          {error && <p role="alert" className="text-sm text-zoom-red">{error}</p>}
          <button type="submit" disabled={submitting} className={`${primaryBtn} w-full`}>Create account</button>
        </form>
        <p className="mt-5 text-center text-sm text-zoom-muted">Already have an account? <Link href="/login" className="font-medium text-zoom-blue hover:underline">Log in</Link></p>
      </section>
    </main>
  )
}