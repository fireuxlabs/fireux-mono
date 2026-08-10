import type { Firestore } from 'firebase-admin/firestore'
import { createError, type H3Event } from 'h3'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { AppUserStorage } from 'fireux-core/runtime/models/core/user.model'
import { requireFirebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { resolveFireuxAppScopeStateForRole } from 'fireux-core/runtime/utils/app-scope-state'
import { resolveConsoleCanCreate } from 'fireux-core/runtime/utils/console-policy'
import {
  requireOnboardingMemberRole,
  type KitchenOnboardingMemberRole,
} from './onboarding-policy'

export type KitchenOnboardingActor = {
  appId: string
  appRole: string
  appScopeState: 'parent_app' | 'tenant_app'
  canCreate: boolean
  uid: string
  db: Firestore
  membershipRef: ReturnType<Firestore['doc']>
  role: KitchenOnboardingMemberRole
}

export async function resolveKitchenOnboardingActor(
  event: H3Event
): Promise<KitchenOnboardingActor> {
  const fireux = useFireUXConfig(event)
  const appId = requireFirestoreDocumentId(fireux.appId, 'Runtime App id')
  const appRole = fireux.role
  const appScopeState = resolveFireuxAppScopeStateForRole(appRole)
  if (!appScopeState) {
    throw createError({
      statusCode: 403,
      statusMessage: 'This App cannot own a Kitchen console.',
    })
  }
  const canCreate = resolveConsoleCanCreate(
    appRole,
    fireux.consoleConfig,
    'kitchen'
  )
  const { uid } = await requireFirebaseBearerUser(event)
  const db = getRuntimeFirestore()
  const membershipRef = db.doc(
    `apps/${appId}/${AppUserStorage.collection}/${uid}`
  )
  const membership = await membershipRef.get()
  const role = requireOnboardingMemberRole(
    membership.exists,
    membership.get('role')
  )
  return {
    appId,
    appRole,
    appScopeState,
    canCreate,
    uid,
    db,
    membershipRef,
    role,
  }
}
