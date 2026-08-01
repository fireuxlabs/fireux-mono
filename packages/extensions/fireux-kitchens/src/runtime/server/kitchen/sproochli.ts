import { useRuntimeConfig } from '#imports'
import { FieldValue } from 'firebase-admin/firestore'
import { createError, type H3Event } from 'h3'
import { requireFirebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer.ts'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path.ts'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps.ts'
import {
  readSproochliAttachmentConfig,
  type SproochliDefaultLanguage,
} from 'fireux-sproochli/runtime/sproochli.ts'
import { KitchenStorage } from '../../models/kitchen.model.ts'
import {
  readKitchenOnboardingScope,
  readKitchenOnboardingSupport,
} from './onboarding-policy.ts'
import { resolveKitchenConsoleTargetIds } from './console-targets.ts'

const allowedDefaultLanguages = [
  'mixed',
  'en',
  'de',
] as const satisfies readonly SproochliDefaultLanguage[]
const allowedDefaultLanguageSet = new Set<SproochliDefaultLanguage>(
  allowedDefaultLanguages
)
type AllowedDefaultLanguage = typeof allowedDefaultLanguages[number]

function badRequest(statusMessage: string): never {
  throw createError({ statusCode: 400, statusMessage })
}

function request(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    badRequest('Kitchen Sproochli request must be an object.')
  }
  const source = value as Record<string, unknown>
  const allowed = new Set(['kitchen_id', 'enabled', 'default_language'])
  const unsupported = Object.keys(source).find(key => !allowed.has(key))
  if (unsupported) {
    badRequest(`Kitchen Sproochli contains unsupported field: ${unsupported}.`)
  }
  if (typeof source.enabled !== 'boolean') {
    badRequest('Kitchen Sproochli enabled must be a boolean.')
  }

  const defaultLanguage = String(source.default_language ?? '')
    .trim()
    .toLowerCase() as SproochliDefaultLanguage
  if (
    source.enabled &&
    !allowedDefaultLanguageSet.has(defaultLanguage)
  ) {
    badRequest('Kitchen Sproochli default language must be mixed, en, or de.')
  }

  return {
    kitchenId: requireFirestoreDocumentId(source.kitchen_id, 'Kitchen id'),
    enabled: source.enabled,
    defaultLanguage: source.enabled
      ? defaultLanguage as AllowedDefaultLanguage
      : undefined,
  }
}

function memberRole(
  exists: boolean,
  value: unknown,
  statusMessage: string
): 'admin' | 'user' {
  const role = String(value ?? '').trim()
  if (!exists || (role !== 'admin' && role !== 'user')) {
    throw createError({ statusCode: 403, statusMessage })
  }
  return role
}

export async function updateKitchenSproochli(
  event: H3Event,
  input: unknown
) {
  const requested = request(input)
  const runtimeAppId = requireFirestoreDocumentId(
    useRuntimeConfig(event).public?.fireux?.id,
    'Runtime App id'
  )
  const { uid } = await requireFirebaseBearerUser(
    event,
    'Sign in to manage this Kitchen.'
  )
  const db = getRuntimeFirestore()
  const rootRef = db.collection(KitchenStorage.rootCollection)
    .doc(requested.kitchenId)
  const runtimeMembershipRef = db.doc(`apps/${runtimeAppId}/users/${uid}`)

  const result = await db.runTransaction(async transaction => {
    const [root, runtimeMembership] = await Promise.all([
      transaction.get(rootRef),
      transaction.get(runtimeMembershipRef),
    ])
    if (!root.exists) {
      throw createError({ statusCode: 404, statusMessage: 'Kitchen not found.' })
    }
    memberRole(
      runtimeMembership.exists,
      runtimeMembership.get('role'),
      'Current App membership is required to manage this Kitchen.'
    )
    const runtimeTargetIds = resolveKitchenConsoleTargetIds(
      event,
      runtimeMembership.data() || {}
    )
    if (!runtimeTargetIds.includes(requested.kitchenId)) {
      throw createError({
        statusCode: 403,
        statusMessage: 'This Kitchen is not an available Console target.',
      })
    }

    const scope = readKitchenOnboardingScope(root.data() || {})
    if (scope.state !== 'parent_app' && scope.state !== 'tenant_app') {
      throw createError({
        statusCode: 409,
        statusMessage: 'The Kitchen is not attached to an App.',
      })
    }
    const ownerAppId = requireFirestoreDocumentId(
      scope.appId,
      'Kitchen owner App id'
    )
    const ownerMembershipRef = db.doc(`apps/${ownerAppId}/users/${uid}`)
    const supportRef = db.doc(
      `apps/${ownerAppId}/${KitchenStorage.scopeCollection}/${requested.kitchenId}`
    )
    const [ownerMembership, support] = await Promise.all([
      ownerMembershipRef.path === runtimeMembershipRef.path
        ? Promise.resolve(runtimeMembership)
        : transaction.get(ownerMembershipRef),
      transaction.get(supportRef),
    ])
    const ownerRole = memberRole(
      ownerMembership.exists,
      ownerMembership.get('role'),
      'Kitchen owner App membership is required.'
    )
    if (!support.exists) {
      throw createError({ statusCode: 404, statusMessage: 'Kitchen not found.' })
    }
    const authority = readKitchenOnboardingSupport(support.data() || {})
    if (
      !authority ||
      (ownerRole !== 'admin' && !authority.operatorIds.includes(uid))
    ) {
      throw createError({
        statusCode: 403,
        statusMessage: 'App admin or Kitchen operator access is required.',
      })
    }

    const current = readSproochliAttachmentConfig(root.get('sproochli'))
    const sproochli = readSproochliAttachmentConfig(
      requested.enabled
        ? {
            ...current,
            enabled: true,
            default_language: requested.defaultLanguage,
          }
        : undefined
    )
    transaction.update(rootRef, {
      sproochli: requested.enabled ? sproochli : FieldValue.delete(),
      updated: serverAuditStamp({ by: uid, appId: ownerAppId }),
    })

    if (Object.hasOwn(support.data() || {}, 'sproochli')) {
      transaction.update(supportRef, {
        sproochli: FieldValue.delete(),
        updated: serverAuditStamp({ by: uid, appId: ownerAppId }),
      })
    }

    return { appId: ownerAppId, sproochli }
  })

  return {
    ok: true as const,
    app_id: result.appId,
    kitchen_id: requested.kitchenId,
    sproochli: result.sproochli,
  }
}
