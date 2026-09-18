import type {
  KitchenService,
  KitchenServiceInteraction,
} from '../models/service.model'
import { readKitchenOrderTypeConfig } from './ordering-policy'
import { requireOperatingHours } from './operating-hours'

const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
const text = (value: unknown) => (typeof value === 'string' ? value.trim() : '')

/** Read the current stored shape only. Old ordering records require migration. */
export function readKitchenServices(value: unknown): KitchenService[] {
  if (!Array.isArray(value)) return []
  const seen = new Set<string>()
  return value.flatMap((value): KitchenService[] => {
    const row = record(value)
    const id = text(row.id)
    const name = text(row.name)
    if (!id || id.includes('/') || !name || seen.has(id)) return []
    seen.add(id)
    const types = new Set<string>()
    const interactions = (
      Array.isArray(row.interactions) ? row.interactions : []
    ).flatMap((value): KitchenServiceInteraction[] => {
      const item = record(value)
      const policy =
        item.type === 'browse'
          ? { type: 'browse' as const }
          : readKitchenOrderTypeConfig(item)
      if (!policy || types.has(policy.type)) return []
      types.add(policy.type)
      return [{ ...policy, enabled: item.enabled === true }]
    })
    let hours: KitchenService['hours']
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
        ...(hours ? { hours } : {}),
        interactions,
      },
    ]
  })
}
