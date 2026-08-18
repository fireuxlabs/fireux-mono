// Concurrent edit — 2026-07-22 12:41 CEST — Kitchen palette console: share fixed-runtime target bounds between reads and trusted writes.
import { createError } from 'h3'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import { KITCHEN_CONSOLE_TARGET_LIMIT } from '../../models/kitchen-index.model.ts'

const text = (value: unknown) => String(value ?? '').trim()

function conflict(statusMessage: string): never {
  throw createError({ statusCode: 409, statusMessage })
}

export async function resolveKitchenConsoleTargetIds(
  uid: string,
  membership: Record<string, unknown>
) {
  const role = text(membership.role)
  if (role !== 'admin' && role !== 'user') return []
  const snapshot = await getRuntimeFirestore()
    .doc(`users/${uid}/private/targets`)
    .get()
  const rawIds = snapshot.data()?.kitchen_ids
  const ids = Array.isArray(rawIds)
    ? [...new Set(rawIds.map(text).filter((id) => id && !id.includes('/')))]
    : []

  if (ids.length > KITCHEN_CONSOLE_TARGET_LIMIT) {
    conflict('Kitchen console targets exceed the supported limit.')
  }
  return ids
}
