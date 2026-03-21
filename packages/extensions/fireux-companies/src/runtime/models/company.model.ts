// FILE: packages/extensions/fireux-companies/src/runtime/models/company.model.ts

import type { FirebaseTimestamp } from 'fireux-core/types/firebase'
import type { Place } from 'fireux-places/runtime/models/place.model'

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

export interface Company {
  id: string
  created?: {
    at: FirebaseTimestamp
  }
  updated?: {
    at: FirebaseTimestamp
  }
}

// Runtime + canonical shape for stored collection records (source of truth)
export const Company: Company = {
  id: '',
  created: {
    at: {} as FirebaseTimestamp,
  },
  updated: {
    at: {} as FirebaseTimestamp,
  },
}

/**
 * Read-time enrichment only (never stored)
 * Company is a thin record that can be hydrated from Place.
 */
export type CompanyView = Company &
  Partial<
    Pick<
      Place,
      | 'name'
      | 'short_name'
      | 'short_address'
      | 'formatted_address'
      | 'lat'
      | 'lng'
      | 'image_url'
      | 'image_shade'
      | 'claimed_by'
      | 'source'
    >
  >

export type CompanyCreateInput = Omit<Company, 'created' | 'updated'>
export type CompanyUpdateInput = Partial<Omit<CompanyCreateInput, 'id'>>
