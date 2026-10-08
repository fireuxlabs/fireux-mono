// Concurrent edit — 2026-07-21 22:30 CEST — Workspace alignment — Property: share exact draft-root normalization between public and trusted creation.
import { isFirestoreDocumentId } from 'fireux-core/runtime/utils/firestoreDocumentId'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug'
import type {
  Property,
  PropertyCreateInput,
  PropertyIdentity,
} from '../models/property.model.ts'
import type { FireuxEntityManagement } from 'fireux-core/runtime/models/utils/scope.model'
import { readFireuxEntityManagement } from 'fireux-core/runtime/utils/entity-management'

const text = (value: unknown) => String(value ?? '').trim()

function normalizeIdentity(
  identity: PropertyCreateInput['identity'] | null | undefined
): PropertyIdentity {
  if (
    !identity ||
    typeof identity !== 'object' ||
    Array.isArray(identity) ||
    Object.keys(identity).some(
      (key) =>
        ![
          'name',
          'image_url',
          'property_type',
          'unit_count',
          'slug',
          'status',
        ].includes(key)
    )
  ) {
    throw new Error('[fireux-properties] Property identity input is invalid.')
  }
  for (const key of ['name', 'image_url', 'slug'] as const) {
    if (identity[key] !== undefined && typeof identity[key] !== 'string')
      throw new Error('[fireux-properties] Property identity text is invalid.')
  }
  if (
    identity.property_type !== undefined &&
    !['residential', 'commercial', 'mixed'].includes(identity.property_type)
  )
    throw new Error('[fireux-properties] Property type is invalid.')
  if (
    identity.status !== undefined &&
    !['active', 'inactive'].includes(identity.status)
  )
    throw new Error('[fireux-properties] Property status is invalid.')
  if (
    identity.unit_count !== undefined &&
    (!Number.isSafeInteger(identity.unit_count) || identity.unit_count < 0)
  )
    throw new Error('[fireux-properties] Property unit count is invalid.')
  const name = text(identity.name)
  if (!name || name.length > 120)
    throw new Error(
      '[fireux-properties] Property name is required and must be at most 120 characters.'
    )
  return {
    name,
    image_url: text(identity.image_url),
    property_type: identity.property_type ?? 'residential',
    unit_count: identity.unit_count ?? 0,
    slug: normalizeSlug(text(identity.slug) || name),
    status: identity.status ?? 'active',
    publication_state: 'draft',
  }
}

export type PropertyCreateRootPayload = Omit<
  Property,
  'id' | 'created' | 'updated'
>

export type PropertyCreateRootPlan = {
  id: string
  payload: PropertyCreateRootPayload
}

export function buildPropertyCreateRoot(
  input: PropertyCreateInput,
  management: FireuxEntityManagement = { mode: 'root' }
): PropertyCreateRootPlan {
  if (
    !input ||
    typeof input !== 'object' ||
    Array.isArray(input) ||
    Object.keys(input).some(
      (key) => !['id', 'portfolio_id', 'place_id', 'identity'].includes(key)
    )
  ) {
    throw new Error('[fireux-properties] Property creation input is invalid.')
  }
  for (const key of ['id', 'portfolio_id', 'place_id'] as const) {
    if (input[key] !== undefined && typeof input[key] !== 'string') {
      throw new Error(
        '[fireux-properties] Property relationship IDs must be strings.'
      )
    }
  }
  const identity = normalizeIdentity(input.identity)
  const placeId = text(input?.place_id)
  const slug = identity.slug
  const id = text(input?.id) || slug

  if (!identity.name) {
    throw new Error('[fireux-properties] property name is required.')
  }
  if (!isFirestoreDocumentId(placeId)) {
    throw new Error('[fireux-properties] canonical Place id is required.')
  }
  if (!isFirestoreDocumentId(id) || !slug) {
    throw new Error('[fireux-properties] property id and slug are required.')
  }

  const portfolioId = text(input.portfolio_id)
  if (portfolioId && !isFirestoreDocumentId(portfolioId)) {
    throw new Error('[fireux-properties] Portfolio id is invalid.')
  }

  const canonicalManagement = readFireuxEntityManagement(management)
  if (!canonicalManagement) {
    throw new Error('[fireux-properties] Property management is invalid.')
  }

  return {
    id,
    payload: {
      portfolio_id: portfolioId,
      place_id: placeId,
      management: canonicalManagement,
      identity,
    },
  }
}
