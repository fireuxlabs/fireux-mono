import { isFirestoreDocumentId } from 'fireux-core/runtime/utils/firestore-document-id'
import {
  KitchenStatuses,
  KitchenVisibilities,
  type Kitchen,
} from '../models/kitchen.model'
import type { PublicKitchenSummary } from '../types/public'

const text = (value: unknown) => (typeof value === 'string' ? value.trim() : '')

/** Older venue records use the same ID. An explicit unlink disables that lookup. */
export function resolveKitchenPlaceId(
  stored: Record<string, unknown>,
  kitchenId: string
) {
  const { placeId } = stored
  if (typeof placeId === 'string' && isFirestoreDocumentId(placeId))
    return placeId
  return placeId === undefined ? kitchenId : ''
}

export function projectPublicKitchenSummary(
  kitchen: Kitchen
): PublicKitchenSummary | null {
  if (
    kitchen.status !== 'active' ||
    kitchen.visibility !== 'public' ||
    !kitchen.slug
  )
    return null

  const { id, name, slug, description, imageUrl } = kitchen
  return {
    id,
    name,
    slug,
    ...(description ? { description } : {}),
    ...(imageUrl ? { imageUrl } : {}),
  }
}

/** Project the root. Items are acquired from their own collection. */
export function readKitchenDocument(
  raw: unknown,
  id: string,
  fallbackName = ''
): Kitchen | null {
  if (
    !isFirestoreDocumentId(id) ||
    !raw ||
    typeof raw !== 'object' ||
    Array.isArray(raw)
  )
    return null

  const stored = raw as Record<string, unknown>
  if (stored.id !== undefined && stored.id !== id) return null

  const identity = stored.identity as { name?: unknown } | undefined
  const name = text(stored.name) || text(identity?.name) || text(fallbackName)
  const slug = text(stored.slug)
  const status = KitchenStatuses.find((value) => value === stored.status)
  const visibility = KitchenVisibilities.find(
    (value) => value === stored.visibility
  )
  const description = text(stored.description)
  const imageUrl = text(stored.imageUrl)
  const context = text(stored.context)
  const { placeId } = stored
  return {
    id,
    name: name || id,
    items: [],
    ...(slug ? { slug } : {}),
    ...(status ? { status } : {}),
    ...(visibility ? { visibility } : {}),
    ...(description ? { description } : {}),
    ...(imageUrl ? { imageUrl } : {}),
    ...(context ? { context } : {}),
    ...(typeof placeId === 'string' && isFirestoreDocumentId(placeId)
      ? { placeId }
      : {}),
  }
}
