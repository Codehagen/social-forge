export interface SessionUserInfo {
  user: {
    id: string
    username: string
    email?: string
    avatarUrl?: string
  } | undefined
  authProvider?: 'github' | 'vercel' // Which provider the user signed in with
}

export interface Tokens {
  accessToken: string
  expiresAt?: number
  refreshToken?: string
}

export interface Session {
  user: {
    id: string
    username: string
    email?: string
    avatarUrl?: string
  }
  authProvider: 'github' | 'vercel' // Which provider the user signed in with
}

