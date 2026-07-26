import { useRuntimeConfig } from '#imports'
import type { DocumentSnapshot, Transaction } from 'firebase-admin/firestore'
import { createError, type H3Event } from 'h3'
import { requireFirebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer.ts'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'
import { isFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path.ts'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps.ts'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug.ts'
import {
  INGREDIENT_CATEGORIES,
  INGREDIENT_KINDS,
  INGREDIENT_STATUSES,
  type IngredientCategory,
  type IngredientKind,
  type IngredientStatus,
} from '../../models/ingredient-taxonomy.ts'
import type {
  IngredientCreateInput,
  IngredientUpdateInput,
} from '../../models/ingredient.model.ts'
import type { PublicIngredient } from '../../models/ingredient-public.model.ts'
import {
  normalizeIngredientAliases,
  projectPublicIngredient,
} from './public-projection.ts'

type StoredRecord = Record<string, unknown>

const MAX_LIBRARY_SIZE = 500

const CREATE_FIELDS = new Set([
  'name',
  'aliases',
  'category',
  'kind',
  'parent_ingredient_id',
  'status',
  'replaced_by_ingredient_id',
  'image_url',
])

const UPDATE_FIELDS = CREATE_FIELDS

const text = (value: unknown) => String(value ?? '').trim()
const foldIdentity = (value: unknown) =>
  text(value).normalize('NFC').toLocaleLowerCase('en')
const record = (value: unknown): StoredRecord =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as StoredRecord)
    : {}

function badRequest(statusMessage: string): never {
  throw createError({ statusCode: 400, statusMessage })
}

function validateObject(
  value: unknown,
  allowed: ReadonlySet<string>,
  label: string
) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    badRequest(`${label} must be an object.`)
  }
  const source = value as StoredRecord
  const unsupported = Object.keys(source).find((key) => !allowed.has(key))
  if (unsupported)
    badRequest(`${label} contains unsupported field: ${unsupported}.`)
  return source
}

function requiredName(value: unknown) {
  const name = text(value).normalize('NFC')
  if (!name) badRequest('Ingredient name is required.')
  if (name.length > 120)
    badRequest('Ingredient name must be 120 characters or fewer.')
  return name
}

function aliases(value: unknown, name: string) {
  if (value !== undefined && !Array.isArray(value)) {
    badRequest('Ingredient aliases must be an array.')
  }
  const normalized = normalizeIngredientAliases(value)
  if (normalized.length > 20)
    badRequest('Ingredient aliases may contain at most 20 values.')
  if (normalized.some((alias) => alias.length > 120)) {
    badRequest('Ingredient aliases must be 120 characters or fewer.')
  }
  const canonical = foldIdentity(name)
  return normalized.filter((alias) => foldIdentity(alias) !== canonical)
}

function enumValue<T extends string>(
  value: unknown,
  values: readonly T[],
  label: string,
  fallback?: T
) {
  if (value === undefined && fallback !== undefined) return fallback
  if (!values.includes(value as T)) {
    badRequest(`${label} is invalid.`)
  }
  return value as T
}

function optionalIngredientId(value: unknown, label: string) {
  const id = text(value)
  if (!id) return ''
  if (!isFirestoreDocumentId(id)) badRequest(`${label} is invalid.`)
  return id
}

function imageUrl(value: unknown) {
  const url = text(value)
  if (url.length > 2_000) badRequest('Ingredient image URL is too long.')
  if (url && !url.startsWith('/') && !/^https?:\/\//i.test(url)) {
    badRequest(
      'Ingredient image URL must be an HTTP URL or an absolute app path.'
    )
  }
  return url
}

function assertLifecycle(input: {
  id: string
  parentIngredientId: string
  status: IngredientStatus
  replacedByIngredientId: string
}) {
  if (input.parentIngredientId === input.id) {
    badRequest('An Ingredient cannot be its own parent.')
  }
  if (input.replacedByIngredientId === input.id) {
    badRequest('An Ingredient cannot replace itself.')
  }
  if (input.status === 'merged' && !input.replacedByIngredientId) {
    badRequest('A merged Ingredient requires a replacement.')
  }
  if (input.status !== 'merged' && input.replacedByIngredientId) {
    badRequest('Only a merged Ingredient may declare a replacement.')
  }
}

async function curatorContext(event: H3Event) {
  const runtime = useRuntimeConfig(event)
  const appId = text(runtime.public?.fireux?.id)
  const role = text(runtime.public?.fireux?.role)
  const developerId = text(runtime.public?.fireux?.developerId)
  if (!isFirestoreDocumentId(appId) || role !== 'global') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Ingredient curation belongs to the global App.',
    })
  }
  const { uid } = await requireFirebaseBearerUser(
    event,
    'Sign in to curate Ingredients.'
  )
  return {
    appId,
    uid,
    isDeveloper: import.meta.dev && Boolean(developerId) && uid === developerId,
  }
}

