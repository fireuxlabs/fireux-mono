import type { FireuxStamped } from 'fireux-core/runtime/models/core/meta.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'

/**
 * Runtime models canon: packages/core/fireux-docs/src/runtime/models/README.md
 *
 * Family: Portfolio-scoped
 * Storage: console-owned operational record
 * Owner console: Portfolio
 * Scope: portfolio task and follow-up state
 *
 * Decision note:
 * - Task is currently a portfolio-owned operational entity.
 * - Keep it scoped until there is a concrete need for a broader root task canon.
 * - If that changes later, update the models README first, then this file.
 */

export const Task = {
  id: '' as string,
  portfolio_id: '' as string,
  title: '' as string,
  description: '' as string,
  status: 'open' as 'open' | 'in_progress' | 'done',
  source: 'manual' as 'manual' | 'compliance' | 'documents',
  due_date: '' as string,
  linked_entity_type: '' as string,
  linked_entity_id: '' as string,
  created: {
    at: {} as FirebaseTimestamp,
    by: undefined as FireuxStamped['created']['by'],
    app_id: undefined as FireuxStamped['created']['app_id'],
  },
  updated: {
    at: {} as FirebaseTimestamp,
    by: undefined as FireuxStamped['updated']['by'],
  },
} as const

export type Task = {
  [K in keyof typeof Task]: (typeof Task)[K]
}
