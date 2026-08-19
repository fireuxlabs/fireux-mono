import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import {
  FieldValue,
  type DocumentData,
  type UpdateData,
} from 'firebase-admin/firestore'
import { createError, type H3Event } from 'h3'
import { requireFirebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import {
  runGuardedServerTransaction,
  type GuardedServerTransaction,
} from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { isFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import { resolveFireuxEntityManagementAppId } from 'fireux-core/runtime/utils/entity-management'
import {
  requireFirebaseStorageDownloadUrl,
  runtimeStorageBucketName,
} from 'fireux-core/runtime/server/utils/uploads/storage'
import {
  FIRESTORE_MUTATION_TARGETS,
  serverAppKitchensTarget,
  serverAppUsersTarget,
} from 'fireux-core/runtime/utils/firestore-mutations/targets'
import type {
  KitchenIdentityEdit,
  KitchenIdentityEditResponse,
} from '../../models/kitchen-detail.model.ts'
import {
  AppKitchenStorage,
  KitchenStorage,
} from '../../models/kitchen.model.ts'
import { readKitchenIdentity } from '../../utils/kitchen-spine.ts'
import {
  readKitchenOnboardingManagement,
  readKitchenOnboardingSupport,
} from '../index/onboarding/onboarding-policy.ts'
import { readKitchenByRouteSlug } from './route-identity.ts'

type RuntimeFirestore = ReturnType<typeof getRuntimeFirestore>

const text = (value: unknown) => String(value ?? '').trim()

function forbidden(statusMessage: string): never {
  throw createError({ statusCode: 403, statusMessage })
}

function invalid(statusMessage: string): never {
  throw createError({ statusCode: 400, statusMessage })
}

function boundedText(value: unknown, label: string, maxLength: number) {
  if (typeof value !== 'string') invalid(`${label} must be text.`)
  const normalized = value.trim()
  if (normalized.length > maxLength) {
    invalid(`${label} must be ${maxLength} characters or fewer.`)
  }
  return normalized
}

function identityInput(value: unknown): KitchenIdentityEdit {
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
  const unsupported = Object.keys(source).find((key) => !allowed.has(key))
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
  identity: KitchenIdentityEdit,
  kitchenId: string
): KitchenIdentityEdit {
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

function identityEdit(data: Record<string, unknown>): KitchenIdentityEdit {
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
  const kitchen = await readKitchenByRouteSlug(db, normalized)
  if (!kitchen) {
    throw createError({ statusCode: 404, statusMessage: 'Kitchen not found.' })
  }
  return {
    id: kitchen.id,
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
    ecosystem: fireux.ecosystem,
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
  expectedSlug: string
) {
  const rootRef = db.collection(KitchenStorage.collection).doc(kitchenId)
  const root = await rootRef.get()
  if (!root.exists || text(root.get('slug')).toLowerCase() !== expectedSlug) {
    throw createError({ statusCode: 404, statusMessage: 'Kitchen not found.' })
  }

  const management = readKitchenOnboardingManagement(root.data() || {})
  const ownerAppId = resolveFireuxEntityManagementAppId(
    management,
    context.ecosystem
  )
  if (management.mode === 'root' || !isFirestoreDocumentId(ownerAppId)) {
    throw createError({
      statusCode: 409,
      statusMessage: 'The Kitchen App scope is invalid.',
    })
  }
  if (context.runtimeRole !== 'global' && ownerAppId !== context.runtimeAppId) {
    forbidden('This Kitchen belongs to another App.')
  }

  const authorityRefs = [
    db.doc(`apps/${context.runtimeAppId}/users/${context.uid}`),
    db.doc(`apps/${ownerAppId}`),
    db.doc(`apps/${ownerAppId}/${AppKitchenStorage.collection}/${kitchenId}`),
  ] as const
  const [runtimeMembership, ownerApp, support] = await db.getAll(
    ...authorityRefs
  )
  const isAdmin =
    runtimeMembership.exists && text(runtimeMembership.get('role')) === 'admin'
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
    if (
      !support.exists ||
      !readKitchenOnboardingSupport(support.data() || {})
    ) {
      throw new Error('invalid')
    }
  } catch {
    throw createError({
      statusCode: 409,
      statusMessage: 'Kitchen App support is incomplete.',
    })
  }

  return { root, ownerAppId }
}

async function assertTransactionAuthority(
  transaction: GuardedServerTransaction,
  context: Awaited<ReturnType<typeof requestAuthority>>,
  kitchenId: string,
  expectedSlug: string
) {
  const memberships = serverAppUsersTarget(context.runtimeAppId)
  const root = await transaction.read(
    FIRESTORE_MUTATION_TARGETS.kitchens,
    kitchenId
  )
  const rootData = root.data || {}
  if (!root.exists || text(rootData.slug).toLowerCase() !== expectedSlug) {
    throw createError({ statusCode: 404, statusMessage: 'Kitchen not found.' })
  }

  const management = readKitchenOnboardingManagement(rootData)
  const ownerAppId = resolveFireuxEntityManagementAppId(
    management,
    context.ecosystem
  )
  if (management.mode === 'root' || !isFirestoreDocumentId(ownerAppId)) {
    throw createError({
      statusCode: 409,
      statusMessage: 'The Kitchen App scope is invalid.',
    })
  }
  if (context.runtimeRole !== 'global' && ownerAppId !== context.runtimeAppId) {
    forbidden('This Kitchen belongs to another App.')
  }

  const [runtimeMembership, ownerApp, support] = await Promise.all([
    transaction.read(memberships, context.uid),
    transaction.read(FIRESTORE_MUTATION_TARGETS.runtimeApps, ownerAppId),
    transaction.read(serverAppKitchensTarget(ownerAppId), kitchenId),
  ])
  const isAdmin =
    runtimeMembership.exists && text(runtimeMembership.data?.role) === 'admin'
  if (!isAdmin && !context.isDeveloper) {
    forbidden('Current App admin access is required.')
  }
  if (
    !ownerApp.exists ||
    text(ownerApp.data?.ecosystem_id) !== context.ecosystemId
  ) {
    forbidden('This Kitchen is outside the current ecosystem.')
  }
  try {
    if (!support.exists || !readKitchenOnboardingSupport(support.data || {})) {
      throw new Error('invalid')
    }
  } catch {
    throw createError({
      statusCode: 409,
      statusMessage: 'Kitchen App support is incomplete.',
    })
  }

  return { ownerAppId }
}

export async function readKitchenIdentityEdit(
  event: H3Event,
  slug: string
): Promise<KitchenIdentityEditResponse> {
  const context = await requestAuthority(event)
  const db = getRuntimeFirestore()
  const kitchen = await kitchenBySlug(db, slug)
  const { root } = await assertAuthority(db, context, kitchen.id, kitchen.slug)
  return {
    ok: true,
    kitchen_id: kitchen.id,
    identity: identityEdit(root.data() || {}),
  }
}

export async function updateKitchenIdentity(
  event: H3Event,
  slug: string,
  input: unknown
): Promise<KitchenIdentityEditResponse> {
  const requestedInput = identityInput(input)
  const context = await requestAuthority(event)
  const db = getRuntimeFirestore()
  const kitchen = await kitchenBySlug(db, slug)
  const requested = canonicalIdentityMedia(requestedInput, kitchen.id)

  await runGuardedServerTransaction({ kind: 'runtime' }, async (mutations) => {
    const authority = await assertTransactionAuthority(
      mutations,
      context,
      kitchen.id,
      kitchen.slug
    )
    const patch: UpdateData<DocumentData> = {
      'identity.display_name': requested.display_name || FieldValue.delete(),
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
    mutations.update(FIRESTORE_MUTATION_TARGETS.kitchens, kitchen.id, patch)
  })

  return {
    ok: true,
    kitchen_id: kitchen.id,
    identity: requested,
  }
}
