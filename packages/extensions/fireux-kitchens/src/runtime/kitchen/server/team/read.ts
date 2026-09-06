import type { H3Event } from 'h3'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { getRuntimeIdentityFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import { serverKitchenTeamMembersTarget } from 'fireux-core/runtime/utils/firestore-mutations/targets'
import { normalizeUser } from 'fireux-core/runtime/user/utils/normalize-user'
import {
  readKitchenMutationActor,
  requireKitchenMutationAuthority,
} from '../core/mutation-authority.ts'

const text = (value: unknown) => String(value ?? '').trim()

export async function readKitchenTeamMembers(
  event: H3Event,
  input: { kitchenId: string }
) {
  const kitchenId = requireFirestoreDocumentId(input?.kitchenId, 'Kitchen id')
  const actor = await readKitchenMutationActor(event)
  let members: {
    memberId: string
    name: string
    avatar: string
    slug: string
    userId: string
    linked: boolean
    role: 'owner' | 'developer' | 'operator' | 'member'
  }[] = []
  let records: Array<{
    id: string
    data: Record<string, unknown>
  }> = []
  await runGuardedServerTransaction({ kind: 'runtime' }, async (mutations) => {
    await requireKitchenMutationAuthority(mutations, actor, kitchenId)
    records = await mutations.readAll<Record<string, unknown>>(
      serverKitchenTeamMembersTarget(kitchenId),
      200
    )
  })

  const activeRecords = records.filter(
    (record) =>
      record.data.active !== false && text(record.data.status) === 'active'
  )
  const requestedUserIds = [
    ...new Set(
      activeRecords.map((record) => text(record.data.user_id)).filter(Boolean)
    ),
  ]
  const identityDb = getRuntimeIdentityFirestore()
  const userSnapshots = requestedUserIds.length
    ? await identityDb.getAll(
        ...requestedUserIds.map((userId) =>
          identityDb.collection('users').doc(userId)
        )
      )
    : []
  const usersById = new Map(
    userSnapshots.flatMap((snapshot) => {
      const user = snapshot.exists
        ? normalizeUser(snapshot.id, snapshot.data())
        : null
      return user ? [[user.id, user] as const] : []
    })
  )

  members = activeRecords.map((record) => {
    const role = text(record.data.role)
    const storedUserId = text(record.data.user_id)
    const user = usersById.get(storedUserId)
    return {
      memberId: record.id,
      name: text(record.data.name),
      avatar: user?.avatar || '',
      slug: text(record.data.slug),
      userId: user?.id || '',
      linked: Boolean(user),
      role:
        role === 'owner' || role === 'developer' || role === 'operator'
          ? role
          : ('member' as const),
    }
  })
  return { ok: true as const, kitchenId, canManageTeam: true as const, members }
}
