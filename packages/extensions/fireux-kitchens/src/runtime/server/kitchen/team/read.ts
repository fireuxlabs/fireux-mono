import type { H3Event } from 'h3'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { serverKitchenTeamMembersTarget } from 'fireux-core/runtime/utils/firestore-mutations/targets'
import {
  readKitchenMutationActor,
  requireKitchenMutationAuthority,
} from '../mutation-authority.ts'

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
    slug: string
    linked: boolean
  }[] = []
  await runGuardedServerTransaction({ kind: 'runtime' }, async (mutations) => {
    const kitchen = await requireKitchenMutationAuthority(
      mutations,
      actor,
      kitchenId
    )
    const records = await mutations.readAll<Record<string, unknown>>(
      serverKitchenTeamMembersTarget(kitchen.ownerAppId, kitchenId),
      200
    )
    members = records.map((record) => ({
      memberId: record.id,
      name: text(record.data.name) || 'Team member',
      slug: text(record.data.slug),
      linked: Boolean(text(record.data.user_id)),
    }))
  })
  return { ok: true as const, members }
}
