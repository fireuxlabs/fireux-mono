import { getRuntimeIdentityFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'
import { readRecordString } from 'fireux-core/runtime/server/utils/records/read.ts'
import { UserStorage } from 'fireux-core/runtime/models/core/user.model.ts'

const text = (value: unknown) => String(value ?? '').trim()

const uniqueText = (values: unknown[]) =>
  Array.from(new Set(values.map((value) => text(value)).filter(Boolean)))

const userDisplayLabel = (data: Record<string, unknown>) =>
  readRecordString(data, 'display_name') ||
  readRecordString(data, 'displayName') ||
  readRecordString(data, 'handle')

export async function readMenuCreatorLabels(createdByIds: string[]) {
  const ids = uniqueText(createdByIds)
  if (!ids.length) return new Map<string, string>()

  const db = getRuntimeIdentityFirestore()
  const entries = await Promise.all(
    ids.map(async (id) => {
      const snap = await db.collection(UserStorage.rootCollection).doc(id).get()
      const label = snap.exists ? userDisplayLabel(snap.data() || {}) : ''

      return [id, label || 'User'] as const
    })
  )

  return new Map(entries)
}

export function menuCreatorLabel(
  createdBy: string,
  creatorLabels: Map<string, string>
) {
  if (!createdBy) return 'Guest'

  return creatorLabels.get(createdBy) || 'User'
}