function assertCurator(membership: DocumentSnapshot, isDeveloper: boolean) {
  if (
    !isDeveloper &&
    (!membership.exists || text(membership.get('role')) !== 'admin')
  ) {
    throw createError({
      statusCode: 403,
      statusMessage:
        'Global App admin access is required to curate Ingredients.',
    })
  }
}

function canonicalStoredIngredient(
  id: string,
  source: StoredRecord,
  patch: StoredRecord,
  stamp: { created?: unknown; updated: unknown }
) {
  const name = requiredName(
    Object.hasOwn(patch, 'name') ? patch.name : source.name
  )
  const category = enumValue<IngredientCategory>(
    Object.hasOwn(patch, 'category') ? patch.category : source.category,
    INGREDIENT_CATEGORIES,
    'Ingredient category',
    'other'
  )
  const kind = enumValue<IngredientKind>(
    Object.hasOwn(patch, 'kind') ? patch.kind : source.kind,
    INGREDIENT_KINDS,
    'Ingredient kind',
    'base'
  )
  const status = enumValue<IngredientStatus>(
    Object.hasOwn(patch, 'status') ? patch.status : source.status,
    INGREDIENT_STATUSES,
    'Ingredient status',
    'active'
  )
  const parentIngredientId = optionalIngredientId(
    Object.hasOwn(patch, 'parent_ingredient_id')
      ? patch.parent_ingredient_id
      : source.parent_ingredient_id,
    'Parent Ingredient id'
  )
  const replacedByIngredientId = optionalIngredientId(
    Object.hasOwn(patch, 'replaced_by_ingredient_id')
      ? patch.replaced_by_ingredient_id
      : source.replaced_by_ingredient_id,
    'Replacement Ingredient id'
  )
  assertLifecycle({
    id,
    parentIngredientId,
    status,
    replacedByIngredientId,
  })
  const canonicalImageUrl = imageUrl(
    Object.hasOwn(patch, 'image_url') ? patch.image_url : source.image_url
  )
  if (status === 'active' && !canonicalImageUrl) {
    badRequest('An active Ingredient requires an image.')
  }

  return {
    id,
    schema_version: 2,
    name,
    aliases: aliases(
      Object.hasOwn(patch, 'aliases') ? patch.aliases : source.aliases,
      name
    ),
    slug: text(source.slug) || id,
    category,
    kind,
    ...(parentIngredientId ? { parent_ingredient_id: parentIngredientId } : {}),
    status,
    ...(replacedByIngredientId
      ? { replaced_by_ingredient_id: replacedByIngredientId }
      : {}),
    image_url: canonicalImageUrl,
    created: stamp.created ?? source.created,
    updated: stamp.updated,
  }
}

async function assertUniqueActiveIngredientIdentity(
  transaction: Transaction,
  id: string,
  payload: StoredRecord
) {
  if (text(payload.status) !== 'active') return

  const snapshot = await transaction.get(
    getRuntimeFirestore()
      .collection('ingredients')
      .limit(MAX_LIBRARY_SIZE + 1)
  )
  if (snapshot.size > MAX_LIBRARY_SIZE) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Ingredient library exceeds the bounded curator check.',
    })
  }

  const candidateTerms = new Set([
    foldIdentity(payload.name),
    ...normalizeIngredientAliases(payload.aliases).map(foldIdentity),
  ])
  candidateTerms.delete('')

  for (const document of snapshot.docs) {
    if (document.id === id) continue
    const ingredient = projectPublicIngredient(document)
    if (!ingredient || ingredient.status !== 'active') continue

    const conflictingTerm = [ingredient.name, ...ingredient.aliases]
      .map(foldIdentity)
      .find((term) => candidateTerms.has(term))
    if (!conflictingTerm) continue

    throw createError({
      statusCode: 409,
      statusMessage: `Ingredient identity conflicts with active Ingredient ${ingredient.id}.`,
    })
  }
}

