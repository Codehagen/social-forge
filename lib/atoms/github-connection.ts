import { atom } from 'jotai'

export interface GitHubConnection {
  connected: boolean
  username?: string | null
  source?: 'account' | 'env'
  connectedAt?: string | null
}

export const githubConnectionAtom = atom<GitHubConnection>({ connected: false })
export const githubConnectionInitializedAtom = atom(false)
