import type { FireuxStamped } from 'fireux-core/runtime/models/core/meta.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'

/**
 * Runtime models canon: packages/core/fireux-docs/src/runtime/models/README.md
 *
 * Family: Portfolio-scoped
 * Storage: console-owned operational record
 * Owner console: Portfolio
 * Scope: portfolio compliance state and evidence linkage
 *
 * Decision note:
 * - ComplianceRecord exists because a portfolio owns and tracks compliance work.
 * - It should stay scoped even when it links to supporting root records like type or document.
 * - If its ownership changes later, update the models README first, then this file.
 */
export const ComplianceRecord = {
  id: '' as string,
  portfolio_id: '' as string,
  property_id: '' as string,
  unit_id: '' as string,
  type_id: '' as string,
  type_label: '' as string,
  provider: '' as string,
  issue_date: '' as string,
  expiry_date: '' as string,
  document_id: '' as string,
  notes: '' as string,
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

export type ComplianceRecord = {
  [K in keyof typeof ComplianceRecord]: (typeof ComplianceRecord)[K]
}
