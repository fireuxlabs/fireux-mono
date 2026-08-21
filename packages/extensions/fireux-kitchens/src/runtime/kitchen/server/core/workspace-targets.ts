// Concurrent edit — 2026-07-22 12:41 CEST — Kitchen palette workspace: share fixed-runtime target bounds between reads and trusted writes.
import { createError } from 'h3'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import { KITCHEN_WORKSPACE_TARGET_LIMIT } from '../../models/kitchen-index.model.ts'

const text = (value: unknown) => String(value ?? '').trim()

function conflict(statusMessage: string): never {
  throw createError({ statusCode: 409, statusMessage })
}

export async function resolveKitchenWorkspaceTargetIds(uid: string) {
  const snapshot = await getRuntimeFirestore()
    .collectionGroup('team')
    .where('user_id', '==', uid)
    .where('status', '==', 'active')
    .get()
  const ids = [
    ...new Set(
      snapshot.docs.flatMap((member) => {
        const parts = member.ref.path.split('/')
        if (
          parts.length !== 4 ||
          parts[0] !== 'kitchens' ||
          parts[2] !== 'team' ||
          parts[3] !== uid ||
          text(member.get('user_id')) !== uid
        ) {
          return []
        }
        return [parts[1]]
      })
    ),
  ]

  if (ids.length > KITCHEN_WORKSPACE_TARGET_LIMIT) {
    conflict('Kitchen workspace targets exceed the supported limit.')
  }
  return ids
}
