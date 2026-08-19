import {
  createHash,
  randomBytes,
  randomUUID,
  timingSafeEqual,
} from 'node:crypto'
import { FieldValue, Timestamp } from 'firebase-admin/firestore'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { requireFirebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import {
  serverAppKitchensTarget,
  serverKitchenMemberInvitationsTarget,
  serverKitchenTeamMembersTarget,
} from 'fireux-core/runtime/utils/firestore-mutations/targets'
import { createError, type H3Event } from 'h3'
import {
  readKitchenMutationActor,
  requireKitchenMutationAuthority,
} from '../core/mutation-authority.ts'

const INVITATION_LIFETIME_MS = 7 * 24 * 60 * 60 * 1_000

type InvitationLocator = {
  appId: string
  kitchenId: string
  invitationId: string
}

type StoredInvitation = {
  member_id?: unknown
  token_hash?: unknown
  status?: unknown
  expires_at?: { toMillis?: () => number }
}

const text = (value: unknown) => String(value ?? '').trim()
const hashSecret = (secret: string) =>
  createHash('sha256').update(secret).digest('hex')

function encodeToken(locator: InvitationLocator, secret: string) {
  return `${Buffer.from(JSON.stringify(locator)).toString('base64url')}.${secret}`
}

function parseToken(value: unknown) {
  const token = text(value)
  const [encodedLocator, secret, extra] = token.split('.')
  if (!encodedLocator || !secret || extra || secret.length < 32) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Invitation not found.',
    })
  }
  try {
    const source = JSON.parse(
      Buffer.from(encodedLocator, 'base64url').toString('utf8')
    ) as Record<string, unknown>
    return {
      token,
      secret,
      locator: {
        appId: requireFirestoreDocumentId(source.appId, 'App id'),
        kitchenId: requireFirestoreDocumentId(source.kitchenId, 'Kitchen id'),
        invitationId: requireFirestoreDocumentId(
          source.invitationId,
          'Invitation id'
        ),
      },
    }
  } catch (error) {
    if ((error as { statusCode?: number }).statusCode) throw error
    throw createError({
      statusCode: 404,
      statusMessage: 'Invitation not found.',
    })
  }
}

function tokenMatches(stored: unknown, secret: string) {
  const expected = Buffer.from(text(stored), 'hex')
  const supplied = Buffer.from(hashSecret(secret), 'hex')
  return (
    expected.length === supplied.length && timingSafeEqual(expected, supplied)
  )
}

function requirePendingInvitation(
  invitation: StoredInvitation,
  secret: string
) {
  if (
    text(invitation.status) !== 'pending' ||
    !tokenMatches(invitation.token_hash, secret)
  ) {
    throw createError({
      statusCode: 410,
      statusMessage: 'This invitation is no longer available.',
    })
  }
  const expiresAt = invitation.expires_at?.toMillis?.() ?? 0
  if (!expiresAt || expiresAt <= Date.now()) {
    throw createError({
      statusCode: 410,
      statusMessage: 'This invitation has expired.',
    })
  }
  return expiresAt
}

function requireRuntimeApp(event: H3Event, appId: string) {
  const configuredAppId = requireFirestoreDocumentId(
    useFireUXConfig(event).appId,
    'Runtime App id'
  )
  if (configuredAppId !== appId) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Invitation not found.',
    })
  }
}

export async function createKitchenMemberInvitation(
  event: H3Event,
  input: { kitchenId: string; memberId: string }
) {
  const kitchenId = requireFirestoreDocumentId(input?.kitchenId, 'Kitchen id')
  const memberId = requireFirestoreDocumentId(input?.memberId, 'Member id')
  const invitationId = randomUUID()
  const secret = randomBytes(32).toString('base64url')
  const actor = await readKitchenMutationActor(event)
  let appId = actor.runtimeAppId
  let memberName = ''

  await runGuardedServerTransaction({ kind: 'runtime' }, async (mutations) => {
    const kitchen = await requireKitchenMutationAuthority(
      mutations,
      actor,
      kitchenId
    )
    appId = kitchen.ownerAppId
    const members = serverKitchenTeamMembersTarget(appId, kitchenId)
    const invitations = serverKitchenMemberInvitationsTarget(appId, kitchenId)
    const member = await mutations.read<Record<string, unknown>>(
      members,
      memberId
    )
    if (!member.exists) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Kitchen member not found.',
      })
    }
    if (text(member.data?.user_id)) {
      throw createError({
        statusCode: 409,
        statusMessage: 'This member is already linked to a User.',
      })
    }
    memberName = text(member.data?.name) || 'Kitchen member'
    const pending = await mutations.query<StoredInvitation>(invitations, {
      field: 'member_id',
      op: '==',
      value: memberId,
      limit: 20,
    })
    for (const existing of pending) {
      if (text(existing.data.status) === 'pending') {
        mutations.update(invitations, existing.id, {
          status: 'replaced',
          updated: serverAuditStamp({ by: actor.uid }),
        })
      }
    }
    mutations.create(invitations, invitationId, {
      member_id: memberId,
      token_hash: hashSecret(secret),
      status: 'pending',
      expires_at: Timestamp.fromMillis(Date.now() + INVITATION_LIFETIME_MS),
      created: serverAuditStamp({ by: actor.uid, appId }),
      updated: serverAuditStamp({ by: actor.uid }),
    })
  })

  const token = encodeToken({ appId, kitchenId, invitationId }, secret)
  return { ok: true as const, memberId, memberName, token, expiresInDays: 7 }
}

