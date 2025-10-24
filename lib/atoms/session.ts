import { atom } from 'jotai'

export interface SessionUserInfo {
  user?: {
    id: string
    name: string | null
    email: string | null
    image: string | null
  }
  authProvider?: string
}

export const sessionAtom = atom<SessionUserInfo>({ user: undefined })
export const sessionInitializedAtom = atom(false)