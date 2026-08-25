import type { FireuxStamped } from 'fireux-core/runtime/models/utils/stamps.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'
import type {
  KitchenWasteEvent,
  KitchenWasteReason,
  KitchenWasteSource,
} from '../models/waste-event.model'

export type {
  KitchenWasteEvent,
  KitchenWasteReason,
  KitchenWasteSource,
} from '../models/waste-event.model'

export const KitchenWasteEventStorage = {
  shape: 'scoped',
  path: 'kitchens/{kitchenId}/waste-events/{wasteEventId}',
  collection: 'waste-events',
  parent: 'kitchen',
  idParam: 'wasteEventId',
} as const

export const KITCHEN_WASTE_REASON_OPTIONS = [
  { value: 'spoilage', label: 'Spoilage' },
  { value: 'preparation', label: 'Preparation loss' },
  { value: 'overproduction', label: 'Overproduction' },
  { value: 'cooking_error', label: 'Cooking mistake' },
  { value: 'returned', label: 'Returned food' },
  { value: 'other', label: 'Other' },
] as const

export const KITCHEN_WASTE_SOURCE_OPTIONS = [
  { value: 'storage', label: 'Storage' },
  { value: 'prep', label: 'Prep' },
  { value: 'production', label: 'Production' },
  { value: 'service', label: 'Service' },
  { value: 'customer_return', label: 'Customer return' },
  { value: 'other', label: 'Other' },
] as const

export const KitchenWasteEventDefaults: KitchenWasteEvent = {
  id: '',
  kitchen_id: '',
  item_name: '',
  quantity: 0,
  unit: '',
  reason: 'other',
  source: 'other',
  occurred_at: {} as FirebaseTimestamp,
  notes: '',
  created: {
    at: {} as FirebaseTimestamp,
    by: '' as FireuxStamped['created']['by'],
    app_id: '' as FireuxStamped['created']['app_id'],
  },
  updated: {
    at: {} as FirebaseTimestamp,
    by: '' as FireuxStamped['updated']['by'],
  },
}

const text = (value: unknown) => String(value ?? '').trim()
const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}

function optionValue<T extends string>(
  value: unknown,
  options: readonly { value: T }[],
  fallback: T
) {
  const candidate = text(value)
  return options.some((option) => option.value === candidate)
    ? (candidate as T)
    : fallback
}

export function normalizeKitchenWasteEvent(value: unknown): KitchenWasteEvent {
  const source = record(value)
  const quantity = Number(source.quantity)
  return {
    ...KitchenWasteEventDefaults,
    id: text(source.id),
    kitchen_id: text(source.kitchen_id),
    item_name: text(source.item_name),
    quantity: Number.isFinite(quantity) && quantity > 0 ? quantity : 0,
    unit: text(source.unit),
    reason: optionValue(source.reason, KITCHEN_WASTE_REASON_OPTIONS, 'other'),
    source: optionValue(source.source, KITCHEN_WASTE_SOURCE_OPTIONS, 'other'),
    occurred_at: source.occurred_at as FirebaseTimestamp,
    notes: text(source.notes),
    created: Object.keys(record(source.created)).length
      ? (source.created as KitchenWasteEvent['created'])
      : KitchenWasteEventDefaults.created,
    updated: Object.keys(record(source.updated)).length
      ? (source.updated as KitchenWasteEvent['updated'])
      : KitchenWasteEventDefaults.updated,
  }
}
