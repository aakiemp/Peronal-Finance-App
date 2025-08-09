"use server"

import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function signInWithEmail(email: string, redirectTo?: string) {
  const supabase = createSupabaseServerClient()
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: redirectTo || `${process.env.NEXT_PUBLIC_SITE_URL || ''}/auth/callback`,
    },
  })
  if (error) throw new Error(error.message)
}

export async function signOut() {
  const supabase = createSupabaseServerClient()
  const { error } = await supabase.auth.signOut()
  if (error) throw new Error(error.message)
}

export async function getSession() {
  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase.auth.getSession()
  if (error) throw new Error(error.message)
  return data.session
}