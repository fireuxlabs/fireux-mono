import { createError, type H3Event } from 'h3'
import { requireFirebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { resolveWorkspaceEntityOnboardingPolicy } from 'fireux-core/runtime/workspace/server/entity/onboarding-authority'
import {
  onboardingText as text,
  requireOnboardingMemberRole as memberRole,
  type KitchenOnboardingMemberRole as MemberRole,
} from './onboarding-policy'

export type KitchenOnboardingFirestore = ReturnType<typeof getRuntimeFirestore>

type RuntimePolicy = {
  appId: string
  canCreate: boolean
}

export type KitchenOnboardingActor = RuntimePolicy & {
  uid: string
  authDisplayName: string
  db: KitchenOnboardingFirestore
  membershipRef: ReturnType<KitchenOnboardingFirestore['doc']>
  role: MemberRole | null
}

export function parseKitchenOnboardingBeneficiaryUserId(
  current: Pick<KitchenOnboardingActor, 'uid'>,
  value: unknown
) {
  const requested = text(value)
  if (!requested) return current.uid
  return requireFirestoreDocumentId(requested, 'Owner User id')
}

export function assertKitchenOnboardingBeneficiaryAuthority(
  current: Pick<KitchenOnboardingActor, 'uid'>,
  userId: string,
  role: MemberRole | null
) {
  if (userId !== current.uid && role !== 'admin' && role !== 'dev') {
    throw createError({
      statusCode: 403,
      statusMessage:
        'App admin access is required to provision for another User.',
    })
  }
}

export function resolveKitchenOnboardingBeneficiaryUserId(
  current: KitchenOnboardingActor,
  value: unknown
) {
  const userId = parseKitchenOnboardingBeneficiaryUserId(current, value)
  assertKitchenOnboardingBeneficiaryAuthority(current, userId, current.role)
  return userId
}

function runtimePolicy(event: H3Event): RuntimePolicy {
  const policy = resolveWorkspaceEntityOnboardingPolicy(event, 'kitchen')
  return {
    appId: policy.appId,
    canCreate: policy.canCreate,
  }
}

export async function readKitchenOnboardingActor(
  event: H3Event,
  options: {
    allowAnonymous?: boolean
    allowMissingMembership?: boolean
    deferMembership?: boolean
  } = {}
): Promise<KitchenOnboardingActor> {
  const { uid, decoded } = await requireFirebaseBearerUser(
    event,
    'A Firebase identity is required.',
    { allowAnonymous: options.allowAnonymous }
  )
  const policy = runtimePolicy(event)
  const db = getRuntimeFirestore()
  const membershipRef = db.doc(`apps/${policy.appId}/${'users'}/${uid}`)
  const membership = options.deferMembership ? null : await membershipRef.get()
  const role = membership
    ? options.allowMissingMembership && !membership.exists
      ? 'user'
      : memberRole(membership.exists, membership.get('role'))
    : null
  return {
    ...policy,
    uid,
    authDisplayName: text(decoded.name),
    db,
    membershipRef,
    role,
  }
}
