import {
  createError,
  defineEventHandler,
  setResponseHeaders,
  type H3Event,
} from 'h3'
import { useFireUXConfig } from '../../../../composables/fireux/app/FireUXConfig'
import { AppStorage } from '../../../../models/core/app.model'
import { resolveAppUserAccess } from '../../../../utils/app-user-access.ts'
import { AppUserStorage } from '../../../../models/core/user.model'
import { requireFirebaseBearerUser } from '../../../utils/auth/bearer'
import { getRuntimeFirestore } from '../../../utils/getRuntimeFirestore'
import { projectPublicApp } from '../../../utils/public-projection/public-app.dto'
import type {
  CurrentAppContextResponse,
  CurrentAppMembershipDto,
} from '../../../utils/public-projection/public-dto.types'

function conflict(message: string): never {
  throw createError({ statusCode: 409, statusMessage: message })
}

function membershipDto(
  id: string,
  value: Record<string, unknown>,
  isConfiguredDeveloper: boolean,
  profiles: string[]
): CurrentAppMembershipDto {
  const role = value.role === 'admin' || value.role === 'user' ? value.role : 'user'
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
    value.onboarding_status === 'completed' || value.onboarding_status === 'skipped'
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
    console_enabled: access.hasAdminAuthority || isConfiguredDeveloper,
    onboarding_status: onboardingStatus,
    profiles,
  }
}

export default defineEventHandler(async (event: H3Event) => {
  const { uid } = await requireFirebaseBearerUser(event)
  const { appId, developerId, profiles: configuredProfiles } = useFireUXConfig(event)
  const appRef = getRuntimeFirestore()
    .collection(AppStorage.collection)
    .doc(appId)
  const membershipRef = appRef.collection(AppUserStorage.collection).doc(uid)
  const profileIds = configuredProfiles.filter((profile) =>
    ['agent', 'chef', 'customer', 'driver', 'professional'].includes(profile)
  )
  const profileRefs = profileIds.map((profile) =>
    appRef.collection(`${profile}s`).doc(uid)
  )
  const [appSnapshot, membershipSnapshot, ...profileSnapshots] =
    await getRuntimeFirestore().getAll(
    appRef,
    membershipRef,
    ...profileRefs
  )
  const activeProfiles = profileIds.filter(
    (_profile, index) => profileSnapshots[index]?.exists
  )

  const appData = (appSnapshot.data() || {}) as Record<string, unknown>
  const projectedApp = appSnapshot.exists
    ? projectPublicApp(appData, { id: appSnapshot.id })
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

  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'private, no-store',
  })

  const response: CurrentAppContextResponse = {
    ok: true,
    appId,
    app,
    membership,
  }
  return response
})
