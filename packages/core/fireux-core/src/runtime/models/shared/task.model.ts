import type { FirebaseTimestamp } from '../../../types/firebase'

/**
 * Runtime models canon: packages/core/fireux-docs/src/runtime/models/README.md
 *
 * Family: Shared model support
 * Storage: reusable runtime contract, not a canonical entity by itself
 * Used by: apps that need a minimal task surface before introducing a console-specific task model
 *
 * Decision note:
 * - This is a shared protocol, not the final task canon for every console.
 * - Console-specific task entities should still declare their owner and scope explicitly in their own files.
 * - If this contract changes later, update the models README first, then this file.
 */
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

  created: {
    at: FirebaseTimestamp
    by?: string
    app_id?: string
  }
  updated: {
    at: FirebaseTimestamp
    by?: string
  }
}
