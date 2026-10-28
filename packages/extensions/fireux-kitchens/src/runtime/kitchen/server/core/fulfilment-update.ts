import { createError, type H3Event } from 'h3'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { serverKitchenFulfilmentTarget } from '../mutation-targets'
import type { KitchenFulfilment } from '../../models/fulfilment.model.ts'
import { readKitchenFulfilmentConfig } from '../../utils/kitchen-readers.ts'
import {
  readKitchenMutationActor,
  requireKitchenMutationAuthority,
} from './mutation-authority.ts'

const record = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null

function badRequest(statusMessage: string): never {
  throw createError({ statusCode: 400, statusMessage })
}

function request(value: unknown) {
  const source = record(value)
  if (!source) badRequest('Kitchen fulfilment request must be an object.')
  const unsupported = Object.keys(source).find(
    (key) => !['kitchen_id', 'changes'].includes(key)
  )
  if (unsupported)
    badRequest(`Kitchen fulfilment contains unsupported field: ${unsupported}.`)

  const changes = record(source.changes)
  if (!changes) badRequest('Kitchen fulfilment changes must be an object.')
  const keys = Object.keys(changes)
  if (
    keys.length !== 1 ||
    !['delivery_zones', 'payment_methods'].includes(keys[0] || '')
  ) {
    badRequest('Change exactly one Kitchen fulfilment field.')
  }
  const field = keys[0] as 'delivery_zones' | 'payment_methods'
  if (!Array.isArray(changes[field]))
    badRequest(`Kitchen fulfilment ${field} must be an array.`)

  const normalized = readKitchenFulfilmentConfig({ fulfilment: changes })
  if (normalized[field].length !== changes[field].length) {
    badRequest(`Kitchen fulfilment ${field} contains an invalid record.`)
  }
  return {
    kitchenId: requireFirestoreDocumentId(source.kitchen_id, 'Kitchen id'),
    field,
    value: normalized[field],
  }
}

export async function updateKitchenFulfilment(event: H3Event, input: unknown) {
  const requested = request(input)
  const actor = await readKitchenMutationActor(event)

  const fulfilment = await runGuardedServerTransaction(
    { kind: 'runtime' },
    async (mutations) => {
      await requireKitchenMutationAuthority(
        mutations,
        actor,
        requested.kitchenId
      )
      const target = serverKitchenFulfilmentTarget(requested.kitchenId)
      const policy = await mutations.read(target, 'policy')
      const current = policy.exists
        ? readKitchenFulfilmentConfig(policy.data)
        : { delivery_zones: [], payment_methods: [] }
      const next: KitchenFulfilment = {
        delivery_zones:
          requested.field === 'delivery_zones'
            ? requested.value
            : current.delivery_zones,
        payment_methods:
          requested.field === 'payment_methods'
            ? requested.value
            : current.payment_methods,
      } as KitchenFulfilment

      if (policy.exists) mutations.update(target, 'policy', next)
      else mutations.create(target, 'policy', next)
      return next
    }
  )

  return {
    ok: true as const,
    kitchen_id: requested.kitchenId,
    fulfilment,
  }
}
