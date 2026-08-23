import { createError } from 'h3'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'

export type PlaceOnboardingRequest = {
  id?: unknown
  default_currency_code?: unknown
  timezone?: unknown
  image_url?: unknown
  brand_palette?: unknown
}

export type OnboardingContext = {
  uid: string
  runtimeAppId: string
  role: 'admin' | 'user' | 'dev'
  db: ReturnType<typeof getRuntimeFirestore>
  membershipRef: ReturnType<ReturnType<typeof getRuntimeFirestore>['doc']>
  placeRef: ReturnType<ReturnType<typeof getRuntimeFirestore>['doc']>
}

export const text = (value: unknown) => String(value ?? '').trim()

export const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}

export function badRequest(statusMessage: string): never {
  throw createError({ statusCode: 400, statusMessage })
}

export function requestRecord(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    badRequest('Place onboarding request must be an object.')
  }
  return value as Record<string, unknown>
}

export function requireMemberRole(
  exists: boolean,
  value: unknown
): 'admin' | 'user' | 'dev' {
  const role = text(value)
  if (!exists || (role !== 'admin' && role !== 'user' && role !== 'dev')) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Current App membership is required to onboard a Place.',
    })
  }
  return role
}
