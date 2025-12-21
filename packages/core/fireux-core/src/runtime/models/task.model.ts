import type { FirebaseTimestamp } from '../types/firebase'

export type TaskStatus =
  | 'todo'
  | 'in_progress'
  | 'done'
  | 'skipped'
  | 'cancelled'

export type TaskPriority = 'low' | 'normal' | 'high'

/**
 * Minimal reusable task surface that any FireUX app can extend.
 */
export interface CoreTask {
  id: string
  label: string
  description?: string | null
  status: TaskStatus
  priority?: TaskPriority
  assignee_id?: string | null

  due_at?: FirebaseTimestamp | null
  completed_at?: FirebaseTimestamp | null

  created_at: FirebaseTimestamp
  updated_at: FirebaseTimestamp
}
