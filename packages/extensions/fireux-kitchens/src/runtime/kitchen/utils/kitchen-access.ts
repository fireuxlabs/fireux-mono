import {
  readMembershipAccess,
  readMembershipAccessIds,
  type MembershipAccess,
} from 'fireux-core/runtime/app/utils/membership-access'
import { KITCHEN_USER_LIMIT } from './kitchen-capacity.ts'

export const KITCHEN_ACCESS_COLLECTION_PATH = 'kitchen_access'
export type KitchenAccess = { apps: Record<string, MembershipAccess> }

function invalid(): never {
  throw Object.assign(
    new Error('Kitchen access has an invalid stored shape.'),
    { statusCode: 409 }
  )
}
function validAppId(value: string) {
  return (
    typeof value === 'string' &&
    value.length > 0 &&
    value === value.trim() &&
    !value.includes('/') &&
    !['__proto__', 'constructor', 'prototype'].includes(value)
  )
}
function appEntries(value: unknown): Record<string, unknown> {
  if (value == null) return {}
  if (typeof value !== 'object' || Array.isArray(value)) invalid()
  if (Object.keys(value).some((key) => !['apps', 'id'].includes(key))) invalid()
  const apps = (value as { apps?: unknown }).apps
  if (
    !apps ||
    typeof apps !== 'object' ||
    Array.isArray(apps) ||
    Object.keys(apps).length > 100 ||
    Object.keys(apps).some((key) => !validAppId(key))
  )
    invalid()
  return apps as Record<string, unknown>
}

function readAppGrant(entry: unknown): unknown {
  if (
    entry != null &&
    (typeof entry !== 'object' ||
      Array.isArray(entry) ||
      Object.keys(entry).some(
        (key) => !['ids', 'membership_created_at'].includes(key)
      ))
  )
    invalid()
  return entry
}

/** Select only the runtime App; no old per-App document fallback. */
export function readKitchenAppAccess(value: unknown, appId: string): unknown {
  if (!validAppId(appId)) invalid()
  const apps = appEntries(value)
  return readAppGrant(Object.hasOwn(apps, appId) ? apps[appId] : null)
}
export function readKitchenAccessIds(
  value: unknown,
  membership: unknown,
  appId: string
) {
  const ids = readMembershipAccessIds(
    readKitchenAppAccess(value, appId),
    membership
  )
  if (ids.length > KITCHEN_USER_LIMIT) {
    throw Object.assign(
      new Error('User Kitchens exceed the supported limit.'),
      { statusCode: 409 }
    )
  }
  return ids
}

/** Called under the same transaction as the grant; retain other App lifetimes exactly. */
export function withKitchenAppAccess(
  value: unknown,
  appId: string,
  grant: MembershipAccess
): KitchenAccess {
  if (!validAppId(appId)) invalid()
  const entries = appEntries(value)
  const apps = Object.fromEntries(
    Object.entries(entries).map(([key, entry]) => {
      const parsed = readMembershipAccess(readAppGrant(entry))
      if (!parsed || parsed.ids.length > KITCHEN_USER_LIMIT) invalid()
      return [key, parsed]
    })
  )
  const next = readMembershipAccess(grant)
  if (!next || next.ids.length > KITCHEN_USER_LIMIT) invalid()
  if (!Object.hasOwn(apps, appId) && Object.keys(apps).length >= 100) invalid()
  return { apps: { ...apps, [appId]: next } }
}
