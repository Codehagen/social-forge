import { atom } from 'jotai'

export interface Task {
  id: string
  prompt: string
  agent: string
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'STOPPED'
  progress: number
  code?: string
  logs?: any[]
  error?: string
  createdAt: string
  completedAt?: string
}

export const taskPromptAtom = atom<string>('')