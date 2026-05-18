// FILE: packages/extensions/fireux-companies/src/runtime/models/company.model.ts

import type { FirebaseTimestamp } from 'fireux-core/types/firebase'

/**
 * Runtime models canon: packages/core/fireux-docs/src/runtime/models/README.md
 *
 * Family: Domain Root
 * Storage: root canonical model
 * Root path: /companies/<placeId>
 * Root link: company identity is anchored to Place via the same root id
 *
 * Decision note:
 * - Company is a root entity layered on top of Place, not a console-owned record.
 * - The root Place id stays the stable link instead of inventing a second company identity.
 * - If that relationship changes later, update the models README first, then this file.
 */
export const CompanyModel = {
  id: '' as string,
  created: {
    at: {} as FirebaseTimestamp,
  },
  updated: {
    at: {} as FirebaseTimestamp,
  },
} as const

export type Company = {
  [K in keyof typeof CompanyModel]: (typeof CompanyModel)[K]
}

export type CompanyCreateInput = Omit<Company, 'created' | 'updated'>
export type CompanyUpdateInput = Partial<Omit<Company, 'id' | 'created' | 'updated'>>
