"use client"

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { signInWithEmail } from '@/server/actions/auth'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const params = useSearchParams()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      await signInWithEmail(email, params.get('redirect') || undefined)
      setSent(true)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to send magic link'
      setError(message)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md border rounded-md p-6 bg-white">
        <h1 className="text-2xl font-semibold mb-2">Sign in</h1>
        <p className="text-sm text-gray-600 mb-6">We will send you a magic link to sign in.</p>
        {sent ? (
          <div className="text-green-700">Check your email for the magic link.</div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
            {error && <div className="text-red-600 text-sm">{error}</div>}
            <button type="submit" className="w-full bg-black text-white py-2 rounded">
              Send magic link
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-4">Loading…</div>}>
      <LoginForm />
    </Suspense>
  )
}