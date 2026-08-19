import type { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import { isFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { readRecordString } from 'fireux-core/runtime/server/utils/records/read'
import { PlaceStorage } from 'fireux-places/runtime/place/models/place.model'
import { readPlacePresentation } from 'fireux-places/runtime/place/utils/place-spine'
import { normalizePlace } from 'fireux-places/runtime/place/utils/normalize-place'
import type {
  KitchenDetailPresentation,
  KitchenDetailResponse,
} from '../../models/kitchen-detail.model.ts'
import type { KitchenDirectoryEntry } from '../../models/kitchen-directory.model.ts'
import {
  readKitchenIdentity,
  readKitchenSproochliConfig,
  readKitchenVisibility,
} from '../../utils/kitchen-spine.ts'
import { menuKitchenIdentity } from '../../../menu/server/ownership/kitchen-scope.ts'
import {
  readFireuxEntityManagement,
  resolveFireuxEntityManagementAppId,
} from 'fireux-core/runtime/utils/entity-management'
import { normalizeKitchen } from '../../utils/normalize-kitchen.ts'
import { resolveKitchenDetailPresentation } from '../../utils/kitchen-detail-presentation.ts'

export type KitchenRootRecord = {
  id: string
  data: Record<string, unknown>
}

export type KitchenReadScope = {
  ecosystem: string
}

type RuntimeFirestore = ReturnType<typeof getRuntimeFirestore>

type CanonicalKitchenManagementTarget = {
  mode: 'console' | 'app'
  appId: string
}

type KitchenReadParts = {
  document: KitchenRootRecord
  managementTarget: CanonicalKitchenManagementTarget | null
  supportData: Record<string, unknown>
  placeData: Record<string, unknown>
  identity: ReturnType<typeof menuKitchenIdentity>
  rootIdentity: ReturnType<typeof readKitchenIdentity>
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

function canonicalKitchenManagementTarget(
  data: Record<string, unknown>,
  ecosystem: string
): CanonicalKitchenManagementTarget | null {
  const hasRetiredScope = [
    'app_scope',
    'app_scope_state',
    'app_scope_app_id',
    'app_id',
    'console',
  ].some((key) => Object.hasOwn(data, key))
  const management = readFireuxEntityManagement(data.management)

  if (hasRetiredScope || !management || management.mode === 'root') return null
  const appId = resolveFireuxEntityManagementAppId(management, ecosystem)
  if (!isFirestoreDocumentId(appId)) return null

  return { mode: management.mode, appId }
}

export async function readKitchenRelatedRecords(
  db: RuntimeFirestore,
  documents: KitchenRootRecord[],
  scope: KitchenReadScope
) {
  const references = new Map<string, ReturnType<typeof db.doc>>()

  for (const document of documents) {
    if (isFirestoreDocumentId(document.id)) {
      const placeRef = db.collection(PlaceStorage.collection).doc(document.id)
      references.set(placeRef.path, placeRef)
    }

    const managementTarget = canonicalKitchenManagementTarget(
      document.data,
      scope.ecosystem
    )
    if (!managementTarget) continue
    const appKitchenRef = db
      .collection(`apps/${managementTarget.appId}/kitchens`)
      .doc(document.id)
    references.set(appKitchenRef.path, appKitchenRef)
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
  scope: KitchenReadScope
): KitchenReadParts | null {
  const rootData = document.data
  const placeId = document.id
  if (!isFirestoreDocumentId(placeId)) return null

  const placeData = dataByPath.get(`${PlaceStorage.collection}/${placeId}`)
  if (!placeData) return null

  const managementTarget = canonicalKitchenManagementTarget(
    rootData,
    scope.ecosystem
  )
  const supportData = managementTarget
    ? dataByPath.get(
        `apps/${managementTarget.appId}/kitchens/${document.id}`
      ) || {}
    : {}

  const identity = menuKitchenIdentity(rootData, supportData, placeData)
  if (!text(identity.name)) return null

  const slug = readRecordString(rootData, 'slug')
  if (!slug) return null
  const visible = readKitchenVisibility(rootData)

  return {
    document,
    managementTarget,
    supportData,
    placeData,
    identity,
    rootIdentity: readKitchenIdentity(rootData),
    place: readPlacePresentation(placeData),
    visible,
  }
}

export function projectKitchenDirectoryEntry(
  document: KitchenRootRecord,
  dataByPath: Map<string, Record<string, unknown>>,
  scope: KitchenReadScope
): KitchenDirectoryEntry | null {
  const parts = resolveKitchenReadParts(document, dataByPath, scope)
  if (!parts) return null

  const rootData = parts.document.data
  const name = text(parts.identity.name)
  const slug = readRecordString(rootData, 'slug')
  const shortName = readRecordString(parts.placeData, 'short_name')
  const brandTagline = text(
    parts.rootIdentity.tagline || parts.place.brandTagline
  )
  const formattedAddress = readRecordString(
    parts.placeData,
    'formatted_address'
  )
  const shortAddress = readRecordString(parts.placeData, 'short_address')
  const cardImageUrl = text(parts.rootIdentity.cardImageUrl)
  const imageUrl = text(
    cardImageUrl || parts.place.coverImage || parts.place.imageUrl
  )
  const mediaBackdropColor =
    parts.rootIdentity.mediaBackdropColor || parts.place.mediaBackdropColor
  const imageKind = cardImageUrl && mediaBackdropColor ? 'brand' : 'photograph'
  const logoImageUrl = text(
    parts.rootIdentity.logoImageUrl || parts.place.logoImage
  )

  return {
    id: parts.document.id,
    name,
    slug,
    visible: parts.visible,
    management_mode: parts.managementTarget?.mode || 'root',
    ...(shortName ? { short_name: shortName } : {}),
    ...(brandTagline ? { brand_tagline: brandTagline } : {}),
    ...(formattedAddress ? { formatted_address: formattedAddress } : {}),
    ...(shortAddress ? { short_address: shortAddress } : {}),
    ...(logoImageUrl ? { logo_image_url: logoImageUrl } : {}),
    ...(imageUrl ? { image_url: imageUrl } : {}),
    ...(imageUrl ? { image_kind: imageKind } : {}),
    ...(mediaBackdropColor ? { media_backdrop_color: mediaBackdropColor } : {}),
  }
}

export function projectKitchenDetail(
  document: KitchenRootRecord,
  dataByPath: Map<string, Record<string, unknown>>,
  scope: KitchenReadScope
): KitchenDetailResponse | null {
  const item = projectKitchenDirectoryEntry(document, dataByPath, scope)
  const parts = resolveKitchenReadParts(document, dataByPath, scope)
  if (!item || !parts) return null

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
  const tagline = item.brand_tagline || ''
  const imageUrl = item.image_url || ''
  const placeImageUrl = text(parts.place.imageUrl)
  const sproochli = readKitchenSproochliConfig(parts.supportData)

  const presentation: KitchenDetailPresentation = {
    ...item,
    ...(parts.managementTarget?.appId
      ? { management_app_id: parts.managementTarget.appId }
      : {}),
    route_scope: 'live',
    display_name: item.name,
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
  const kitchen = normalizeKitchen(document.id, document.data, scope.ecosystem)
  const canonicalPlace = normalizePlace(document.id, parts.placeData)
  if (!kitchen || !canonicalPlace) return null

  return {
    kitchen,
    place: canonicalPlace,
    presentation: resolveKitchenDetailPresentation(
      presentation,
      kitchen,
      canonicalPlace
    ),
  }
}
