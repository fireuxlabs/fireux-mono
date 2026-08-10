// Concurrent edit — 2026-07-20 11:52 CEST — Security spine: expose runtime-scoped membership mutations behind verified Firebase Auth.

import { useRuntimeConfig } from '#imports'
import { createError, defineEventHandler, readBody } from 'h3'
import type { AppMembershipMutationInput } from '../../../../models/operations/app-membership'
import { requireFirebaseBearerUser } from '../../../utils/auth/bearer'
import { mutateRuntimeAppMembership } from '../../../utils/app-membership/mutate'

export default defineEventHandler(async (event) => {
  const { uid } = await requireFirebaseBearerUser(event)
  const runtime = useRuntimeConfig()
  const fireux = runtime.public?.fireux as Record<string, unknown> | undefined
  const firebase = runtime.public?.firebaseEcosystem?.firebase as
    | Record<string, unknown>
    | undefined
  const appId = String(fireux?.id || '').trim()
  const appDatabaseId = String(firebase?.databaseId || '').trim()
  const identityDatabaseId = String(
    firebase?.identityDatabaseId || appDatabaseId
  ).trim()
  const developerUid = String(fireux?.developerId || '').trim()
  const consoles = Array.isArray(fireux?.consoles)
    ? fireux.consoles.map(value => String(value || '').trim()).filter(Boolean)
    : []
  const consoleRegistry = Array.isArray(fireux?.consoleRegistry)
    ? fireux.consoleRegistry
    : []
  const authorityCollections = consoleRegistry.flatMap((value: unknown) => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return []
    const registration = value as Record<string, unknown>
    const family = String(registration.family || '').trim()
    const collection = String(registration.appSupportCollection || '').trim()
    return family && consoles.includes(family) && collection ? [collection] : []
  })
  const membershipCleanupRegistry = Array.isArray(
    fireux?.membershipCleanupRegistry
  )
    ? fireux.membershipCleanupRegistry.flatMap((value: unknown) => {
        if (!value || typeof value !== 'object' || Array.isArray(value)) return []
        const registration = value as Record<string, unknown>
        const collection = String(registration.collection || '').trim()
        if (!collection) return []
        const strings = (candidate: unknown) =>
          Array.isArray(candidate)
            ? candidate.map(item => String(item || '').trim()).filter(Boolean)
            : []
        return [{
          collection,
          clearArrayFields: strings(registration.clearArrayFields),
          deactivateArrayObjectFields: strings(
            registration.deactivateArrayObjectFields
          ),
        }]
      })
    : []
  const body = await readBody(event)

  if (!appId) {
    throw createError({
      statusCode: 500,
      statusMessage: 'The runtime App identity is not configured.',
    })
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'A membership action is required.',
    })
  }

  return mutateRuntimeAppMembership({
    actorUid: uid,
    appId,
    developerUid,
    appDatabaseId,
    identityDatabaseId,
    authorityCollections,
    membershipCleanupRegistry,
    input: body as AppMembershipMutationInput,
  })
})
