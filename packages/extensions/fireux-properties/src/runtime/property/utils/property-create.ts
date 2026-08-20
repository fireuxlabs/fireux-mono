// Concurrent edit — 2026-07-21 22:30 CEST — Workspace alignment — Property: share exact draft-root normalization between public and trusted creation.
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
  return {
    name: text(identity?.name),
    image_url: text(identity?.image_url),
    property_type:
      identity?.property_type === 'commercial' ||
      identity?.property_type === 'mixed'
        ? identity.property_type
        : 'residential',
    unit_count: Number.isFinite(identity?.unit_count)
      ? Number(identity?.unit_count)
      : 0,
    estimated_value: Number.isFinite(identity?.estimated_value)
      ? Number(identity?.estimated_value)
      : 0,
    estimated_value_currency: text(identity?.estimated_value_currency),
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
  const identity = normalizeIdentity(input?.identity)
  const placeId = text(input?.place_id)
  const slug = normalizeSlug(text(input?.slug) || identity.name)
  const id = text(input?.id) || slug

  if (!identity.name) {
    throw new Error('[fireux-properties] property name is required.')
  }
  if (!placeId) {
    throw new Error('[fireux-properties] canonical Place id is required.')
  }
  if (!id || !slug) {
    throw new Error('[fireux-properties] property id and slug are required.')
  }

  const canonicalManagement = readFireuxEntityManagement(management)
  if (!canonicalManagement) {
    throw new Error('[fireux-properties] Property management is invalid.')
  }

  return {
    id,
    payload: {
      slug,
      portfolio_id: text(input?.portfolio_id),
      place_id: placeId,
      management: canonicalManagement,
      identity,
      status: input?.status === 'inactive' ? 'inactive' : 'active',
      publication_state: 'draft',
    },
  }
}
