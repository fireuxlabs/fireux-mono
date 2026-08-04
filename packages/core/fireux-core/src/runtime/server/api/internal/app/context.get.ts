import {
  createError,
  defineEventHandler,
  setResponseHeaders,
  type H3Event,
} from 'h3'
import { useFireUXConfig } from '../../../../composables/fireux/app/FireUXConfig'
import { AppStorage } from '../../../../models/core/app.model'
import { resolveAppUserAccess } from '../../../../models/utils/app-user-access'
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

function stringList(
  value: unknown,
  label: string,
  options: {
    max: number
    allowed?: ReadonlySet<string>
    documentIds?: boolean
  }
): string[] {
  if (
    !Array.isArray(value) ||
    value.length > options.max ||
    value.some(entry => typeof entry !== 'string')
  ) {
    conflict(`${label} is malformed.`)
  }
  const entries = value.map(entry => entry.trim())
  if (
    entries.some(
      (entry, index) =>
        !entry ||
        entry !== value[index] ||
        (options.documentIds && entry.includes('/')) ||
        (options.allowed && !options.allowed.has(entry))
    ) ||
    new Set(entries).size !== entries.length
  ) {
    conflict(`${label} is malformed.`)
  }
  return entries
}

function membershipDto(
  id: string,
  value: Record<string, unknown>,
  isConfiguredDeveloper: boolean
): CurrentAppMembershipDto {
  const role = value.role
  if (role !== 'admin' && role !== 'user') {
    conflict('Current App membership has an invalid role.')
  }
  if (
    typeof value.is_premium !== 'boolean' ||
    typeof value.console_enabled !== 'boolean'
  ) {
    conflict('Current App membership has invalid capability fields.')
  }
  const onboardingStatus =
    value.onboarding_status === undefined
      ? 'pending'
      : value.onboarding_status
  if (
    onboardingStatus !== 'pending' &&
    onboardingStatus !== 'completed' &&
    onboardingStatus !== 'skipped'
  ) {
    conflict('Current App membership has an invalid onboarding status.')
  }
  const access = resolveAppUserAccess({
    membership: value,
    isConfiguredDeveloper,
  })

  return {
    id,
    role,
    is_premium: value.is_premium,
    access_tier: access.tier ?? 'free',
    has_premium_access: access.hasPremiumAccess,
    console_enabled: value.console_enabled,
    onboarding_status: onboardingStatus,
    profiles: stringList(value.profiles ?? [], 'Current App profiles', {
      max: 20,
      allowed: new Set([
        'agent',
        'chef',
        'customer',
        'driver',
        'professional',
      ]),
    }),
  }
}

export default defineEventHandler(async (event: H3Event) => {
  const { uid } = await requireFirebaseBearerUser(event)
  const { appId, developerId } = useFireUXConfig()
  const appRef = getRuntimeFirestore()
    .collection(AppStorage.collection)
    .doc(appId)
  const membershipRef = appRef
    .collection(AppUserStorage.collection)
    .doc(uid)
  const [appSnapshot, membershipSnapshot] = await getRuntimeFirestore().getAll(
    appRef,
    membershipRef
  )

  const app = appSnapshot.exists
    ? projectPublicApp(
        (appSnapshot.data() || {}) as Record<string, unknown>,
        { id: appSnapshot.id }
      )
    : null
  if (appSnapshot.exists && !app) {
    conflict('Current App has an invalid canonical shape.')
  }

  const membership = membershipSnapshot.exists
    ? membershipDto(
        membershipSnapshot.id,
        (membershipSnapshot.data() || {}) as Record<string, unknown>,
        Boolean(developerId) && uid === developerId
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
