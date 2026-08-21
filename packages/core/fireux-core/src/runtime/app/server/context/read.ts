import { createError, type H3Event } from 'h3'
import { useFireUXConfig } from '../../composables/config/FireUXConfig'
import { resolveAppUserAccess } from '../../utils/app-user-access.ts'
import { requireFirebaseBearerUser } from '../../../server/utils/auth/bearer'
import {
  getRuntimeFirestore,
  getRuntimeIdentityFirestore,
} from '../../../server/utils/getRuntimeFirestore'
import { projectAppDetail } from '../index/projection.ts'
import type {
  CurrentAppContextResponse,
  CurrentAppMembership,
} from '../../models/app-context.model.ts'

function conflict(message: string): never {
  throw createError({ statusCode: 409, statusMessage: message })
}

function membershipDto(
  id: string,
  value: Record<string, unknown>,
  isConfiguredDeveloper: boolean,
  profiles: string[]
): CurrentAppMembership {
  const role =
    value.role === 'admin' || value.role === 'user' ? value.role : 'user'
  if (value.role !== 'admin' && value.role !== 'user') {
    console.warn('[app/context] coalescing legacy membership role', {
      appId: value.app_id,
      userId: id,
    })
  }
  const isPremium = value.is_premium === true
  if (typeof value.is_premium !== 'boolean') {
    console.warn('[app/context] coalescing legacy premium flag', {
      appId: value.app_id,
      userId: id,
    })
  }
  const onboardingStatus =
    value.onboarding_status === 'completed' ||
    value.onboarding_status === 'skipped'
      ? value.onboarding_status
      : 'pending'
  if (
    value.onboarding_status !== undefined &&
    value.onboarding_status !== 'pending' &&
    value.onboarding_status !== 'completed' &&
    value.onboarding_status !== 'skipped'
  ) {
    console.warn('[app/context] coalescing legacy onboarding status', {
      appId: value.app_id,
      userId: id,
      value: value.onboarding_status,
    })
  }
  const normalizedMembership = {
    ...value,
    role,
    is_premium: isPremium,
    onboarding_status: onboardingStatus,
  }
  const access = resolveAppUserAccess({
    membership: normalizedMembership,
    isConfiguredDeveloper,
  })

  return {
    id,
    role,
    is_premium: isPremium,
    access_tier: access.tier ?? 'free',
    has_premium_access: access.hasPremiumAccess,
    workspace_enabled: access.hasAdminAuthority || isConfiguredDeveloper,
    onboarding_status: onboardingStatus,
    profiles,
  }
}

export async function readCurrentAppContext(event: H3Event) {
  const { uid } = await requireFirebaseBearerUser(event)
  const {
    appId,
    developerId,
    profiles: configuredProfiles,
  } = useFireUXConfig(event)
  const runtimeDb = getRuntimeFirestore()
  const identityDb = getRuntimeIdentityFirestore()
  const appRef = runtimeDb.collection('apps').doc(appId)
  const membershipRef = appRef.collection('users').doc(uid)
  const profileIds = configuredProfiles.filter((profile) =>
    [
      'agent',
      'chef',
      'customer',
      'driver',
      'marketplace',
      'professional',
    ].includes(profile)
  )
  const profileRefs = profileIds.map((profile) =>
    identityDb.doc(`users/${uid}/profiles/${profile}`)
  )
  const [[appSnapshot, membershipSnapshot], profileSnapshots] =
    await Promise.all([
      runtimeDb.getAll(appRef, membershipRef),
      profileRefs.length
        ? identityDb.getAll(...profileRefs)
        : Promise.resolve([]),
    ])
  const activeProfiles = profileIds.filter(
    (_profile, index) => profileSnapshots[index]?.exists
  )

  const appData = (appSnapshot.data() || {}) as Record<string, unknown>
  const projectedApp = appSnapshot.exists
    ? projectAppDetail(appData, { id: appSnapshot.id })
    : null
  if (appSnapshot.exists && !projectedApp) {
    conflict('Current App has an invalid canonical shape.')
  }
  const app = projectedApp
    ? {
        ...projectedApp,
        self_join_enabled: appData.self_join_enabled === true,
      }
    : null

  const membership = membershipSnapshot.exists
    ? membershipDto(
        membershipSnapshot.id,
        (membershipSnapshot.data() || {}) as Record<string, unknown>,
        Boolean(developerId) && uid === developerId,
        activeProfiles
      )
    : null

  const response: CurrentAppContextResponse = {
    ok: true,
    appId,
    app,
    membership,
  }
  return response
}
