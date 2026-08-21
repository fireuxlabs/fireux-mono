import type { H3Event } from 'h3'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import type { FireuxEntityManagement } from 'fireux-core/runtime/models/utils/scope.model'
import { requireFirebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import { readAppPalette } from 'fireux-core/runtime/utils/brand-palette'
import { resolveWorkspaceEntityOnboardingPolicy } from 'fireux-core/runtime/server/utils/workspace-entity/onboarding-authority'
import {
  onboardingText as text,
  requireOnboardingMemberRole as memberRole,
  type KitchenOnboardingMemberRole as MemberRole,
} from './onboarding-policy'

export type KitchenOnboardingFirestore = ReturnType<typeof getRuntimeFirestore>

type RuntimePolicy = {
  appId: string
  appRole: string
  ecosystem: string
  management: Exclude<FireuxEntityManagement, { mode: 'root' }>
  canCreate: boolean
  configuredAppPalette: ReturnType<typeof readAppPalette>
}

export type KitchenOnboardingActor = RuntimePolicy & {
  uid: string
  authDisplayName: string
  db: KitchenOnboardingFirestore
  membershipRef: ReturnType<KitchenOnboardingFirestore['doc']>
  role: MemberRole
}

function runtimePolicy(event: H3Event): RuntimePolicy {
  const fireux = useFireUXConfig(event)
  return {
    ...resolveWorkspaceEntityOnboardingPolicy(event, 'kitchen'),
    configuredAppPalette: readAppPalette(fireux.theme?.palette),
  }
}

export async function readKitchenOnboardingActor(
  event: H3Event
): Promise<KitchenOnboardingActor> {
  const { uid, decoded } = await requireFirebaseBearerUser(event)
  const policy = runtimePolicy(event)
  const db = getRuntimeFirestore()
  const membershipRef = db.doc(
    `apps/${policy.appId}/${'users'}/${uid}`
  )
  const membership = await membershipRef.get()
  const role = memberRole(membership.exists, membership.get('role'))
  return {
    ...policy,
    uid,
    authDisplayName: text(decoded.name),
    db,
    membershipRef,
    role,
  }
}
