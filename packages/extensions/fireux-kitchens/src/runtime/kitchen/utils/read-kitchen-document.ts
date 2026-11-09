import { isFirestoreDocumentId } from 'fireux-core/runtime/utils/firestore-document-id'
import { readWorkspacePalette } from 'fireux-core/runtime/utils/brand-palette'
import type { Kitchen, KitchenIdentitySource } from '../models/kitchen.model.ts'
import {
  KITCHEN_IDENTITY_SOURCES,
  KITCHEN_STATUSES,
} from '../models/kitchen.model.ts'
import { weekdayTimeCore } from '../../utils/weekday-time-core.ts'

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function hasFields(value: Record<string, unknown>, fields: readonly string[]) {
  return Object.keys(value).every((field) => fields.includes(field))
}

function isStamp(value: unknown): boolean {
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

function isConfiguration(value: Record<string, unknown>): boolean {
  if (value.theme !== undefined) {
    if (
      !isRecord(value.theme) ||
      !hasFields(value.theme, ['palette']) ||
      !readWorkspacePalette(value.theme.palette)
    )
      return false
  }
  if (value.orders !== undefined) {
    const orders = value.orders
    if (
      !isRecord(orders) ||
      !hasFields(orders, ['operation_hours', 'printing'])
    )
      return false
    if (
      orders.operation_hours !== undefined &&
      !isHours(orders.operation_hours)
    )
      return false
    if (
      orders.printing !== undefined &&
      (!isRecord(orders.printing) ||
        !hasFields(orders.printing, ['ticket_device_id']) ||
        typeof orders.printing.ticket_device_id !== 'string')
    )
      return false
  }
  if (value.services !== undefined) {
    const services = value.services
    if (
      !isRecord(services) ||
      !hasFields(services, ['title', 'item_images']) ||
      (services.title !== undefined &&
        (typeof services.title !== 'string' || services.title.length > 120)) ||
      (services.item_images !== undefined &&
        typeof services.item_images !== 'boolean')
    )
      return false
  }
  if (value.tables !== undefined) {
    const tables = value.tables
    if (
      !isRecord(tables) ||
      !hasFields(tables, ['count']) ||
      !Number.isSafeInteger(tables.count) ||
      Number(tables.count) < 0 ||
      Number(tables.count) > 500
    )
      return false
  }
  return true
}

// These stored fields are outside the Workspace Kitchen model. Server owners
// can still use the original document (for example, its management scope).
const omittedWorkspaceFields = [
  'slug',
  'status',
  'visibility',
  'identity_source',
  'currency',
  'management',
  'integrations',
]

/** Read the Workspace Kitchen without borrowing Place facts or legacy defaults. */
export function readKitchenDocument(raw: unknown, id: string): Kitchen | null {
  if (!isFirestoreDocumentId(id) || !isRecord(raw)) return null
  const kitchen = { ...raw }
  for (const field of omittedWorkspaceFields) delete kitchen[field]
  // Historical service lists do not supply current service presentation settings.
  if (Array.isArray(kitchen.services)) delete kitchen.services

  if (
    !hasFields(kitchen, [
      'id',
      'identity',
      'context',
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
      (typeof kitchen.context !== 'string' || kitchen.context.length > 32000))
  )
    return null

  const identity = kitchen.identity
  if (
    !isRecord(identity) ||
    !hasFields(identity, ['source', 'slug', 'status', 'visibility']) ||
    (identity.source !== undefined &&
      !KITCHEN_IDENTITY_SOURCES.includes(
        identity.source as KitchenIdentitySource
      )) ||
    typeof identity.slug !== 'string' ||
    !identity.slug.trim() ||
    identity.slug.length > 80 ||
    identity.slug.includes('/') ||
    !KITCHEN_STATUSES.includes(
      identity.status as Kitchen['identity']['status']
    ) ||
    typeof identity.visibility !== 'boolean' ||
    !isConfiguration(kitchen)
  )
    return null

  return { ...kitchen, id } as Kitchen
}
