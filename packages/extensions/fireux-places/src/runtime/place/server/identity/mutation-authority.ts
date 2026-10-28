import { isAppUserSubscription } from 'fireux-core/runtime/app/models/app-user.model'
import { readMembershipAccessIds } from 'fireux-core/runtime/app/utils/membership-access'
import { defineFirestoreReadTarget } from 'fireux-core/runtime/utils/firestore-mutations/target-definition'

// Existing Kitchen → Place integration: read the domain grant without importing Kitchens.
export function placeKitchenAccessTarget() {
  return defineFirestoreReadTarget({
    key: 'places.kitchen-access',
    database: { kind: 'runtime' },
    collectionPath: 'kitchen_access',
  })
}

export function canKitchenEditPlace(input: {
  uid: string
  placeId: string
  kitchenId: string
  appId: string
  runtimeAppId: string
  kitchenExists: boolean
  membershipExists: boolean
  access: unknown
  membership: Record<string, unknown>
}) {
  const permitted = Boolean(
    input.uid &&
      input.appId &&
      input.appId === input.runtimeAppId &&
      input.kitchenId === input.placeId &&
      input.kitchenExists &&
      input.membershipExists &&
      ['user', 'admin', 'dev'].includes(String(input.membership.role)) &&
      isAppUserSubscription(input.membership.subscription)
  )
  if (!permitted || input.access == null) return false
  const invalid = (): never => {
    throw Object.assign(
      new Error('Kitchen access has an invalid stored shape.'),
      { statusCode: 409 }
    )
  }
  const validKey = (key: string) =>
    key.length > 0 &&
    key === key.trim() &&
    !key.includes('/') &&
    !['__proto__', 'constructor', 'prototype'].includes(key)
  if (
    typeof input.access !== 'object' ||
    Array.isArray(input.access) ||
    !validKey(input.appId) ||
    Object.keys(input.access).some((key) => !['apps', 'id'].includes(key))
  )
    return invalid()
  const apps = (input.access as { apps?: Record<string, unknown> }).apps
  // Existing integration mirrors the canonical Kitchen envelope without importing its upper owner.
  if (
    !apps ||
    typeof apps !== 'object' ||
    Array.isArray(apps) ||
    Object.keys(apps).length > 100 ||
    Object.keys(apps).some((key) => !validKey(key))
  )
    return invalid()
  const grant = Object.hasOwn(apps, input.appId) ? apps[input.appId] : null
  if (
    grant != null &&
    (typeof grant !== 'object' ||
      Array.isArray(grant) ||
      Object.keys(grant).some(
        (key) => !['ids', 'membership_created_at'].includes(key)
      ))
  )
    return invalid()
  const ids = readMembershipAccessIds(grant, input.membership)
  return ids.length <= 50 && ids.includes(input.kitchenId)
}

// Place owns these reference checks, not the referenced domains' write authority.
export const placeReferenceTargets = Object.freeze({
  kitchens: defineFirestoreReadTarget({ key: 'project.kitchens', database: { kind: 'runtime' }, collectionPath: 'kitchens' }),
  properties: defineFirestoreReadTarget({ key: 'project.properties', database: { kind: 'runtime' }, collectionPath: 'properties' }),
  jobs: defineFirestoreReadTarget({ key: 'project.jobs', database: { kind: 'runtime' }, collectionPath: 'jobs' }),
})
