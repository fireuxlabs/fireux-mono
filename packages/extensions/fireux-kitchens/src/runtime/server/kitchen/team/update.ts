import { createError, type H3Event } from 'h3'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import { serverKitchenTeamMembersTarget } from 'fireux-core/runtime/utils/firestore-mutations/targets'
import {
  readKitchenMutationActor,
  requireKitchenMutationAuthority,
} from '../mutation-authority.ts'

export type UpdateKitchenMemberInput = {
  kitchenId: string
  memberId: string
  name: string
}

export type UpdateKitchenMemberResult = {
  ok: true
  memberId: string
  name: string
  slug: string
}

const normalizeName = (value: unknown) =>
  String(value ?? '')
    .trim()
    .replace(/\s+/g, ' ')

function parseInput(input: UpdateKitchenMemberInput) {
  const kitchenId = requireFirestoreDocumentId(input?.kitchenId, 'Kitchen id')
  const memberId = requireFirestoreDocumentId(input?.memberId, 'Team member id')
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
  return { kitchenId, memberId, name }
}

export async function updateKitchenMember(
  event: H3Event,
  input: UpdateKitchenMemberInput
): Promise<UpdateKitchenMemberResult> {
  const requested = parseInput(input)
  const actor = await readKitchenMutationActor(event)
  let slug = ''

  await runGuardedServerTransaction({ kind: 'runtime' }, async (mutations) => {
    const kitchen = await requireKitchenMutationAuthority(
      mutations,
      actor,
      requested.kitchenId
    )
    const members = serverKitchenTeamMembersTarget(
      kitchen.ownerAppId,
      requested.kitchenId
    )
    const current = await mutations.read(members, requested.memberId)
    if (!current.exists) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Team member not found.',
      })
    }

    slug = String(current.data?.slug ?? '').trim()
    mutations.update(members, requested.memberId, {
      name: requested.name,
      display_name: requested.name,
      updated: serverAuditStamp({ by: actor.uid }),
    })
  })

  return {
    ok: true,
    memberId: requested.memberId,
    name: requested.name,
    slug,
  }
}
