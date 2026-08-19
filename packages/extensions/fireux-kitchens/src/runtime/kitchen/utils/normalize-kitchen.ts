import { isFirestoreDocumentId } from 'fireux-core/runtime/utils/firestoreDocumentId'
import {
  KitchenDefaults,
  type Kitchen,
  type KitchenAssets,
  type KitchenIdentity,
} from '../models/kitchen.model.ts'
import {
  readKitchenIdentity,
  readKitchenManagementTarget,
  readKitchenVisibility,
} from './kitchen-spine.ts'

const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}

export function normalizeKitchen(
  idValue: unknown,
  value: unknown,
  ecosystem = ''
): Kitchen | null {
  const id = String(idValue ?? '').trim()
  const source = record(value)
  const slug = String(source.slug ?? '')
    .trim()
    .toLowerCase()
  if (!isFirestoreDocumentId(id) || !slug) return null

  const identity = readKitchenIdentity(source)
  const management = readKitchenManagementTarget(source, ecosystem)

  return {
    ...KitchenDefaults,
    ...source,
    id,
    slug,
    visibility: readKitchenVisibility(source),
    management:
      management.mode === 'app'
        ? { mode: 'app', app_id: management.appId }
        : { mode: management.mode },
    identity: {
      name: identity.displayName,
      tagline: identity.tagline,
    } satisfies KitchenIdentity,
    assets: {
      image: identity.imageUrl,
      logo: identity.logoImageUrl,
      wordmark: identity.wordmarkImageUrl,
      backdrop_color: identity.mediaBackdropColor,
    } satisfies KitchenAssets,
  } as Kitchen
}
