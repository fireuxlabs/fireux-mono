import { randomUUID } from 'node:crypto'
import { createError } from 'h3'
import type { Firestore } from 'firebase-admin/firestore'
import type { GuardedServerTransaction } from '../firestore-mutations/server-transaction'
import type { FirestoreMutationTarget } from '../../../types/firestore-mutations'
import { requireFirestoreDocumentId } from '../ids/path'
import { getRuntimeIdentityFirestore } from '../getRuntimeFirestore'
import { normalizeUser } from '../../../user/utils/normalize-user'
import {
  userBelongsToDirectoryScope,
  resolveUserDirectoryScope,
} from '../../../user/server/directory/scope'

type Target = FirestoreMutationTarget<string, 'server'>
const text = (value: unknown) => String(value ?? '').trim()
const fail = (statusCode: number, statusMessage: string): never => {
  throw createError({ statusCode, statusMessage })
}
export type TeamMemberUpdate = { memberId: string; changes: { name: string } }

export async function resolveTeamMemberInput(input: {
  name: unknown
  userId?: unknown
}) {
  let name = text(input.name).replace(/\s+/g, ' ')
  if (!name || name.length > 120)
    fail(
      400,
      'Team member name is required and must be 120 characters or fewer.'
    )
  const userId = input.userId
    ? requireFirestoreDocumentId(input.userId, 'User id')
    : ''
  if (userId) {
    const allowed = await userBelongsToDirectoryScope(
      resolveUserDirectoryScope(),
      userId
    )
    const snapshot = await getRuntimeIdentityFirestore()
      .collection('users')
      .doc(userId)
      .get()
    const user = snapshot.exists
      ? normalizeUser(snapshot.id, snapshot.data())
      : null
    if (!allowed || !user?.handle)
      fail(404, 'User is not available in this App.')
    name = user!.display_name || user!.handle
  }
  return { name, userId }
}

// The domain must authorize the trusted target before invoking these mechanics.
export async function createTeamMember(
  tx: GuardedServerTransaction,
  target: Target,
  input: { name: string; userId?: string },
  options: { canAdd: (count: number) => boolean; limitMessage: string }
) {
  const rows = await tx.readAll<Record<string, unknown>>(target, 1000)
  if (
    input.userId &&
    rows.some((row) => text(row.data.user_id) === input.userId)
  )
    fail(409, 'This User is already on the Team.')
  if (!options.canAdd(rows.length)) fail(409, options.limitMessage)
  const memberId = randomUUID()
  tx.create(target, memberId, {
    name: input.name,
    user_id: input.userId || '',
    role_ids: [],
  })
  return { ok: true as const, memberId, name: input.name }
}

export async function updateTeamMembers(
  tx: GuardedServerTransaction,
  target: Target,
  input: TeamMemberUpdate[]
) {
  if (!Array.isArray(input) || !input.length || input.length > 200)
    fail(400, 'Choose between 1 and 200 members.')
  const updates = input.map((update) => {
    const memberId = requireFirestoreDocumentId(update.memberId, 'Member id')
    const name = text(update.changes?.name).replace(/\s+/g, ' ')
    if (
      !name ||
      name.length > 120 ||
      Object.keys(update.changes || {}).some((key) => key !== 'name')
    )
      fail(400, 'Enter a valid name.')
    return { memberId, changes: { name } }
  })
  if (new Set(updates.map((row) => row.memberId)).size !== updates.length)
    fail(400, 'Choose each member once.')
  const rows = await tx.readMany<Record<string, unknown>>(
    target,
    updates.map((row) => row.memberId)
  )
  for (const update of updates) {
    const current = rows.find((row) => row.id === update.memberId)
    if (!current?.exists) fail(404, 'Team member not found.')
    if (!text(current!.data?.user_id))
      tx.update(target, update.memberId, update.changes)
  }
  return { ok: true as const, updates }
}

export async function deleteTeamMember(
  tx: GuardedServerTransaction,
  target: Target,
  memberId: string
) {
  requireFirestoreDocumentId(memberId, 'Team member id')
  const current = await tx.read<Record<string, unknown>>(target, memberId)
  if (!current.exists) fail(404, 'Team member not found.')
  tx.delete(target, memberId)
  return {
    ok: true as const,
    memberId,
    name: text(current.data?.name) || 'Team member',
  }
}

export async function enrichTeamMembers(
  records: Array<{ id: string; data: Record<string, unknown> }>,
  identityDb: Firestore
) {
  const ids = [
    ...new Set(records.map((row) => text(row.data.user_id)).filter(Boolean)),
  ]
  ids.forEach((id) => requireFirestoreDocumentId(id, 'User id'))
  const snapshots = ids.length
    ? await identityDb.getAll(
        ...ids.map((id) => identityDb.collection('users').doc(id))
      )
    : []
  const users = new Map(
    snapshots.flatMap((snapshot) => {
      const user = snapshot.exists
        ? normalizeUser(snapshot.id, snapshot.data())
        : null
      return user ? [[user.id, user] as const] : []
    })
  )
  return records.map((row) => {
    const user = users.get(text(row.data.user_id))
    return {
      memberId: row.id,
      name: user?.display_name || user?.handle || text(row.data.name),
      avatar: user?.avatar || '',
      userId: user?.id || '',
      linked: Boolean(user),
      roleIds: Array.isArray(row.data.role_ids)
        ? row.data.role_ids.map(text).filter(Boolean)
        : [],
    }
  })
}
