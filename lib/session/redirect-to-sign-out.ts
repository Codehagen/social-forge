import { redirect } from 'next/navigation'

export function redirectToSignOut() {
  redirect('/builder')
}