import { randomUUID } from 'node:crypto'
import { createError, type H3Event } from 'h3'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { serverKitchenTeamMembersTarget } from 'fireux-core/runtime/utils/firestore-mutations/targets'
import {
  readKitchenMutationActor,
  requireKitchenMutationAuthority,
} from '../core/mutation-authority.ts'
import { buildKitchenTeamMemberRecord } from './member-record.ts'
import { canAddKitchenTeamMember } from '../../utils/team.ts'
import { getRuntimeIdentityFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import {
  userBelongsToDirectoryScope,
  resolveUserDirectoryScope,
} from 'fireux-core/runtime/user/server/directory/scope'
import { normalizeUser } from 'fireux-core/runtime/user/utils/normalize-user'

export type CreateKitchenTeamMemberInput = {
  kitchenId: string
  name: string
  userId?: string
}

export type CreateKitchenTeamMemberResult = {
  ok: true
  memberId: string
  name: string
}

const normalizeName = (value: unknown) =>
  String(value ?? '')
    .trim()
    .replace(/\s+/g, ' ')

function parseInput(input: CreateKitchenTeamMemberInput) {
  if (Object.keys(input || {}).some(key => !['kitchenId', 'name', 'userId'].includes(key))) throw createError({statusCode: 400, statusMessage: 'Unsupported Team member field.'})
  const kitchenId = requireFirestoreDocumentId(input?.kitchenId, 'Kitchen id')
  const name = normalizeName(input?.name)
  if (!name) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Team member name is required.',
    })
  }
  if (name.length > 120) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Team member name must be 120 characters or fewer.',
    })
  }
  return {
    kitchenId,
    userId: input?.userId
      ? requireFirestoreDocumentId(input.userId, 'User id')
      : '',
    name,
  }
}

export async function createKitchenTeamMember(
  event: H3Event,
  input: CreateKitchenTeamMemberInput
): Promise<CreateKitchenTeamMemberResult> {
  const requested = parseInput(input)
  const actor = await readKitchenMutationActor(event)
  const memberId = randomUUID()

  if (requested.userId) {
    const allowed = await userBelongsToDirectoryScope(
      resolveUserDirectoryScope(),
      requested.userId
    )
    const identity = await getRuntimeIdentityFirestore()
      .collection('users')
      .doc(requested.userId)
      .get()
    const user = identity.exists
      ? normalizeUser(identity.id, identity.data())
      : null
    if (!allowed || !user?.handle) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User is not available in this App.',
      })
    }
    requested.name = user.display_name || user.handle
  }

  await runGuardedServerTransaction({ kind: 'runtime' }, async (mutations) => {
    const kitchen = await requireKitchenMutationAuthority(
      mutations,
      actor,
      requested.kitchenId
    )
    const teamMembers = serverKitchenTeamMembersTarget(requested.kitchenId)
    const existingMembers = await mutations.readAll<{
      name?: unknown
      user_id?: unknown
    }>(teamMembers, 1_000)
    const memberCount = existingMembers.length
    if (
      requested.userId &&
      existingMembers.some(
        ({ data }) => String(data.user_id || '').trim() === requested.userId
      )
    ) {
      throw createError({
        statusCode: 409,
        statusMessage: 'This User is already on the Kitchen Team.',
      })
    }
    if (
      !canAddKitchenTeamMember(
        actor.subscriptionCapacity,
        kitchen.subscription,
        memberCount
      )
    ) {
      throw createError({
        statusCode: 409,
        statusMessage: `Your ${kitchen.subscription} subscription has reached its Team member limit.`,
      })
    }
    const member = buildKitchenTeamMemberRecord({
      name: requested.name,
      userId: requested.userId,
    })

    mutations.create(teamMembers, memberId, member)
  })

  return {
    ok: true,
    memberId,
    name: requested.name,
  }
}
