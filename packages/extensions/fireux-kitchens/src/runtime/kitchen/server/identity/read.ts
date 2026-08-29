import type { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import { isFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { readRecordString } from 'fireux-core/runtime/server/utils/records/read'
import { readPlacePresentation } from 'fireux-places/runtime/place/utils/place-spine'
import { normalizePlace } from 'fireux-places/runtime/place/utils/normalize-place'
import type {
  KitchenDetailPresentation,
  KitchenDetailResponse,
} from '../../models/kitchen-detail.model.ts'
import type { Kitchen } from '../../models/kitchen.model.ts'
import type { Place } from 'fireux-places/runtime/place/models/place.model'
import type { SproochliAttachmentConfig } from 'fireux-sproochli/runtime/sproochli'
import { readKitchenVisibility } from '../../utils/kitchen-readers.ts'
import { menuKitchenIdentity } from '../../../menu/server/ownership/kitchen-scope.ts'
import { normalizeKitchen } from '../../utils/normalize-kitchen.ts'
import { resolveKitchenDetailPresentation } from '../../utils/kitchen-detail-presentation.ts'

export type KitchenRootRecord = {
  id: string
  data: Record<string, unknown>
}

export type KitchenReadScope = Record<string, never>

type RuntimeFirestore = ReturnType<typeof getRuntimeFirestore>

type KitchenReadParts = {
  document: KitchenRootRecord
  placeData: Record<string, unknown>
  identity: ReturnType<typeof menuKitchenIdentity>
  place: ReturnType<typeof readPlacePresentation>
  visible: boolean
}

const text = (value: unknown) => String(value ?? '').trim()
const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
const number = (value: unknown) => {
  if (value === null || value === undefined || value === '') return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

export async function readKitchenRelatedRecords(
  db: RuntimeFirestore,
  documents: KitchenRootRecord[],
  _scope: KitchenReadScope
) {
  const references = new Map<string, ReturnType<typeof db.doc>>()

  for (const document of documents) {
    if (isFirestoreDocumentId(document.id)) {
      const placeRef = db.collection('places').doc(document.id)
      references.set(placeRef.path, placeRef)
    }
  }

  if (!references.size) return new Map<string, Record<string, unknown>>()
  const snapshots = await db.getAll(...references.values())
  return new Map(
    snapshots
      .filter((snapshot) => snapshot.exists)
      .map((snapshot) => [snapshot.ref.path, snapshot.data() || {}])
  )
}

function resolveKitchenReadParts(
  document: KitchenRootRecord,
  dataByPath: Map<string, Record<string, unknown>>,
  _scope: KitchenReadScope
): KitchenReadParts | null {
  const rootData = document.data
  const placeId = document.id
  if (!isFirestoreDocumentId(placeId)) return null

  const placeData = dataByPath.get(`${'places'}/${placeId}`)
  if (!placeData) return null

  const identity = menuKitchenIdentity(rootData, placeData)
  if (!text(identity.name)) return null

  const slug = readRecordString(rootData, 'slug')
  if (!slug) return null
  const visible = readKitchenVisibility(rootData)

  return {
    document,
    placeData,
    identity,
    place: readPlacePresentation(placeData),
    visible,
  }
}

export function resolveKitchen(
  document: KitchenRootRecord,
  dataByPath: Map<string, Record<string, unknown>>,
  scope: KitchenReadScope
): (Kitchen & { place: Place }) | null {
  const parts = resolveKitchenReadParts(document, dataByPath, scope)
  if (!parts) return null
  return normalizeKitchen(
    document.id,
    document.data,
    normalizePlace(document.id, parts.placeData)
  )
}

export function projectKitchenDetail(
  document: KitchenRootRecord,
  dataByPath: Map<string, Record<string, unknown>>,
  scope: KitchenReadScope,
  sproochli: SproochliAttachmentConfig
): KitchenDetailResponse | null {
  const kitchen = resolveKitchen(document, dataByPath, scope)
  const parts = resolveKitchenReadParts(document, dataByPath, scope)
  if (!kitchen || !parts) return null

  const place = parts.placeData
  const placeSocialLinks = record(place.social_links)
  const coverImage = parts.place.coverImage
  const wordmarkImage = parts.place.wordmarkImage
  const gallery = parts.place.gallery
  const about = parts.place.about
  const phone = parts.place.phone
  const website =
    parts.place.website || readRecordString(placeSocialLinks, 'website')
  const googleMapsUrl = parts.place.googleMapsUrl
  const latitude = number(place.lat)
  const longitude = number(place.lng)
  const tagline = kitchen.place.brand_tagline || ''
  const imageUrl = kitchen.place.image_url
  const placeImageUrl = text(parts.place.imageUrl)
  const presentation: KitchenDetailPresentation = {
    id: kitchen.id,
    name: kitchen.place.name,
    slug: kitchen.slug,
    visible: kitchen.visibility,
    route_scope: 'live',
    display_name: kitchen.place.name,
    ...(kitchen.place.short_name
      ? { short_name: kitchen.place.short_name }
      : {}),
    ...(kitchen.place.brand_tagline
      ? { brand_tagline: kitchen.place.brand_tagline }
      : {}),
    ...(kitchen.place.formatted_address
      ? { formatted_address: kitchen.place.formatted_address }
      : {}),
    ...(kitchen.place.short_address
      ? { short_address: kitchen.place.short_address }
      : {}),
    ...(kitchen.place.logo_image
      ? { logo_image_url: kitchen.place.logo_image }
      : {}),
    ...(imageUrl ? { image_url: imageUrl, image_kind: 'photograph' } : {}),
    ...(kitchen.place.media_backdrop_color
      ? { media_backdrop_color: kitchen.place.media_backdrop_color }
      : {}),
    ...(sproochli.enabled
      ? {
          sproochli: {
            enabled: true,
            ...(sproochli.default_language
              ? { default_language: sproochli.default_language }
              : {}),
            requested_languages: sproochli.requested_languages,
          },
        }
      : {}),
    ...(tagline ? { tagline } : {}),
    ...(imageUrl ? { display_image_url: imageUrl } : {}),
    ...(placeImageUrl ? { place_image_url: placeImageUrl } : {}),
    ...(coverImage ? { cover_image: coverImage } : {}),
    ...(wordmarkImage ? { wordmark_image: wordmarkImage } : {}),
    ...(gallery.length ? { food_gallery: gallery } : {}),
    ...(about ? { about } : {}),
    ...(phone ? { phone } : {}),
    ...(website ? { website } : {}),
    ...(googleMapsUrl ? { google_maps_url: googleMapsUrl } : {}),
    ...(parts.identity.currencyCode
      ? { currency_code: parts.identity.currencyCode }
      : {}),
    ...(latitude !== null ? { lat: latitude } : {}),
    ...(longitude !== null ? { lng: longitude } : {}),
  }
  return {
    kitchen,
    place: kitchen.place,
    presentation: resolveKitchenDetailPresentation(
      presentation,
      kitchen,
      kitchen.place
    ),
  }
}
