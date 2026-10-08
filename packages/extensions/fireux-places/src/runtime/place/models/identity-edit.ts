import type { Place } from './place.model'

export type PlaceIdentitySection =
  | 'profile'
  | 'brand'
  | 'photos'
  | 'contact'
  | 'visit'

export const placeIdentityFields = [
  { key: 'name', label: 'Name', max: 240 },
  { key: 'tagline', label: 'Tagline', max: 240 },
  { key: 'formatted_address', label: 'Address', max: 500 },
  { key: 'short_address', label: 'Directory locality', max: 240 },
  { key: 'phone', label: 'Phone', max: 120 },
  { key: 'email', label: 'Email', max: 320 },
  { key: 'website', label: 'Website', max: 2048 },
  { key: 'default_currency_code', label: 'Currency', max: 3 },
  { key: 'timezone', label: 'Timezone', max: 80 },
] as const
export type PlaceIdentityField = (typeof placeIdentityFields)[number]['key']
export type PlaceIdentityDraft = Record<PlaceIdentityField, string>
export type PlaceIdentityProposal = Partial<
  Record<PlaceIdentityField, string | null>
>
export function readPlaceIdentity(
  place: Partial<Place> | null
): PlaceIdentityDraft {
  return Object.fromEntries(
    placeIdentityFields.map(({ key }) => [key, String(place?.[key] || '')])
  ) as PlaceIdentityDraft
}
export function identityDraft(
  current: PlaceIdentityDraft,
  proposal: PlaceIdentityProposal = {}
): PlaceIdentityDraft {
  return Object.fromEntries(
    placeIdentityFields.map(({ key }) => [
      key,
      proposal[key] == null ? current[key] : proposal[key],
    ])
  ) as PlaceIdentityDraft
}
export function placeIdentityPatch(
  original: PlaceIdentityDraft,
  draft: PlaceIdentityDraft
) {
  const patch: Partial<PlaceIdentityDraft> = {}
  for (const { key, label, max } of placeIdentityFields) {
    const value = draft[key].trim()
    if (value.length > max)
      throw new Error(`${label} must be ${max} characters or fewer.`)
    if (key === 'name' && !value) throw new Error('Place name is required.')
    if (value !== original[key]) patch[key] = value
  }
  if ('formatted_address' in patch) {
    const locality = draft.short_address.trim()
    if (patch.formatted_address && !locality)
      throw new Error('Add the locality shown on directory cards.')
    patch.short_address = locality
  }
  if (patch.website) {
    let url: URL
    try {
      url = new URL(patch.website)
    } catch {
      throw new Error('Enter a full website URL.')
    }
    if (
      !['https:', 'http:'].includes(url.protocol) ||
      url.username ||
      url.password
    )
      throw new Error('Enter an HTTP or HTTPS website URL without credentials.')
  }
  if (patch.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(patch.email))
    throw new Error('Enter a valid email address.')
  if (patch.default_currency_code) {
    patch.default_currency_code = patch.default_currency_code.toUpperCase()
    if (!/^[A-Z]{3}$/.test(patch.default_currency_code))
      throw new Error('Use a three-letter currency code.')
  }
  if (patch.timezone) {
    try {
      new Intl.DateTimeFormat('en', { timeZone: patch.timezone }).format()
    } catch {
      throw new Error('Enter a valid timezone, such as Europe/Zurich.')
    }
  }
  return patch
}
