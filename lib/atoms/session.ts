import { atom } from 'jotai'

export interface SessionUserInfo {
  user: {
    id: string
    name: string | null
    email: string | null
    image: string | null
  } | null
}

export const sessionAtom = atom<SessionUserInfo>({ user: null })
export const sessionInitializedAtom = atom(false)