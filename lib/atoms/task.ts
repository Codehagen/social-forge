import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { atomFamily } from 'jotai/utils'

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

// Task prompt that persists in localStorage
export const taskPromptAtom = atomWithStorage('task-prompt', '')

// Per-task chat input that persists in localStorage
// Each task gets its own atom with its own localStorage key
export const taskChatInputAtomFamily = atomFamily((taskId: string) => atomWithStorage(`task-chat-input-${taskId}`, ''))