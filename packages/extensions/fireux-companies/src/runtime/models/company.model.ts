// FILE: packages/extensions/fireux-companies/src/runtime/models/company.model.ts

import { defineFireuxEntity } from 'fireux-core/runtime/models/utils/entity.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'

/**
 * Executable canon: CompanyRoleRecord below and scripts/_lib/entity-matrix.mjs.
 *
 * Family: Place-owned role Record
 * Storage: root-stored same-id role marker
 * Root path: /companies/<placeId>
 * Root link: company identity is anchored to Place via the same root id
 *
 * Decision note:
 * - Company is a Place role, not a second independent identity.
 * - The root Place id stays the stable link instead of inventing a company id.
 * - Promote Company only if independent legal/lifecycle truth later survives a Place.
 */
export const CompanyStorage = {
  shape: 'public/root',
  path: 'companies/{placeId}',
  collection: 'companies',
  idParam: 'placeId',
} as const

export const CompanyRoleRecord = defineFireuxEntity({
  kind: 'record',
  name: 'Company',
  family: ['place'],
  identity: 'root',
  authority: 'parent',
  appSupport: 'none',
  publicRead: 'projection',
  status: 'confirmed',
  console: false,
  root: CompanyStorage.path,
  parent: 'Place',
  notes: [
    'Company is an exact stamps-only same-id role marker over a required canonical Place.',
    'Company stores no Place identity and has no independent lifecycle or App support.',
  ],
})

export const CompanyDefaults = {
  id: '' as string,
  created: {
    at: {} as FirebaseTimestamp,
  },
  updated: {
    at: {} as FirebaseTimestamp,
  },
} as const

export type Company = {
  [K in keyof typeof CompanyDefaults]: (typeof CompanyDefaults)[K]
}

export type CompanyCreateInput = Omit<Company, 'created' | 'updated'>
