import type { Firestore } from 'firebase-admin/firestore'
import type { GuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { createError } from 'h3'
import { serverKitchenTeamMembersTarget } from '../mutation-targets.ts'

type Member = { id: string; data: Record<string, unknown> }
type TeamAccountLink =
  | { state: 'linked'; member: Member }
  | { state: 'missing' | 'invalid'; member: null }

async function resolveLink(
  matches: Member[],
  uidSlotExists: () => Promise<boolean>
): Promise<TeamAccountLink> {
  const [member] = matches
  if (member && matches.length === 1) return { state: 'linked', member }
  // A UID-keyed record for another person cannot supply or receive this link.
  if (member || (await uidSlotExists()))
    return { state: 'invalid', member: null }
  return { state: 'missing', member: null }
}

export function requireUnambiguousKitchenTeamLink(link: TeamAccountLink) {
  if (link.state === 'invalid')
    throw createError({
      statusCode: 409,
      statusMessage: 'The Kitchen roster has a conflicting account link.',
    })
  return link.member
}

export async function readKitchenTeamAccountLink(
  db: Firestore,
  kitchenId: string,
  userId: string
) {
  const team = db.collection(
    serverKitchenTeamMembersTarget(kitchenId).collectionPath
  )
  const matches = await team.where('user_id', '==', userId).limit(2).get()
  return resolveLink(
    matches.docs.map((row) => ({ id: row.id, data: row.data() })),
    async () => (await team.doc(userId).get()).exists
  )
}

export async function readKitchenTeamAccountLinkInTransaction(
  tx: GuardedServerTransaction,
  target: ReturnType<typeof serverKitchenTeamMembersTarget>,
  userId: string
) {
  const matches = await tx.query(target, {
    field: 'user_id',
    op: '==',
    value: userId,
    limit: 2,
  })
  return resolveLink(
    matches,
    async () => (await tx.read(target, userId)).exists
  )
}
