import {
  createHash,
  randomBytes,
  randomUUID,
  timingSafeEqual,
} from 'node:crypto'
import { FieldValue, Timestamp } from 'firebase-admin/firestore'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { requireFirebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer'
import {
  runGuardedServerTransaction,
  type GuardedServerTransaction,
} from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import { serverKitchenTeamMembersTarget } from '../mutation-targets'
import { createError, type H3Event } from 'h3'
import {
  readKitchenMutationActor,
  requireKitchenMutationAuthority,
} from '../core/mutation-authority.ts'
import { serverKitchenMemberInvitationsTarget } from './mutation-targets.ts'
import {
  readKitchenMemberInvitationHistory,
  type StoredInvitation,
} from './invitation-history.ts'

const INVITATION_LIFETIME_MS = 7 * 24 * 60 * 60 * 1_000

type InvitationLocator = {
  appId: string
  kitchenId: string
  invitationId: string
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

async function readIssuedInvitation(
  tx: GuardedServerTransaction,
  parsed: ReturnType<typeof parseToken>,
  acceptingUid?: string
) {
  const { appId, kitchenId, invitationId } = parsed.locator
  const invitations = serverKitchenMemberInvitationsTarget(kitchenId)
  const { data } = await tx.read<StoredInvitation>(invitations, invitationId)
  if (!data || data.created?.app_id !== appId) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Invitation not found.',
    })
  }
  const alreadyAccepted =
    data.status === 'accepted' &&
    !!acceptingUid &&
    data.accepted_by === acceptingUid
  if (
    !tokenMatches(data.token_hash, parsed.secret) ||
    (data.status !== 'pending' && !alreadyAccepted)
  ) {
    throw createError({
      statusCode: 410,
      statusMessage: 'This invitation is no longer available.',
    })
  }
  const expiresAt = data.expires_at?.toMillis?.() ?? 0
  if (!expiresAt || expiresAt <= Date.now()) {
    throw createError({
      statusCode: 410,
      statusMessage: 'This invitation has expired.',
    })
  }
  const memberId = requireFirestoreDocumentId(data.member_id, 'Member id')
  // Older issuers could leave multiple tokens pending for the same person.
  const { latestId } = await readKitchenMemberInvitationHistory(
    tx,
    invitations,
    memberId
  )
  if (latestId !== invitationId) {
    throw createError({
      statusCode: 410,
      statusMessage: 'This invitation has been replaced.',
    })
  }
  return { memberId, expiresAt, alreadyAccepted }
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
    const members = serverKitchenTeamMembersTarget(kitchenId)
    const invitations = serverKitchenMemberInvitationsTarget(kitchenId)
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
    const { pendingIds } = await readKitchenMemberInvitationHistory(
      mutations,
      invitations,
      memberId
    )
    for (const id of pendingIds) {
      mutations.update(invitations, id, {
        status: 'replaced',
        updated: serverAuditStamp({ by: actor.uid }),
      })
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
  return runGuardedServerTransaction({ kind: 'runtime' }, async (tx) => {
    const { memberId, expiresAt } = await readIssuedInvitation(tx, parsed)
    const member = await tx.read(
      serverKitchenTeamMembersTarget(parsed.locator.kitchenId),
      memberId
    )
    if (!member.exists || text(member.data?.user_id)) {
      throw createError({
        statusCode: 410,
        statusMessage: 'This invitation is no longer available.',
      })
    }
    return {
      ok: true as const,
      memberName: text(member.data?.name) || 'Kitchen member',
      expiresAt: new Date(expiresAt).toISOString(),
    }
  })
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
  return runGuardedServerTransaction({ kind: 'runtime' }, async (mutations) => {
    const invitations = serverKitchenMemberInvitationsTarget(
      parsed.locator.kitchenId
    )
    const members = serverKitchenTeamMembersTarget(parsed.locator.kitchenId)
    const { memberId, alreadyAccepted } = await readIssuedInvitation(
      mutations,
      parsed,
      uid
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
    const result = {
      ok: true as const,
      kitchenId: parsed.locator.kitchenId,
      memberId,
      memberName: text(member.data?.name) || 'Kitchen member',
    }
    if (alreadyAccepted) {
      if (linkedUserId !== uid)
        throw createError({
          statusCode: 410,
          statusMessage: 'This invitation is no longer available.',
        })
      return result
    }
    mutations.update(members, memberId, {
      user_id: uid,
    })
    mutations.update(invitations, parsed.locator.invitationId, {
      status: 'accepted',
      accepted_by: uid,
      accepted_at: FieldValue.serverTimestamp(),
      updated: serverAuditStamp({ by: uid }),
    })
    return result
  })
}
