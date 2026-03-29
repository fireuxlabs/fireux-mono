import type { Place } from 'fireux-places/runtime/models/place.model'
import type { Company } from 'fireux-companies/runtime/models/company.model'

/**
 * Read-time enrichment only.
 * Company stays thin at root and borrows public location fields from Place in fetch/runtime.
 */
export type CompanyHydrated = Company &
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
