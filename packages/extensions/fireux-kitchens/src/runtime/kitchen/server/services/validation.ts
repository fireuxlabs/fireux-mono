import { createError } from 'h3'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import type {
  KitchenService,
  KitchenServiceChanges,
} from '../../models/service.model'
import { requireOperatingHours } from '../../utils/operating-hours'

export const fail = (statusMessage: string): never => {
  throw createError({ statusCode: 400, statusMessage })
}
const object = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : fail('Invalid service settings.')
const allowed = (value: Record<string, unknown>, keys: string[]) => {
  if (Object.keys(value).some((key) => !keys.includes(key)))
    fail('Unsupported service setting.')
}
const name = (value: unknown) => {
  if (typeof value !== 'string' || !value.trim() || value.trim().length > 120)
    return fail('Enter a service name of up to 120 characters.')
  return value.trim()
}

export function readServiceCreate(input: unknown) {
  const body = object(input)
  allowed(body, ['kitchenId', 'name'])
  return {
    kitchenId: requireFirestoreDocumentId(body.kitchenId, 'Kitchen id'),
    name: name(body.name),
  }
}

export function readServiceUpdate(input: unknown) {
  const body = object(input)
  allowed(body, ['kitchenId', 'serviceId', 'changes'])
  const changes = { ...object(body.changes) }
  allowed(changes, ['name', 'enabled', 'menu_ids', 'hours'])
  if ('name' in changes) changes.name = name(changes.name)
  if ('enabled' in changes && typeof changes.enabled !== 'boolean')
    fail('Invalid service switch.')
  if ('menu_ids' in changes) {
    if (!Array.isArray(changes.menu_ids) || changes.menu_ids.length > 100)
      fail('Invalid Menu selection.')
    changes.menu_ids = [
      ...new Set(
        (changes.menu_ids as unknown[]).map((id) =>
          requireFirestoreDocumentId(id, 'Menu id')
        )
      ),
    ]
  }
  if ('hours' in changes && changes.hours !== null) {
    const value = object(changes.hours)
    allowed(value, ['timezone', 'windows', 'source'])
    try {
      changes.hours = requireOperatingHours(value)
    } catch {
      fail('Service hours require a timezone and valid time ranges.')
    }
  }
  return {
    kitchenId: requireFirestoreDocumentId(body.kitchenId, 'Kitchen id'),
    serviceId: requireFirestoreDocumentId(body.serviceId, 'Service id'),
    changes: changes as KitchenServiceChanges,
  }
}

export function requireConfiguredService(service: KitchenService) {
  if (!service.enabled) return
  if (!service.menu_ids.length)
    fail('Select at least one Menu before enabling this service.')
  if (
    service.interactions.some(
      (interaction) => interaction.type !== 'browse' && interaction.enabled
    ) &&
    !service.hours?.windows.length
  )
    fail('Set service hours before enabling ordering.')
}
