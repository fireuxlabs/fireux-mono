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
const primary = (value: unknown, available: string[]) => {
  const stored = text(value)
  if (available.includes(stored)) return stored
  return available.length === 1 ? available[0]! : ''
}

function relationship(
  membershipId: string,
  value: Record<string, unknown>,
  idsField: string,
  primaryField: string
) {
  const hasIds = Object.hasOwn(value, idsField)
  const hasPrimary = Object.hasOwn(value, primaryField)
  if (hasIds !== hasPrimary) {
    conflict(
      `App membership ${membershipId} has an incomplete ${idsField} relationship.`
    )
  }
  if (!hasIds) return { ids: [], primary: '' }

  const storedIds = value[idsField]
  if (
    !Array.isArray(storedIds) ||
    storedIds.length > 500 ||
    storedIds.some(
      (entry) =>
        typeof entry !== 'string' ||
        entry !== entry.trim() ||
        !entry ||
        entry.includes('/')
    ) ||
    new Set(storedIds).size !== storedIds.length
  ) {
    conflict(
      `App membership ${membershipId} has an invalid ${idsField} relationship.`
    )
  }

  const storedPrimary = value[primaryField]
  if (
    typeof storedPrimary !== 'string' ||
    storedPrimary !== storedPrimary.trim() ||
    storedPrimary.includes('/') ||
    (storedPrimary !== '' && !storedIds.includes(storedPrimary))
  ) {
    conflict(
      `App membership ${membershipId} has an invalid ${primaryField} relationship.`
    )
  }
  return { ids: storedIds, primary: primary(storedPrimary, storedIds) }
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
  const kitchens = relationship(id, value, 'kitchens', 'primary_kitchen')
  const projects = relationship(id, value, 'projects', 'primary_project')
  const properties = relationship(id, value, 'properties', 'primary_property')
  const portfolios = relationship(id, value, 'portfolios', 'primary_portfolio')
  const suppliers = relationship(id, value, 'suppliers', 'primary_supplier')
  const blanks = relationship(id, value, 'blanks', 'primary_blank')
  return {
    id,
    role,
    subscription,
    onboarding_status: onboardingStatus,
    profiles,
    kitchens: kitchens.ids,
    primary_kitchen: kitchens.primary,
    projects: projects.ids,
    primary_project: projects.primary,
    properties: properties.ids,
    primary_property: properties.primary,
    portfolios: portfolios.ids,
    primary_portfolio: portfolios.primary,
    suppliers: suppliers.ids,
    primary_supplier: suppliers.primary,
    blanks: blanks.ids,
    primary_blank: blanks.primary,
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
