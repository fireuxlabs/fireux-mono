import type { H3Event } from 'h3'
import { requireFirebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import { resolveWorkspaceEntityOnboardingPolicy } from 'fireux-core/runtime/server/utils/workspace-entity/onboarding-authority'
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
  role: MemberRole
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
  options: { allowAnonymous?: boolean; allowMissingMembership?: boolean } = {}
): Promise<KitchenOnboardingActor> {
  const { uid, decoded } = await requireFirebaseBearerUser(
    event,
    'A Firebase identity is required.',
    { allowAnonymous: options.allowAnonymous }
  )
  const policy = runtimePolicy(event)
  const db = getRuntimeFirestore()
  const membershipRef = db.doc(`apps/${policy.appId}/${'users'}/${uid}`)
  const membership = await membershipRef.get()
  const role =
    options.allowMissingMembership && !membership.exists
      ? 'user'
      : memberRole(membership.exists, membership.get('role'))
  return {
    ...policy,
    uid,
    authDisplayName: text(decoded.name),
    db,
    membershipRef,
    role,
  }
}
