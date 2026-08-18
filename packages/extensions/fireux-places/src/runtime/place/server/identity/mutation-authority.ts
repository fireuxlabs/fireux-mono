import {
  readFireuxEntityManagement,
  resolveFireuxEntityManagementAppId,
} from 'fireux-core/runtime/utils/entity-management'

const text = (value: unknown) => String(value ?? '').trim()
const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}

export const placeAuthorityIds = (value: unknown) =>
  Array.isArray(value) ? value.map(text).filter(Boolean) : []

export function readRootKitchenManagement(value: unknown, ecosystem: string) {
  const kitchen = record(value)
  const management = readFireuxEntityManagement(kitchen.management)
  if (!management || management.mode === 'root') return null
  const appId = resolveFireuxEntityManagementAppId(management, ecosystem)
  return appId ? { appId, mode: management.mode } : null
}
