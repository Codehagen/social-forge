import { redirect } from 'next/navigation'

export function redirectToSignIn(callbackUrl?: string) {
  const url = callbackUrl ? `/sign-in?redirect=${encodeURIComponent(callbackUrl)}` : '/sign-in'
  redirect(url)
}