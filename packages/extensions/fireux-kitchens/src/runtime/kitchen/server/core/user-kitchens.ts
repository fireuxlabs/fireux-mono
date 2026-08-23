// Concurrent edit — 2026-08-23 CEST — Kitchen Workspace reset: resolve the signed-in user's active Kitchens.
import { createError } from 'h3'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import { KITCHEN_USER_LIMIT } from '../../models/kitchen-index.model.ts'

const text = (value: unknown) => String(value ?? '').trim()

function conflict(statusMessage: string): never {
  throw createError({ statusCode: 409, statusMessage })
}

export async function readUserKitchenIds(uid: string) {
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

  if (ids.length > KITCHEN_USER_LIMIT) {
    conflict('User Kitchens exceed the supported limit.')
  }
  return ids
}