async function assertReferencedIngredients(
  transaction: Transaction,
  id: string,
  payload: StoredRecord
) {
  const db = getRuntimeFirestore()
  const replacementId = text(payload.replaced_by_ingredient_id)
  if (replacementId) {
    const snapshot = await transaction.get(
      db.doc(`ingredients/${replacementId}`)
    )
    const projected = projectPublicIngredient(snapshot)
    if (!projected || projected.status !== 'active') {
      throw createError({
        statusCode: 409,
        statusMessage: `Ingredient ${id} references a missing or inactive replacement.`,
      })
    }
  }

  let parentId = text(payload.parent_ingredient_id)
  const visited = new Set([id])
  for (let depth = 0; parentId; depth += 1) {
    if (depth >= 50 || visited.has(parentId)) {
      throw createError({
        statusCode: 409,
        statusMessage: `Ingredient ${id} would create a parent cycle.`,
      })
    }
    visited.add(parentId)
    const snapshot = await transaction.get(db.doc(`ingredients/${parentId}`))
    const projected = projectPublicIngredient(snapshot)
    if (!projected || projected.status !== 'active') {
      throw createError({
        statusCode: 409,
        statusMessage: `Ingredient ${id} references a missing or inactive parent.`,
      })
    }
    parentId = projected.parent_ingredient_id || ''
  }
}

export async function createIngredient(
  event: H3Event,
  input: Partial<IngredientCreateInput> | unknown
): Promise<PublicIngredient> {
  const source = validateObject(input, CREATE_FIELDS, 'Ingredient')
  const name = requiredName(source.name)
  const id = normalizeSlug(name, { maxLength: 120 })
  if (!isFirestoreDocumentId(id)) badRequest('Unable to resolve Ingredient id.')

  const context = await curatorContext(event)
  const db = getRuntimeFirestore()
  const ref = db.doc(`ingredients/${id}`)
  const membershipRef = db.doc(`apps/${context.appId}/users/${context.uid}`)

  const result = await db.runTransaction(async (transaction) => {
    const [existing, membership] = await Promise.all([
      transaction.get(ref),
      transaction.get(membershipRef),
    ])
    assertCurator(membership, context.isDeveloper)
    if (existing.exists) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Ingredient already exists.',
      })
    }

    const payload = canonicalStoredIngredient(id, { slug: id, name }, source, {
      created: serverAuditStamp({ by: context.uid, appId: context.appId }),
      updated: serverAuditStamp({ by: context.uid }),
    })
    await assertUniqueActiveIngredientIdentity(transaction, id, payload)
    await assertReferencedIngredients(transaction, id, payload)
    transaction.create(ref, payload)
    return payload
  })

  const projected = projectPublicIngredient({ id, data: () => result })
  if (!projected) throw new Error('Created Ingredient projection is invalid.')
  return projected
}

export async function updateIngredient(
  event: H3Event,
  ingredientId: string,
  input: Partial<IngredientUpdateInput> | unknown
): Promise<PublicIngredient> {
  const id = text(ingredientId)
  if (!isFirestoreDocumentId(id)) badRequest('Ingredient id is invalid.')
  const patch = validateObject(input, UPDATE_FIELDS, 'Ingredient patch')
  if (!Object.keys(patch).length) badRequest('Ingredient patch is empty.')

  const context = await curatorContext(event)
  const db = getRuntimeFirestore()
  const ref = db.doc(`ingredients/${id}`)
  const membershipRef = db.doc(`apps/${context.appId}/users/${context.uid}`)

  const result = await db.runTransaction(async (transaction) => {
    const [existing, membership] = await Promise.all([
      transaction.get(ref),
      transaction.get(membershipRef),
    ])
    assertCurator(membership, context.isDeveloper)
    if (!existing.exists) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Ingredient not found.',
      })
    }

    const payload = canonicalStoredIngredient(
      id,
      record(existing.data()),
      patch,
      { updated: serverAuditStamp({ by: context.uid }) }
    )
    await assertUniqueActiveIngredientIdentity(transaction, id, payload)
    await assertReferencedIngredients(transaction, id, payload)
    transaction.set(ref, payload)
    return payload
  })

  const projected = projectPublicIngredient({ id, data: () => result })
  if (!projected) throw new Error('Updated Ingredient projection is invalid.')
  return projected
}

export async function listIngredientsForCurator(
  event: H3Event
): Promise<PublicIngredient[]> {
  const context = await curatorContext(event)
  const db = getRuntimeFirestore()
  const membership = await db
    .doc(`apps/${context.appId}/users/${context.uid}`)
    .get()
  assertCurator(membership, context.isDeveloper)

  const snapshot = await db
    .collection('ingredients')
    .limit(MAX_LIBRARY_SIZE + 1)
    .get()
  if (snapshot.size > MAX_LIBRARY_SIZE) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Ingredient library exceeds the bounded curator index.',
    })
  }

  return snapshot.docs
    .map(projectPublicIngredient)
    .filter((item): item is PublicIngredient => Boolean(item))
    .sort((left, right) =>
      left.name.localeCompare(right.name, undefined, {
        sensitivity: 'base',
      })
    )
}
