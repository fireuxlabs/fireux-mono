// Concurrent edit — 2026-07-21 14:30 CEST — Company public projection: define a bounded same-id Company and Place read contract.
// Concurrent edit — 2026-07-28 — Entity canon: Company public reads reuse the exact same-id Place projection.
import type {
  PublicPlaceDetailProjection,
  PublicPlaceProjection,
} from 'fireux-places/runtime/place/models/place-public.model'

export const PUBLIC_COMPANY_INDEX_PAGE_SIZE = 24
export const PUBLIC_COMPANY_INDEX_MAX_PAGE_SIZE = 50
export const PUBLIC_COMPANY_INDEX_SCAN_BATCH_SIZE = 50
export const PUBLIC_COMPANY_INDEX_MAX_SCAN_SIZE = 200

export type PublicCompanyProjection = PublicPlaceProjection
export type PublicCompanyDetailProjection = PublicPlaceDetailProjection
export type CompanyView = PublicCompanyProjection &
  Partial<PublicCompanyDetailProjection>

export type PublicCompanyIndexPage = {
  items: PublicCompanyProjection[]
  nextCursor?: string
}

export type PublicCompanyDetailResponse = {
  item: PublicCompanyDetailProjection
}
