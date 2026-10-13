import { requireKitchenInteractionChanges } from '../../utils/interaction-validation'
import { createError } from 'h3'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import {
  KitchenOrderTypes,
  type KitchenOrderType,
} from '../../models/offering-interaction-types.model'
import type { KitchenOfferingInteractionChanges } from '../../models/offering.model'

const fail = (message: string): never => {
  throw createError({ statusCode: 400, statusMessage: message })
}
const object = (value: unknown): Record<string, unknown> => {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    return fail('Invalid ordering settings.')
  return value as Record<string, unknown>
}
const allowed = (value: Record<string, unknown>, keys: string[]) => {
  if (Object.keys(value).some((key) => !keys.includes(key)))
    fail('Unsupported ordering setting.')
}
export function readInteractionChanges(input: unknown) {
  const body = object(input)
  allowed(body, ['kitchenId', 'offeringId', 'type', 'changes'])
  const kitchenId = requireFirestoreDocumentId(body.kitchenId, 'Kitchen id')
  const offeringId = requireFirestoreDocumentId(body.offeringId, 'Offering id')
  const type = body.type as KitchenOrderType | 'browse'
  if (type !== 'browse' && !KitchenOrderTypes.includes(type))
    fail('Unknown ordering offering.')
  const changes = requireKitchenInteractionChanges(type, body.changes, fail)
  return {
    kitchenId,
    offeringId,
    type,
    changes: changes as KitchenOfferingInteractionChanges,
  }
}
