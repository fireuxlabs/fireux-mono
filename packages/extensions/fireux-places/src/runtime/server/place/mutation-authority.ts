import { isFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'

const text = (value: unknown) => String(value ?? '').trim()
const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}

export const placeAuthorityIds = (value: unknown) =>
  Array.isArray(value) ? value.map(text).filter(Boolean) : []

export function readRootKitchenAppScope(value: unknown) {
  const kitchen = record(value)
  if (
    Object.hasOwn(kitchen, 'app_scope_state') ||
    Object.hasOwn(kitchen, 'app_scope_app_id')
  ) {
    return null
  }

  const appScope = record(kitchen.app_scope)
  const keys = Object.keys(appScope).sort()
  const state = text(appScope.state)
  const appId = text(appScope.app_id)
  if (
    keys.length !== 2 ||
    keys[0] !== 'app_id' ||
    keys[1] !== 'state' ||
    (state !== 'parent_app' && state !== 'tenant_app') ||
    !isFirestoreDocumentId(appId)
  ) {
    return null
  }

  return { appId, state }
}
