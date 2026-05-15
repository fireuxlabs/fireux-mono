// Repo-level demo payloads for Companies.
// Use these records for dev surfaces, examples, and explicit preflight demos.
// They are not canonical storage or runtime contracts.

import type { Company, CompanyView } from 'fireux-companies/runtime/models/company.model'
import type { Place } from 'fireux-places/runtime/models/place.model'
import { demoPlaceDocDataList } from './place.demo'

export const demoCompany: Company = {
  id: 'dev-place-harbor-001',
  created_at: {} as any,
  updated_at: {} as any,
}

export const demoCompanyList: Company[] = [
  demoCompany,
  { id: 'dev-place-harbor-002', created_at: {} as any, updated_at: {} as any },
  { id: 'dev-place-harbor-003', created_at: {} as any, updated_at: {} as any },
  { id: 'dev-place-harbor-004', created_at: {} as any, updated_at: {} as any },
  { id: 'dev-place-harbor-005', created_at: {} as any, updated_at: {} as any },
]

/**
 * Private hydration helper (no external function file).
 * Merge the company record with the subset of Place fields we expose on CompanyView.
 */
function hydrateCompanyFromPlace(company: Company, place: Partial<Place>): CompanyView {
  return {
    ...company,

    name: typeof place.name === 'string' ? place.name : '',
    short_name: typeof place.short_name === 'string' ? place.short_name : '',
    short_address: typeof place.short_address === 'string' ? place.short_address : '',
    formatted_address: typeof place.formatted_address === 'string' ? place.formatted_address : '',
    lat: typeof place.lat === 'number' ? place.lat : 0,
    lng: typeof place.lng === 'number' ? place.lng : 0,
    image_url: typeof place.image_url === 'string' ? place.image_url : '',
    image_shade: (place as any)?.image_shade ?? 'none',
    claimed_by: typeof (place as any)?.claimed_by === 'string' ? (place as any).claimed_by : '',
    source: ((place as any)?.source ?? 'demo') as any,
  }
}

const placeById = new Map<string, Partial<Place>>(
  (demoPlaceDocDataList as Partial<Place>[]).map((place) => [
    String((place as any)?.id ?? ''),
    place,
  ])
)

export const demoCompanyHydratedList: CompanyView[] = demoCompanyList.map((company) => {
  const place = placeById.get(String(company.id))
  return place ? hydrateCompanyFromPlace(company, place) : company
})

export const demoCompanyHydrated: CompanyView =
  demoCompanyHydratedList[0] ?? demoCompany
