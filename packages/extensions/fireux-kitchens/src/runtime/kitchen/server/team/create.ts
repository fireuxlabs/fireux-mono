import { randomUUID } from 'node:crypto'
import { createError, type H3Event } from 'h3'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug'
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
  jobTitle?: string
  station?: string
  certifications?: string[]
  notes?: string
}

export type CreateKitchenTeamMemberResult = {
  ok: true
  memberId: string
  name: string
  slug: string
}

const normalizeName = (value: unknown) =>
  String(value ?? '')
    .trim()
    .replace(/\s+/g, ' ')

const normalizeOptional = (value: unknown, maxLength: number) =>
  String(value ?? '')
    .trim()
    .replace(/\s+/g, ' ')
    .slice(0, maxLength)

const normalizeCertifications = (value: unknown) =>
  Array.from(
    new Set(
      (Array.isArray(value) ? value : [])
        .map((item) => normalizeOptional(item, 120))
        .filter(Boolean)
    )
  ).slice(0, 20)

function parseInput(input: CreateKitchenTeamMemberInput) {
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
  if (
    input?.jobTitle !== undefined &&
    (typeof input.jobTitle !== 'string' || input.jobTitle.length > 120)
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Job title must be 120 characters or fewer.',
    })
  }
  return {
    kitchenId,
    userId: input?.userId
      ? requireFirestoreDocumentId(input.userId, 'User id')
      : '',
    name,
    jobTitle: normalizeOptional(input?.jobTitle, 120),
    station: normalizeOptional(input?.station, 120),
    certifications: normalizeCertifications(input?.certifications),
    notes: normalizeOptional(input?.notes, 1_000),
  }
}

function allocateTeamMemberSlug(
  name: string,
  members: readonly { data: { name?: unknown; slug?: unknown } }[]
) {
  const base = normalizeSlug(name, { maxLength: 96 }) || 'team-member'
  const occupied = new Set(
    members
      .map(({ data }) =>
        normalizeSlug(data.slug || data.name, { maxLength: 120 })
      )
      .filter(Boolean)
  )
  if (!occupied.has(base)) return base

  for (let suffix = 2; suffix <= members.length + 2; suffix += 1) {
    const candidate = normalizeSlug(`${base}-${suffix}`, { maxLength: 120 })
    if (!occupied.has(candidate)) return candidate
  }
  throw createError({
    statusCode: 409,
    statusMessage: 'A unique Team member slug could not be allocated.',
  })
}

export async function createKitchenTeamMember(
  event: H3Event,
  input: CreateKitchenTeamMemberInput
): Promise<CreateKitchenTeamMemberResult> {
  const requested = parseInput(input)
  const actor = await readKitchenMutationActor(event)
  const memberId = randomUUID()
  let slug = ''

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
      active?: unknown
      name?: unknown
      slug?: unknown
      status?: unknown
      user_id?: unknown
    }>(teamMembers, 1_000)
    const memberCount = existingMembers.filter(
      ({ data }) => data.active !== false && data.status !== 'inactive'
    ).length
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
    slug = allocateTeamMemberSlug(requested.name, existingMembers)
    const member = buildKitchenTeamMemberRecord({
      appId: kitchen.ownerAppId,
      createdBy: actor.uid,
      kitchenId: requested.kitchenId,
      memberId,
      name: requested.name,
      userId: requested.userId,
      slug,
      jobTitle: requested.jobTitle,
      station: requested.station,
      certifications: requested.certifications,
      notes: requested.notes,
    })

    mutations.create(teamMembers, memberId, member)
  })

  return {
    ok: true,
    memberId,
    name: requested.name,
    slug,
  }
}
