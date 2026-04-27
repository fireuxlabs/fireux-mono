import {
  getReservedEntityRouteSegmentKeys,
  getReservedRootRouteKeys,
  normalizeReservedRouteKey,
} from '../../../config/module/reserved-route-keys'
import { normalizeSlug, type NormalizeSlugOptions } from './normalizeSlug'
import {
  validateSlugFormat,
  type ValidateSlugFormatOptions,
} from './validateSlugFormat'

export type PublicSlugReservedScope = 'entity' | 'root' | 'none'

export type PublicRouteIdentityStrategy =
  | 'slug-id'
  | 'slug-alias'
  | 'handle-index'
  | 'id-only'

export type ValidatePublicSlugOptions = NormalizeSlugOptions &
  ValidateSlugFormatOptions & {
    namespace?: string
    reservedScope?: PublicSlugReservedScope
    reserved?: readonly unknown[]
    registeredReserved?: readonly unknown[]
    runtimeReservedRouteKeys?: readonly unknown[]
  }

export type ValidatePublicSlugResult = {
  isValid: boolean
  slug: string
  message?: string
  reason?: 'format' | 'reserved'
  reservedKey?: string
}

export type PublicSlugAvailabilityResult =
  | boolean
  | {
      available: boolean
      message?: string
    }

export type PublicSlugAvailabilityCheck = (
  slug: string
) => PublicSlugAvailabilityResult | Promise<PublicSlugAvailabilityResult>

export type AssertPublicSlugOptions = ValidatePublicSlugOptions & {
  isAvailable?: PublicSlugAvailabilityCheck
  unavailableMessage?: string
}

const normalizeReservedKeys = (values: readonly unknown[] = []): string[] =>
  values
    .map(normalizeReservedRouteKey)
    .filter(Boolean)

function buildReservedSet(options: ValidatePublicSlugOptions): Set<string> {
  const reserved = new Set<string>()
  const scope = options.reservedScope ?? 'entity'

  if (scope === 'root') {
    for (const key of getReservedRootRouteKeys()) {
      reserved.add(normalizeReservedRouteKey(key))
    }
  }

  if (scope === 'entity') {
    for (const key of getReservedEntityRouteSegmentKeys()) {
      reserved.add(normalizeReservedRouteKey(key))
    }
  }

  for (const key of normalizeReservedKeys(options.registeredReserved)) {
    reserved.add(key)
  }

  for (const key of normalizeReservedKeys(options.runtimeReservedRouteKeys)) {
    reserved.add(key)
  }

  for (const key of normalizeReservedKeys(options.reserved)) {
    reserved.add(key)
  }

  reserved.delete('')
  return reserved
}

function buildReservedMessage(
  slug: string,
  options: ValidatePublicSlugOptions
): string {
  const label = String(options.label || 'Slug').trim() || 'Slug'
  const namespace = String(options.namespace || '').trim()
  const suffix = namespace ? ` in ${namespace}` : ''
  return `${label} "${slug}" is reserved${suffix}.`
}

export function validatePublicSlug(
  value: unknown,
  options: ValidatePublicSlugOptions = {}
): ValidatePublicSlugResult {
  const slug = normalizeSlug(value, options)
  const format = validateSlugFormat(slug, options)

  if (!format.isValid) {
    return {
      isValid: false,
      slug,
      message: format.message,
      reason: 'format',
    }
  }

  if (slug) {
    const reserved = buildReservedSet(options)
    if (reserved.has(slug)) {
      return {
        isValid: false,
        slug,
        message: buildReservedMessage(slug, options),
        reason: 'reserved',
        reservedKey: slug,
      }
    }
  }

  return {
    isValid: true,
    slug,
  }
}

export async function assertPublicSlug(
  value: unknown,
  options: AssertPublicSlugOptions = {}
): Promise<string> {
  const result = validatePublicSlug(value, options)

  if (!result.isValid) {
    throw new Error(result.message || 'Invalid slug.')
  }

  const slug = result.slug
  if (!slug) return slug

  if (!options.isAvailable) return slug

  const availability = await options.isAvailable(slug)
  const available =
    typeof availability === 'boolean'
      ? availability
      : availability.available

  if (!available) {
    const message =
      typeof availability === 'boolean'
        ? options.unavailableMessage
        : availability.message || options.unavailableMessage
    throw new Error(message || `Slug "${slug}" is already taken.`)
  }

  return slug
}
