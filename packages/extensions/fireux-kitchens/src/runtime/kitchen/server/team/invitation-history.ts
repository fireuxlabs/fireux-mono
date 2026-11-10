import type { Timestamp } from 'firebase-admin/firestore'
import type { GuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import type { serverKitchenMemberInvitationsTarget } from './mutation-targets'

export type StoredInvitation = {
  member_id?: string
  token_hash?: string
  status?: string
  accepted_by?: string
  expires_at?: Timestamp
  created?: { at?: Timestamp; app_id?: string }
}

export async function readKitchenMemberInvitationHistory(
  tx: GuardedServerTransaction,
  invitations: ReturnType<typeof serverKitchenMemberInvitationsTarget>,
  memberId: string
) {
  const pendingIds: string[] = []
  let afterId: string | undefined
  let latestTime = ''
  let latestId: string | undefined
  for (;;) {
    const page = await tx.query<StoredInvitation>(invitations, {
      field: 'member_id',
      op: '==',
      value: memberId,
      limit: 100,
      afterId,
    })
    for (const { id, data } of page) {
      if (data.status === 'pending') pendingIds.push(id)
      // Timestamp.valueOf preserves Firestore ordering down to nanoseconds.
      const issuedAt = data.created?.at?.valueOf()
      if (typeof issuedAt !== 'string') continue
      if (issuedAt === latestTime) latestId = undefined
      if (issuedAt > latestTime) {
        latestTime = issuedAt
        latestId = id
      }
    }
    if (page.length < 100) return { pendingIds, latestId }
    afterId = page.at(-1)!.id
  }
}
