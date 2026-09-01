import type { H3Event } from 'h3'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { serverKitchenTeamMembersTarget } from 'fireux-core/runtime/utils/firestore-mutations/targets'
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
    slug: string
    linked: boolean
    role: 'owner' | 'operator' | 'member'
  }[] = []
  await runGuardedServerTransaction({ kind: 'runtime' }, async (mutations) => {
    await requireKitchenMutationAuthority(mutations, actor, kitchenId)
    const records = await mutations.readAll<Record<string, unknown>>(
      serverKitchenTeamMembersTarget(kitchenId),
      200
    )
    members = records
      .filter(
        (record) =>
          record.data.active !== false && text(record.data.status) === 'active'
      )
      .map((record) => {
        const role = text(record.data.role)
        return {
          memberId: record.id,
          name: text(record.data.name) || 'Team member',
          slug: text(record.data.slug),
          linked: Boolean(text(record.data.user_id)),
          role:
            role === 'owner' || role === 'operator'
              ? role
              : ('member' as const),
        }
      })
  })
  return { ok: true as const, members }
}
