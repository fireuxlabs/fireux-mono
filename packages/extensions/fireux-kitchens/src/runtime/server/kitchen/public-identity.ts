import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import {
  FieldValue,
  type Transaction,
} from 'firebase-admin/firestore'
import { createError, type H3Event } from 'h3'
import { requireFirebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import { isFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import {
  requireFirebaseStorageDownloadUrl,
  runtimeStorageBucketName,
} from 'fireux-core/runtime/server/utils/uploads/storage'
import type {
  KitchenPublicIdentityEdit,
  KitchenPublicIdentityEditResponse,
} from '../../models/kitchen/kitchen-index.model.ts'
import { KitchenStorage } from '../../models/kitchen.model.ts'
import { readKitchenIdentity } from '../../utils/kitchen-spine.ts'
import {
  readKitchenOnboardingScope,
  readKitchenOnboardingSupport,
} from './onboarding-policy.ts'

type RuntimeFirestore = ReturnType<typeof getRuntimeFirestore>

const text = (value: unknown) => String(value ?? '').trim()

function forbidden(statusMessage: string): never {
  throw createError({ statusCode: 403, statusMessage })
}

function invalid(statusMessage: string): never {
  throw createError({ statusCode: 400, statusMessage })
}

function boundedText(
  value: unknown,
  label: string,
  maxLength: number
) {
  if (typeof value !== 'string') invalid(`${label} must be text.`)
  const normalized = value.trim()
  if (normalized.length > maxLength) {
    invalid(`${label} must be ${maxLength} characters or fewer.`)
  }
  return normalized
}

function identityInput(value: unknown): KitchenPublicIdentityEdit {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    invalid('Kitchen identity must be an object.')
  }
  const source = value as Record<string, unknown>
  const allowed = new Set([
    'display_name',
    'tagline',
    'card_image_url',
    'logo_image_url',
  ])
  const unsupported = Object.keys(source).find(key => !allowed.has(key))
  if (unsupported) {
    invalid(`Kitchen identity contains unsupported field: ${unsupported}.`)
  }
  for (const key of allowed) {
    if (!Object.hasOwn(source, key)) {
      invalid(`Kitchen identity is missing ${key}.`)
    }
  }

  return {
    display_name: boundedText(source.display_name, 'Kitchen name', 120),
    tagline: boundedText(source.tagline, 'Tagline', 140),
    card_image_url: boundedText(source.card_image_url, 'Card image', 2048),
    logo_image_url: boundedText(source.logo_image_url, 'Logo image', 2048),
  }
}

function canonicalIdentityMedia(
  identity: KitchenPublicIdentityEdit,
  kitchenId: string
): KitchenPublicIdentityEdit {
  const bucketName = runtimeStorageBucketName()
  return {
    ...identity,
    card_image_url: identity.card_image_url
      ? requireFirebaseStorageDownloadUrl(identity.card_image_url, {
          bucketName,
          objectPath: `kitchens/${kitchenId}/identity/card/current`,
          label: 'Kitchen card image',
        })
      : '',
    logo_image_url: identity.logo_image_url
      ? requireFirebaseStorageDownloadUrl(identity.logo_image_url, {
          bucketName,
          objectPath: `kitchens/${kitchenId}/identity/logo/current`,
          label: 'Kitchen logo',
        })
      : '',
  }
}

function identityEdit(data: Record<string, unknown>): KitchenPublicIdentityEdit {
  const identity = readKitchenIdentity(data)
  return {
    display_name: identity.displayName,
    tagline: identity.tagline,
    card_image_url: identity.cardImageUrl,
    logo_image_url: identity.logoImageUrl,
  }
}

async function kitchenBySlug(db: RuntimeFirestore, slug: string) {
  const normalized = text(slug).toLowerCase()
  if (!normalized) invalid('Kitchen slug is required.')
  const snapshot = await db
    .collection(KitchenStorage.rootCollection)
    .doc(normalized)
    .get()
  if (!snapshot.exists) {
    throw createError({ statusCode: 404, statusMessage: 'Kitchen not found.' })
  }
  return {
    id: snapshot.id,
    slug: normalized,
  }
}

async function requestAuthority(event: H3Event) {
  const { uid } = await requireFirebaseBearerUser(
    event,
    'Sign in to edit this Kitchen.'
  )
  const fireux = useFireUXConfig()
  const runtimeAppId = text(fireux.appId)
  const ecosystemId = text(fireux.ecosystemId || fireux.ecosystem)
  if (!isFirestoreDocumentId(runtimeAppId) || !ecosystemId) {
    throw createError({
      statusCode: 503,
      statusMessage: 'The current App identity is unavailable.',
    })
  }
  return {
    uid,
    runtimeAppId,
    ecosystemId,
    runtimeRole: fireux.role,
    isDeveloper:
      import.meta.dev &&
      Boolean(text(fireux.developerId)) &&
      uid === text(fireux.developerId),
  }
}

async function assertAuthority(
  db: RuntimeFirestore,
  context: Awaited<ReturnType<typeof requestAuthority>>,
  kitchenId: string,
  expectedSlug: string,
  transaction?: Transaction
) {
  const rootRef = db.collection(KitchenStorage.rootCollection).doc(kitchenId)
  const root = transaction
    ? await transaction.get(rootRef)
    : await rootRef.get()
  if (!root.exists || text(root.get('slug')).toLowerCase() !== expectedSlug) {
    throw createError({ statusCode: 404, statusMessage: 'Kitchen not found.' })
  }

  const scope = readKitchenOnboardingScope(root.data() || {})
  if (
    (scope.state !== 'parent_app' && scope.state !== 'tenant_app') ||
    !isFirestoreDocumentId(scope.appId)
  ) {
    throw createError({
      statusCode: 409,
      statusMessage: 'The Kitchen App scope is invalid.',
    })
  }
  if (
    context.runtimeRole !== 'global' &&
    scope.appId !== context.runtimeAppId
  ) {
    forbidden('This Kitchen belongs to another App.')
  }

  const authorityRefs = [
    db.doc(`apps/${context.runtimeAppId}/users/${context.uid}`),
    db.doc(`apps/${scope.appId}`),
    db.doc(`apps/${scope.appId}/${KitchenStorage.scopeCollection}/${kitchenId}`),
  ] as const
  const [runtimeMembership, ownerApp, support] = transaction
    ? await transaction.getAll(...authorityRefs)
    : await db.getAll(...authorityRefs)
  const isAdmin =
    runtimeMembership.exists &&
    text(runtimeMembership.get('role')) === 'admin'
  if (!isAdmin && !context.isDeveloper) {
    forbidden('Current App admin access is required.')
  }
  if (
    !ownerApp.exists ||
    text(ownerApp.get('ecosystem_id')) !== context.ecosystemId
  ) {
    forbidden('This Kitchen is outside the current ecosystem.')
  }
  try {
    if (!support.exists || !readKitchenOnboardingSupport(support.data() || {})) {
      throw new Error('invalid')
    }
  } catch {
    throw createError({
      statusCode: 409,
      statusMessage: 'Kitchen App support is incomplete.',
    })
  }

  return { rootRef, root, ownerAppId: scope.appId }
}

export async function readKitchenPublicIdentity(
  event: H3Event,
  slug: string
): Promise<KitchenPublicIdentityEditResponse> {
  const context = await requestAuthority(event)
  const db = getRuntimeFirestore()
  const kitchen = await kitchenBySlug(db, slug)
  const { root } = await assertAuthority(
    db,
    context,
    kitchen.id,
    kitchen.slug
  )
  return {
    ok: true,
    kitchen_id: kitchen.id,
    identity: identityEdit(root.data() || {}),
  }
}

export async function updateKitchenPublicIdentity(
  event: H3Event,
  slug: string,
  input: unknown
): Promise<KitchenPublicIdentityEditResponse> {
  const requestedInput = identityInput(input)
  const context = await requestAuthority(event)
  const db = getRuntimeFirestore()
  const kitchen = await kitchenBySlug(db, slug)
  const requested = canonicalIdentityMedia(requestedInput, kitchen.id)

  await db.runTransaction(async transaction => {
    const authority = await assertAuthority(
      db,
      context,
      kitchen.id,
      kitchen.slug,
      transaction
    )
    const patch: Record<string, unknown> = {
      'identity.display_name':
        requested.display_name || FieldValue.delete(),
      'identity.tagline': requested.tagline || FieldValue.delete(),
      'identity.card_image_url':
        requested.card_image_url || FieldValue.delete(),
      'identity.logo_image_url':
        requested.logo_image_url || FieldValue.delete(),
      updated: serverAuditStamp({
        by: context.uid,
        appId: authority.ownerAppId,
      }),
    }
    transaction.update(authority.rootRef, patch)
  })

  return {
    ok: true,
    kitchen_id: kitchen.id,
    identity: requested,
  }
}
