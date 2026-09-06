import { createError, type H3Event } from 'h3'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { serverKitchenTeamMembersTarget } from 'fireux-core/runtime/utils/firestore-mutations/targets'
import {
  readKitchenMutationActor,
  requireKitchenMutationAuthority,
} from '../core/mutation-authority'

export type KitchenTeamMemberChanges = {
  name: string
}
export type KitchenTeamMemberUpdate = {
  memberId: string
  changes: KitchenTeamMemberChanges
}
export type UpdateKitchenTeamMemberInput = KitchenTeamMemberUpdate & {
  kitchenId: string
}
export type UpdateKitchenTeamMemberResult = {
  ok: true
  memberId: string
  name: string
}
const text = (value: unknown) =>
  String(value ?? '')
    .trim()
    .replace(/\s+/g, ' ')
export async function updateKitchenTeamMember(
  event: H3Event,
  input: UpdateKitchenTeamMemberInput
): Promise<UpdateKitchenTeamMemberResult> {
  const result = await updateKitchenTeamMembers(event, {
    kitchenId: input.kitchenId,
    updates: [{ memberId: input.memberId, changes: input.changes }],
  })
  return {
    ok: true,
    memberId: result.updates[0]!.memberId,
    name: result.updates[0]!.changes.name,
  }
}
export async function updateKitchenTeamMembers(
  event: H3Event,
  input: { kitchenId: string; updates: KitchenTeamMemberUpdate[] }
) {
  const kitchenId = requireFirestoreDocumentId(input.kitchenId, 'Kitchen id')
  if (
    !Array.isArray(input.updates) ||
    !input.updates.length ||
    input.updates.length > 200
  )
    throw createError({
      statusCode: 400,
      statusMessage: 'Choose between 1 and 200 members.',
    })
  const updates = input.updates.map((update) => {
    const memberId = requireFirestoreDocumentId(update.memberId, 'Member id')
    const name = text(update.changes?.name)
    if (
      !name ||
      name.length > 120 ||
      Object.keys(update.changes || {}).some(
        (key) => key !== 'name'
      )
    )
      throw createError({
        statusCode: 400,
        statusMessage: 'Enter a valid name.',
      })
    return { memberId, changes: { name } }
  })
  if (new Set(updates.map((update) => update.memberId)).size !== updates.length)
    throw createError({
      statusCode: 400,
      statusMessage: 'Choose each member once.',
    })
  const actor = await readKitchenMutationActor(event)
  await runGuardedServerTransaction({ kind: 'runtime' }, async (mutations) => {
    await requireKitchenMutationAuthority(
      mutations,
      actor,
      kitchenId
    )
    const members = serverKitchenTeamMembersTarget(kitchenId)
    const rows = await mutations.readAll<Record<string, unknown>>(members, 1000)
    for (const update of updates) {
      const current = rows.find((row) => row.id === update.memberId)
      if (!current)
        throw createError({
          statusCode: 404,
          statusMessage: 'Team member not found.',
        })
      const changes = {
        ...(!text(current.data.user_id) ? { name: update.changes.name } : {}),
      }
      if (Object.keys(changes).length)
        mutations.update(members, update.memberId, changes)
    }
  })
  return { ok: true as const, updates }
}
