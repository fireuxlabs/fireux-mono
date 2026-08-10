import { type H3Event } from 'h3'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import {
  FIRESTORE_MUTATION_TARGETS,
  serverAppUsersTarget,
} from 'fireux-core/runtime/utils/firestore-mutations/targets'
import type {
  PlaceManualCreateInput,
  PlaceManualCreateResult,
} from '../../models/place-onboarding.model'
import {
  normalizePlaceCurrencyCode,
  normalizePlaceTimezone,
} from '../../utils/place-spine'
import { context } from './onboarding-context'
import {
  badRequest,
  requestRecord,
  requireMemberRole,
  text,
} from './onboarding-input'
import { coordinates } from './onboarding-values'

function bounded(value: unknown, label: string, max: number) {
  const result = text(value)
  if (!result) badRequest(`${label} is required.`)
  if (result.length > max) badRequest(`${label} is too long.`)
  return result
}

function optional(value: unknown, label: string, max: number) {
  const result = text(value)
  if (result.length > max) badRequest(`${label} is too long.`)
  return result
}

function manualInput(value: unknown): PlaceManualCreateInput {
  const source = requestRecord(value)
  const allowed = new Set([
    'name',
    'street',
    'city',
    'region',
    'postal_code',
    'country_code',
    'lat',
    'lng',
    'default_currency_code',
    'timezone',
  ])
  const unsupported = Object.keys(source).find((key) => !allowed.has(key))
  if (unsupported)
    badRequest(`Manual Place contains unsupported field: ${unsupported}.`)

  const hasCoordinates = text(source.lat) !== '' || text(source.lng) !== ''
  const location = hasCoordinates ? coordinates(source) : null
  if (hasCoordinates && !location)
    badRequest('Enter both valid latitude and longitude coordinates.')
  const countryCode = optional(
    source.country_code,
    'Country code',
    2
  ).toUpperCase()
  if (countryCode && !/^[A-Z]{2}$/.test(countryCode))
    badRequest('Use a 2-letter country code.')
  const currency = normalizePlaceCurrencyCode(source.default_currency_code)
  if (text(source.default_currency_code) && !currency)
    badRequest('Confirm a valid 3-letter currency code.')
  const timezone = normalizePlaceTimezone(source.timezone)
  if (text(source.timezone) && !timezone)
    badRequest('Confirm a valid IANA timezone, such as Europe/Zurich.')

  return {
    name: bounded(source.name, 'Place name', 160),
    street: optional(source.street, 'Street address', 200),
    city: optional(source.city, 'City', 120),
    region: optional(source.region, 'Region', 120),
    postal_code: optional(source.postal_code, 'Postal code', 24),
    ...(countryCode ? { country_code: countryCode } : {}),
    ...(location ? { lat: location.lat, lng: location.lng } : {}),
    ...(currency ? { default_currency_code: currency } : {}),
    ...(timezone ? { timezone } : {}),
  }
}

export async function createManualPlace(
  event: H3Event,
  value: unknown
): Promise<PlaceManualCreateResult> {
  const input = manualInput(value)
  const places = FIRESTORE_MUTATION_TARGETS.places
  const provisionalId = getRuntimeFirestore()
    .collection(places.collectionPath)
    .doc().id
  const actor = await context(event, provisionalId)
  const memberships = serverAppUsersTarget(actor.runtimeAppId)
  const locality = [input.postal_code, input.city].filter(Boolean).join(' ')
  const formattedAddress = [
    input.street,
    locality,
    input.region,
    input.country_code,
  ]
    .filter(Boolean)
    .join(', ')

  return runGuardedServerTransaction(places.database, async (mutations) => {
    const membership = await mutations.read<Record<string, unknown>>(
      memberships,
      actor.uid
    )
    requireMemberRole(membership.exists, membership.data?.role)
    const address = {
      ...(input.street ? { street: input.street } : {}),
      ...(input.city ? { city: input.city } : {}),
      ...(input.region ? { region: input.region } : {}),
      ...(input.postal_code ? { postal_code: input.postal_code } : {}),
      ...(input.country_code ? { country_code: input.country_code } : {}),
    }
    const hasAddress = Object.keys(address).length > 0
    mutations.create(places, provisionalId, {
      name: input.name,
      source: 'manual',
      place_type: 'physical',
      ...(hasAddress
        ? {
            address,
            formatted_address: formattedAddress,
            ...(locality ? { short_address: locality } : {}),
          }
        : {}),
      ...(input.lat !== undefined ? { lat: input.lat, lng: input.lng } : {}),
      ...(input.default_currency_code
        ? { default_currency_code: input.default_currency_code }
        : {}),
      ...(input.timezone ? { timezone: input.timezone } : {}),
      verified: false,
      created: serverAuditStamp({ by: actor.uid, appId: actor.runtimeAppId }),
      updated: serverAuditStamp({ by: actor.uid }),
    })
    return { ok: true, id: provisionalId, created: true }
  })
}
