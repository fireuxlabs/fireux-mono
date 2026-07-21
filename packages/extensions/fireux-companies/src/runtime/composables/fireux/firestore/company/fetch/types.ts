// Concurrent edit — 2026-07-21 14:30 CEST — Company public projection: make the browser view equal the allowlisted same-id Place DTO.
// Concurrent edit — 2026-07-21 14:52 CEST — Place provenance/privacy hardening: mark legacy sensitive Company view fields as impossible on the public transport.
import type { PublicCompanyProjection } from 'fireux-companies/runtime/models/company-public.model'

/** Public Company view; raw Company stamps never cross the server boundary. */
export type CompanyHydrated = PublicCompanyProjection & {
  claimed_by?: never
  formatted_address?: never
  website?: never
}
