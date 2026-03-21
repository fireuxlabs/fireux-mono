import type { FireuxStamped } from 'fireux-core/runtime/models/core/meta.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'

/**
 * Runtime models canon: packages/core/fireux-docs/src/runtime/models/README.md
 *
 * Family: Extension support
 * Storage: root extension lookup model
 * Scope: compliance type definitions used by portfolio-scoped records
 *
 * Decision note:
 * - ComplianceItemType is a supporting lookup surface, not part of the main shared entity canon.
 * - Keep it explicit so future cleanup does not mistake it for a console or domain-root entity.
 * - If its role changes later, update the models README first, then this file.
 */
export const ComplianceItemType = {
  id: '' as string,
  code: '' as string,
  label: '' as string,
  description: '' as string,
  scope: 'property' as 'portfolio' | 'property' | 'unit',
  active: true as boolean,
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

export type ComplianceItemType = {
  [K in keyof typeof ComplianceItemType]: (typeof ComplianceItemType)[K]
}
