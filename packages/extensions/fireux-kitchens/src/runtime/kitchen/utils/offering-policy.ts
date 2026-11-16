import {
  readKitchenOrderTypeConfig,
  type KitchenOrderTypeConfig,
} from './ordering-policy'
import { requireOperatingHours } from './operating-hours'
import type { WeekdayTimeWindowsConfig } from '../../models/shared/weekday-time.model'

export type KitchenOfferingInteraction =
  | { type: 'browse'; enabled: boolean }
  | (KitchenOrderTypeConfig & { enabled: boolean })

/** Normalized parent-owned Offering child, separate from Kitchen root fields. */
export type KitchenOffering = {
  id: string
  name: string
  enabled: boolean
  menu_ids: string[]
  separate?: boolean
  collection_timing?: 'same_day' | 'next_day'
  hours_source?: 'kitchen' | 'custom'
  hours?: WeekdayTimeWindowsConfig
  interactions: KitchenOfferingInteraction[]
}
export type KitchenOfferingChanges = Partial<
  Pick<
    KitchenOffering,
    'name' | 'enabled' | 'menu_ids' | 'collection_timing' | 'hours_source'
  >
> & { hours?: WeekdayTimeWindowsConfig | null }
export type KitchenOfferingInteractionChanges = Omit<
  Partial<KitchenOrderTypeConfig>,
  'type' | 'fulfilment'
> & {
  enabled?: boolean
  fulfilment?: Omit<
    NonNullable<KitchenOrderTypeConfig['fulfilment']>,
    'deposit'
  > & {
    deposit?:
      | NonNullable<KitchenOrderTypeConfig['fulfilment']>['deposit']
      | null
  }
}

const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
const text = (value: unknown) => (typeof value === 'string' ? value.trim() : '')

/** Normalize admitted Offering policies for response derivation; offerings.ts validates saved children. */
export function normalizeKitchenOfferings(value: unknown): KitchenOffering[] {
  if (!Array.isArray(value)) return []
  const seen = new Set<string>()
  return value.flatMap((value): KitchenOffering[] => {
    const row = record(value)
    const id = text(row.id)
    const name = text(row.name)
    if (!id || id.includes('/') || !name || seen.has(id)) return []
    seen.add(id)
    const types = new Set<string>()
    const interactions = (
      Array.isArray(row.interactions) ? row.interactions : []
    ).flatMap((value): KitchenOfferingInteraction[] => {
      const item = record(value)
      const policy =
        item.type === 'browse'
          ? { type: 'browse' as const }
          : readKitchenOrderTypeConfig(item)
      if (!policy || types.has(policy.type)) return []
      types.add(policy.type)
      return [{ ...policy, enabled: item.enabled === true }]
    })
    let hours: KitchenOffering['hours']
    try {
      hours = requireOperatingHours(row.hours)
    } catch {
      // An invalid or missing schedule cannot grant ordering availability.
    }
    return [
      {
        id,
        name,
        enabled: row.enabled === true,
        menu_ids: [
          ...new Set(
            (Array.isArray(row.menu_ids) ? row.menu_ids : []).filter(
              (id): id is string =>
                typeof id === 'string' && !!id && !id.includes('/')
            )
          ),
        ],
        ...(row.separate === true ? { separate: true } : {}),
        ...(row.collection_timing === 'same_day' ||
        row.collection_timing === 'next_day'
          ? { collection_timing: row.collection_timing }
          : {}),
        ...(row.hours_source === 'custom' || row.hours_source === 'kitchen'
          ? { hours_source: row.hours_source }
          : {}),
        ...(hours ? { hours } : {}),
        interactions,
      },
    ]
  })
}
