import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const supabase = createSupabaseServerClient()
  await supabase.auth.exchangeCodeForSession(request.url)
  const url = new URL(request.url)
  const redirect = url.searchParams.get('redirect') || '/'
  return NextResponse.redirect(new URL(redirect, url.origin))
}