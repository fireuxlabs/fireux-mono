import { createError, type H3Event } from 'h3'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import { serverKitchenTeamMembersTarget } from 'fireux-core/runtime/utils/firestore-mutations/targets'
import {
  readKitchenMutationActor,
  requireKitchenMutationAuthority,
} from '../core/mutation-authority.ts'

export type KitchenTeamMemberChanges = {
  name: string
  role?: 'operator' | 'member'
  jobTitle?: string
}

export type UpdateKitchenTeamMemberInput = {
  kitchenId: string
  memberId: string
  changes: KitchenTeamMemberChanges
}

export type UpdateKitchenTeamMemberResult = {
  ok: true
  memberId: string
  name: string
  slug: string
}

export type KitchenTeamMemberUpdate = {
  memberId: string
  changes: KitchenTeamMemberChanges
}

const normalizeName = (value: unknown) =>
  String(value ?? '')
    .trim()
    .replace(/\s+/g, ' ')

function parseUpdate(input: KitchenTeamMemberUpdate) {
  const memberId = requireFirestoreDocumentId(input?.memberId, 'Team member id')
  const name = normalizeName(input?.changes?.name)
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
  const jobTitle = input?.changes?.jobTitle
  if (
    jobTitle !== undefined &&
    (typeof jobTitle !== 'string' || jobTitle.length > 120)
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Job title must be 120 characters or fewer.',
    })
  }
  const rawRole = String(input?.changes?.role ?? '').trim()
  if (rawRole && rawRole !== 'operator' && rawRole !== 'member') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Team member role must be operator or member.',
    })
  }
  return {
    memberId,
    changes: {
      name,
      ...(jobTitle !== undefined ? { jobTitle: normalizeName(jobTitle) } : {}),
      ...(rawRole ? { role: rawRole as 'operator' | 'member' } : {}),
    },
  }
}

export async function updateKitchenTeamMember(
  event: H3Event,
  input: UpdateKitchenTeamMemberInput
): Promise<UpdateKitchenTeamMemberResult> {
  const result = await updateKitchenTeamMembers(event, {
    kitchenId: input.kitchenId,
    updates: [{ memberId: input.memberId, changes: input.changes }],
  })
  const updated = result.updates[0]!
  return {
    ok: true,
    memberId: updated.memberId,
    name: updated.changes.name,
    slug: updated.slug,
  }
}

export async function updateKitchenTeamMembers(
  event: H3Event,
  input: { kitchenId: string; updates: KitchenTeamMemberUpdate[] }
) {
  const kitchenId = requireFirestoreDocumentId(input?.kitchenId, 'Kitchen id')
  const updates = Array.isArray(input?.updates)
    ? input.updates.map(parseUpdate)
    : []
  if (!updates.length || updates.length > 200) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Between 1 and 200 member name changes are required.',
    })
  }
  if (
    new Set(updates.map((update) => update.memberId)).size !== updates.length
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: 'A Team member can only be updated once per command.',
    })
  }

  const actor = await readKitchenMutationActor(event)
  await runGuardedServerTransaction({ kind: 'runtime' }, async (mutations) => {
    const authority = await requireKitchenMutationAuthority(
      mutations,
      actor,
      kitchenId
    )
    const members = serverKitchenTeamMembersTarget(kitchenId)
    const existing = await Promise.all(
      updates.map((update) => mutations.read(members, update.memberId))
    )
    if (existing.some((member) => !member.exists)) {
      throw createError({
        statusCode: 404,
        statusMessage: 'One or more Team members no longer exist.',
      })
    }
    for (const [index, update] of updates.entries()) {
      const currentRole = String(existing[index]?.data?.role ?? '').trim()
      const currentUserId = String(existing[index]?.data?.user_id ?? '').trim()
      if (
        currentUserId &&
        update.changes.name !== normalizeName(existing[index]?.data?.name)
      ) {
        throw createError({
          statusCode: 409,
          statusMessage: 'Linked names are managed in the person’s account.',
        })
      }
      if (
        (currentRole === 'owner' || currentRole === 'developer') &&
        currentUserId !== actor.uid
      ) {
        throw createError({
          statusCode: 403,
          statusMessage:
            'Only the Kitchen owner can update their owner record.',
        })
      }
      if (
        update.changes.role &&
        (currentRole === 'owner' || currentRole === 'developer')
      ) {
        throw createError({
          statusCode: 409,
          statusMessage:
            'Owner and Developer roles require a dedicated access change.',
        })
      }
      if (
        (currentRole === 'operator' || update.changes.role === 'operator') &&
        authority.teamRole !== 'owner' &&
        authority.teamRole !== 'developer'
      ) {
        throw createError({
          statusCode: 403,
          statusMessage:
            'Only the Kitchen owner or developer can grant operator access.',
        })
      }
      mutations.update(members, update.memberId, {
        name: update.changes.name,
        display_name: update.changes.name,
        ...(update.changes.jobTitle !== undefined
          ? { job_title: update.changes.jobTitle }
          : {}),
        ...(update.changes.role ? { role: update.changes.role } : {}),
        updated: serverAuditStamp({ by: actor.uid }),
      })
    }
    updates.forEach((update, index) => {
      Object.assign(update, {
        slug: String(existing[index]?.data?.slug ?? '').trim(),
      })
    })
  })
  return {
    ok: true as const,
    updates: updates as (KitchenTeamMemberUpdate & { slug: string })[],
  }
}
