import { isServiceMenu } from '../../utils/service-menus'
import { createError } from 'h3'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import type {
  KitchenOffering,
  KitchenOfferingChanges,
} from '../../models/offering.model'
import { requireOperatingHours } from '../../utils/operating-hours'
import { weekdayTimeCore } from '../../../utils/weekday-time-core'

export const fail = (statusMessage: string): never => {
  throw createError({ statusCode: 400, statusMessage })
}
const object = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : fail('Invalid offering settings.')
const allowed = (value: Record<string, unknown>, keys: string[]) => {
  if (Object.keys(value).some((key) => !keys.includes(key)))
    fail('Unsupported offering setting.')
}
const name = (value: unknown) => {
  if (typeof value !== 'string' || !value.trim() || value.trim().length > 120)
    return fail('Enter a offering name of up to 120 characters.')
  return value.trim()
}

export function readOfferingUpdate(input: unknown) {
  const body = object(input)
  allowed(body, ['kitchenId', 'offeringId', 'changes'])
  const changes = { ...object(body.changes) }
  allowed(changes, [
    'name',
    'enabled',
    'menu_ids',
    'hours',
    'collection_timing',
  ])
  if (
    'collection_timing' in changes &&
    !['same_day', 'next_day'].includes(String(changes.collection_timing))
  )
    fail('Choose same-day or next-day collection.')
  if ('name' in changes) changes.name = name(changes.name)
  if ('enabled' in changes && typeof changes.enabled !== 'boolean')
    fail('Invalid offering switch.')
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
    if (
      'source' in value &&
      value.source !== 'custom' &&
      value.source !== 'place'
    )
      fail('Invalid offering hours source.')
    if (Array.isArray(value.windows)) {
      for (const item of value.windows) {
        const window = object(item)
        allowed(window, ['days', 'open', 'close'])
        if (
          !Array.isArray(window.days) ||
          window.days.some(
            (day) => typeof day !== 'string' || !weekdayTimeCore.dayName(day)
          ) ||
          typeof window.open !== 'string' ||
          typeof window.close !== 'string'
        )
          fail('Offering hours require valid day and time values.')
      }
    }
    try {
      changes.hours = requireOperatingHours(value)
    } catch {
      fail('Offering hours require a timezone and valid time ranges.')
    }
  }
  return {
    kitchenId: requireFirestoreDocumentId(body.kitchenId, 'Kitchen id'),
    offeringId: requireFirestoreDocumentId(body.offeringId, 'Offering id'),
    changes: changes as KitchenOfferingChanges,
  }
}

export function requireConfiguredOffering(offering: KitchenOffering) {
  if (
    offering.collection_timing &&
    !offering.interactions.some((row) => row.type === 'collection')
  )
    fail('Collection timing requires a Collection option.')
  if (
    offering.collection_timing === 'next_day' &&
    offering.interactions.some(
      (row) => row.type === 'collection' && row.asap_enabled === true
    )
  )
    fail('Turn off immediate collection before choosing next-day collection.')
  if (!offering.enabled) return
  if (!offering.menu_ids.length)
    fail('Select at least one Menu before enabling this offering.')
  if (
    offering.interactions.some(
      (interaction) => interaction.type !== 'browse' && interaction.enabled
    ) &&
    !offering.hours?.windows.length
  )
    fail('Set offering hours before enabling ordering.')
}

/** Validate the same menu contract used by every Services selector. */
export function requireServiceMenus(
  menus: Array<Parameters<typeof isServiceMenu>[0]>,
  enabled: boolean
) {
  if (!menus.length || menus.some((menu) => !isServiceMenu(menu)))
    fail(
      'Choose regular interactive menus. Daily specials, documents and archived menus cannot supply this service.'
    )
  if (enabled && !menus.some((menu) => menu.status === 'published'))
    fail('Publish at least one selected menu before enabling the service.')
}
