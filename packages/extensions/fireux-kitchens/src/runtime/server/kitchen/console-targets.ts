// Concurrent edit — 2026-07-22 12:41 CEST — Kitchen palette console: share fixed-runtime target bounds between reads and trusted writes.
import { createError } from 'h3'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'
import { KITCHEN_CONSOLE_TARGET_LIMIT } from '../../models/kitchen/kitchen-index.model.ts'

const text = (value: unknown) => String(value ?? '').trim()

function conflict(statusMessage: string): never {
  throw createError({ statusCode: 409, statusMessage })
}

export async function resolveKitchenConsoleTargetIds(
  appId: string,
  uid: string,
  membership: Record<string, unknown>
) {
  const role = text(membership.role)
  if (role !== 'admin' && role !== 'user') return []
  const collection = getRuntimeFirestore().collection(`apps/${appId}/kitchens`)
  const snapshots = await Promise.all([
    collection.where('operator_ids', 'array-contains', uid).get(),
    collection.where('team_ids', 'array-contains', uid).get(),
  ])
  const ids = [...new Set(snapshots.flatMap(snapshot => snapshot.docs.map(document => document.id)))]

  if (ids.length > KITCHEN_CONSOLE_TARGET_LIMIT) {
    conflict('Kitchen console targets exceed the supported limit.')
  }
  return ids
}
