import { redirect } from 'next/navigation'

export function redirectToSignIn(callbackUrl?: string) {
  const url = callbackUrl ? `/builder?callbackUrl=${encodeURIComponent(callbackUrl)}` : '/builder'
  redirect(url)
}