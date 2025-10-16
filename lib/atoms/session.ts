import { atom } from 'jotai'
import { type SessionUserInfo } from '@/lib/session/types'

export interface SessionUser {
  id: string
  username: string
  email?: string
  avatarUrl?: string
}

export interface Session {
  user?: SessionUser
}

export const sessionAtom = atom<SessionUserInfo | null>(null)
export const sessionInitializedAtom = atom<boolean>(false)