export async function inspectKitchenMemberInvitation(
  event: H3Event,
  value: unknown
) {
  const parsed = parseToken(value)
  requireRuntimeApp(event, parsed.locator.appId)
  const db = getRuntimeFirestore()
  const invitationRef = db
    .collection(
      `apps/${parsed.locator.appId}/kitchens/${parsed.locator.kitchenId}/member-invitations`
    )
    .doc(parsed.locator.invitationId)
  const invitationSnapshot = await invitationRef.get()
  if (!invitationSnapshot.exists) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Invitation not found.',
    })
  }
  const invitation = invitationSnapshot.data() as StoredInvitation
  const expiresAt = requirePendingInvitation(invitation, parsed.secret)
  const memberId = requireFirestoreDocumentId(invitation.member_id, 'Member id')
  const memberSnapshot = await db
    .collection(
      `apps/${parsed.locator.appId}/kitchens/${parsed.locator.kitchenId}/team`
    )
    .doc(memberId)
    .get()
  if (!memberSnapshot.exists || text(memberSnapshot.data()?.user_id)) {
    throw createError({
      statusCode: 410,
      statusMessage: 'This invitation is no longer available.',
    })
  }
  return {
    ok: true as const,
    memberName: text(memberSnapshot.data()?.name) || 'Kitchen member',
    expiresAt: new Date(expiresAt).toISOString(),
  }
}

export async function acceptKitchenMemberInvitation(
  event: H3Event,
  value: unknown
) {
  const parsed = parseToken(value)
  requireRuntimeApp(event, parsed.locator.appId)
  const { uid } = await requireFirebaseBearerUser(
    event,
    'Sign in to accept this invitation.'
  )
  let memberName = ''
  let memberSlug = ''

  await runGuardedServerTransaction({ kind: 'runtime' }, async (mutations) => {
    const invitations = serverKitchenMemberInvitationsTarget(
      parsed.locator.appId,
      parsed.locator.kitchenId
    )
    const members = serverKitchenTeamMembersTarget(
      parsed.locator.appId,
      parsed.locator.kitchenId
    )
    const supports = serverAppKitchensTarget(parsed.locator.appId)
    const [invitation, support] = await Promise.all([
      mutations.read<StoredInvitation>(
        invitations,
        parsed.locator.invitationId
      ),
      mutations.read(supports, parsed.locator.kitchenId),
    ])
    if (!invitation.exists || !support.exists) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Invitation not found.',
      })
    }
    requirePendingInvitation(invitation.data || {}, parsed.secret)
    const memberId = requireFirestoreDocumentId(
      invitation.data?.member_id,
      'Member id'
    )
    const [member, linkedMembers] = await Promise.all([
      mutations.read<Record<string, unknown>>(members, memberId),
      mutations.query<Record<string, unknown>>(members, {
        field: 'user_id',
        op: '==',
        value: uid,
        limit: 2,
      }),
    ])
    if (!member.exists) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Kitchen member not found.',
      })
    }
    const linkedUserId = text(member.data?.user_id)
    if (linkedUserId && linkedUserId !== uid) {
      throw createError({
        statusCode: 409,
        statusMessage: 'This member is linked to another User.',
      })
    }
    if (linkedMembers.some((candidate) => candidate.id !== memberId)) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Your User is already linked to this Kitchen.',
      })
    }
    memberName = text(member.data?.name) || 'Kitchen member'
    memberSlug = text(member.data?.slug) || memberName
    mutations.update(members, memberId, {
      user_id: uid,
      updated: serverAuditStamp({ by: uid }),
    })
    mutations.update(invitations, parsed.locator.invitationId, {
      status: 'accepted',
      accepted_by: uid,
      accepted_at: FieldValue.serverTimestamp(),
      updated: serverAuditStamp({ by: uid }),
    })
    mutations.update(supports, parsed.locator.kitchenId, {
      team_ids: FieldValue.arrayUnion(uid),
      updated: serverAuditStamp({ by: uid }),
    })
  })

  return { ok: true as const, memberName, memberSlug }
}
