import { createError, type H3Event } from 'h3'
import { useFireUXConfig } from '../../composables/config/FireUXConfig'
import { requireFirebaseBearerUser } from '../../../server/utils/auth/bearer'
import {
  getRuntimeFirestore,
  getRuntimeIdentityFirestore,
} from '../../../server/utils/getRuntimeFirestore'
import { readAppDocument } from '../../utils/readApp.ts'
import type {
  CurrentAppContextResponse,
  CurrentAppMembership,
} from '../../models/app-context.model.ts'
import { isAppUserSubscription } from '../../models/app-user.model.ts'

function conflict(message: string): never {
  throw createError({ statusCode: 409, statusMessage: message })
}

const text = (value: unknown) => String(value ?? '').trim()
const ids = (value: unknown) =>
  Array.isArray(value) ? [...new Set(value.map(text).filter(Boolean))] : []
const primary = (value: unknown, available: string[]) => {
  const stored = text(value)
  if (available.includes(stored)) return stored
  return available.length === 1 ? available[0]! : ''
}

function membershipDto(
  id: string,
  value: Record<string, unknown>,
  profiles: string[]
): CurrentAppMembership {
  if (value.role !== 'admin' && value.role !== 'user' && value.role !== 'dev') {
    conflict(`App membership ${id} has an invalid role.`)
  }
  if (!isAppUserSubscription(value.subscription)) {
    conflict(`App membership ${id} has an invalid subscription.`)
  }
  if (
    value.onboarding_status !== 'pending' &&
    value.onboarding_status !== 'completed' &&
    value.onboarding_status !== 'skipped'
  ) {
    conflict(`App membership ${id} has an invalid onboarding status.`)
  }
  const role = value.role
  const subscription = value.subscription
  const onboardingStatus = value.onboarding_status
  const kitchens = ids(value.kitchens)
  const projects = ids(value.projects)
  const properties = ids(value.properties)
  const portfolios = ids(value.portfolios)
  const suppliers = ids(value.suppliers)
  const blanks = ids(value.blanks)
  return {
    id,
    role,
    subscription,
    onboarding_status: onboardingStatus,
    profiles,
    kitchens,
    primary_kitchen: primary(value.primary_kitchen, kitchens),
    projects,
    primary_project: primary(value.primary_project, projects),
    properties,
    primary_property: primary(value.primary_property, properties),
    portfolios,
    primary_portfolio: primary(value.primary_portfolio, portfolios),
    suppliers,
    primary_supplier: primary(value.primary_supplier, suppliers),
    blanks,
    primary_blank: primary(value.primary_blank, blanks),
  }
}

export async function readCurrentAppContext(event: H3Event) {
  const { uid } = await requireFirebaseBearerUser(
    event,
    'Firebase identity required.',
    { allowAnonymous: true }
  )
  const { appId, profiles: configuredProfiles } = useFireUXConfig(event)
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

  const app = appSnapshot.exists
    ? readAppDocument(appSnapshot.data(), appSnapshot.id)
    : null
  if (appSnapshot.exists && !app) {
    conflict('Current App has an invalid canonical shape.')
  }

  const membership = membershipSnapshot.exists
    ? membershipDto(
        membershipSnapshot.id,
        (membershipSnapshot.data() || {}) as Record<string, unknown>,
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
