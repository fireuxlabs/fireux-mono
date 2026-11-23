import { isFirestoreDocumentId } from 'fireux-core/runtime/utils/firestore-document-id'
import { readWorkspacePalette } from 'fireux-core/runtime/utils/theme-palette'
import type { Kitchen, KitchenIdentity } from '../models/model'
import { weekdayTimeCore } from '../../utils/weekday-time-core.ts'
const KITCHEN_IDENTITY_SOURCES = ['user', 'place'] as const
const KITCHEN_STATUSES = ['active', 'inactive', 'archived'] as const

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function hasFields(value: Record<string, unknown>, fields: readonly string[]) {
  return Object.keys(value).every((field) => fields.includes(field))
}

function isStamp(value: unknown): value is Kitchen['created'] {
  if (!isRecord(value) || !hasFields(value, ['at', 'by', 'app_id']))
    return false
  const at = value.at
  return (
    isRecord(at) &&
    Number.isInteger(at.seconds) &&
    Number.isInteger(at.nanoseconds) &&
    Number(at.seconds) >= -62135596800 &&
    Number(at.seconds) <= 253402300799 &&
    Number(at.nanoseconds) >= 0 &&
    Number(at.nanoseconds) < 1_000_000_000 &&
    (value.by === undefined || typeof value.by === 'string') &&
    (value.app_id === undefined || typeof value.app_id === 'string')
  )
}

function isHours(value: unknown): boolean {
  if (!isRecord(value) || !hasFields(value, ['source', 'timezone', 'windows']))
    return false
  return (
    (value.source === 'place' || value.source === 'custom') &&
    typeof value.timezone === 'string' &&
    Array.isArray(value.windows) &&
    value.windows.every(
      (window) =>
        isRecord(window) &&
        hasFields(window, ['days', 'open', 'close']) &&
        Array.isArray(window.days) &&
        window.days.length > 0 &&
        window.days.every((day) =>
          weekdayTimeCore.days.some((allowed) => day === allowed)
        ) &&
        typeof window.open === 'string' &&
        Boolean(window.open) &&
        weekdayTimeCore.normalizeTime(window.open) === window.open &&
        typeof window.close === 'string' &&
        Boolean(window.close) &&
        weekdayTimeCore.normalizeTime(window.close) === window.close
    )
  )
}

function isTheme(value: unknown): value is NonNullable<Kitchen['theme']> {
  return (
    isRecord(value) &&
    hasFields(value, ['palette']) &&
    Boolean(readWorkspacePalette(value.palette))
  )
}

function isOrders(value: unknown): value is NonNullable<Kitchen['orders']> {
  return (
    isRecord(value) &&
    hasFields(value, ['operation_hours', 'printing']) &&
    (value.operation_hours === undefined || isHours(value.operation_hours)) &&
    (value.printing === undefined ||
      (isRecord(value.printing) &&
        hasFields(value.printing, ['ticket_device_id']) &&
        typeof value.printing.ticket_device_id === 'string'))
  )
}

function isServices(value: unknown): value is NonNullable<Kitchen['services']> {
  return (
    isRecord(value) &&
    hasFields(value, ['title', 'item_images']) &&
    (value.title === undefined ||
      (typeof value.title === 'string' && value.title.length <= 120)) &&
    (value.item_images === undefined || typeof value.item_images === 'boolean')
  )
}

function isTables(value: unknown): value is NonNullable<Kitchen['tables']> {
  return (
    isRecord(value) &&
    hasFields(value, ['count']) &&
    typeof value.count === 'number' &&
    Number.isSafeInteger(value.count) &&
    value.count >= 0 &&
    value.count <= 500
  )
}

// These stored fields are outside the Workspace Kitchen model. Server owners
// can still use the original document (for example, its management scope).
const omittedWorkspaceFields = ['currency', 'management', 'integrations']

function isIdentity(value: unknown): value is KitchenIdentity {
  return (
    isRecord(value) &&
    hasFields(value, ['source', 'name', 'slug', 'status', 'visibility']) &&
    (value.name === undefined ||
      (value.source === 'user' &&
        typeof value.name === 'string' &&
        Boolean(value.name.trim()) &&
        value.name.length <= 120)) &&
    (value.source === undefined ||
      KITCHEN_IDENTITY_SOURCES.some((source) => source === value.source)) &&
    typeof value.slug === 'string' &&
    Boolean(value.slug.trim()) &&
    value.slug.length <= 80 &&
    !value.slug.includes('/') &&
    KITCHEN_STATUSES.some((status) => status === value.status) &&
    typeof value.visibility === 'boolean'
  )
}

function isGuidanceIds(value: unknown): value is string[] {
  return (
    Array.isArray(value) &&
    value.length <= 20 &&
    new Set(value).size === value.length &&
    value.every(
      (id) => typeof id === 'string' && id.length > 0 && id.length <= 80
    )
  )
}

/** Read the Workspace Kitchen without borrowing Place facts. */
export function readKitchenDocument(raw: unknown, id: string): Kitchen | null {
  if (!isFirestoreDocumentId(id) || !isRecord(raw)) return null
  const kitchen = { ...raw }
  for (const field of omittedWorkspaceFields) delete kitchen[field]

  if (
    !hasFields(kitchen, [
      'id',
      'identity',
      'context',
      'guidance_ids',
      'created',
      'updated',
      'theme',
      'orders',
      'services',
      'tables',
    ]) ||
    (kitchen.id !== undefined && kitchen.id !== id) ||
    !isStamp(kitchen.created) ||
    (kitchen.updated !== undefined && !isStamp(kitchen.updated)) ||
    (kitchen.context !== undefined &&
      (typeof kitchen.context !== 'string' ||
        kitchen.context.length > 32000)) ||
    (kitchen.guidance_ids !== undefined && !isGuidanceIds(kitchen.guidance_ids))
  )
    return null

  const theme = kitchen.theme
  if (!isIdentity(kitchen.identity) || (theme !== undefined && !isTheme(theme)))
    return null

  return {
    id,
    identity: kitchen.identity,
    created: kitchen.created,
    ...(kitchen.updated !== undefined ? { updated: kitchen.updated } : {}),
    ...(kitchen.context !== undefined ? { context: kitchen.context } : {}),
    ...(kitchen.guidance_ids !== undefined
      ? { guidance_ids: kitchen.guidance_ids }
      : {}),
    ...(theme !== undefined ? { theme } : {}),
    // Optional capability settings are projected only when usable.
    ...(isOrders(kitchen.orders) ? { orders: kitchen.orders } : {}),
    ...(isServices(kitchen.services) ? { services: kitchen.services } : {}),
    ...(isTables(kitchen.tables) ? { tables: kitchen.tables } : {}),
  }
}
