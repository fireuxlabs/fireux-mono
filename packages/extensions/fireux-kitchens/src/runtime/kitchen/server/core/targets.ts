// Concurrent edit — 2026-07-21 20:57 CEST — Kitchen Workspace targets: project authorized roots without browser Firestore reads.
// Concurrent edit — 2026-07-22 12:35 CEST — Canonical Kitchen theme write: project resolved style and server-authorized write capability.
import { createError, type H3Event } from 'h3'
import { requireFirebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import { isFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { readRecordString } from 'fireux-core/runtime/server/utils/records/read'
import { PlaceStorage } from 'fireux-places/runtime/place/models/place.model'
import { readPlacePresentation } from 'fireux-places/runtime/place/utils/place-spine'
import {
  type KitchenWorkspaceTargetItem,
  type KitchenWorkspaceTargetsResponse,
} from '../../models/kitchen-index.model.ts'
import type { KitchenOrdersConfig } from '../../models/kitchen.model.ts'
import { resolveKitchenWorkspaceTargetIds } from './workspace-targets.ts'
import { menuKitchenIdentity } from '../../../menu/server/ownership/kitchen-scope.ts'
import {
  readKitchenFulfilmentConfig,
  readKitchenMenusConfig,
  readKitchenSproochliConfig,
  readKitchenVisibility,
  readKitchenThemePalette,
} from '../../utils/kitchen-spine.ts'

type StoredRecord = Record<string, unknown>

const text = (value: unknown) => String(value ?? '').trim()
const record = (value: unknown): StoredRecord =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as StoredRecord)
    : {}

function conflict(statusMessage: string): never {
  throw createError({ statusCode: 409, statusMessage })
}

const optionalNumber = (value: unknown) => {
  if (value === null || value === undefined || value === '') return undefined
  const number = Number(value)
  return Number.isFinite(number) ? number : undefined
}

function projectKitchenTarget(input: {
  id: string
  canWrite: boolean
  root: StoredRecord
  place: StoredRecord
}): KitchenWorkspaceTargetItem {
  const place = readPlacePresentation(input.place)
  const resolvedIdentity = menuKitchenIdentity(input.root, input.place)
  const displayName = text(resolvedIdentity.name)
  if (!displayName) {
    conflict(`Kitchen ${input.id} has no usable canonical identity.`)
  }

  const visibility = readKitchenVisibility(input.root)
  const menus = readKitchenMenusConfig(input.root)
  const gallery = place.gallery
  const tagline = place.brandTagline
  const themePalette = readKitchenThemePalette(input.root)
  const orders = record(input.root.orders)
  const shortName = place.shortName
  const brandTagline = place.brandTagline
  const formattedAddress = place.formattedAddress
  const shortAddress = place.shortAddress
  const claimedBy = readRecordString(input.root, 'claimed_by')
  const about = place.about
  const website = place.website
  const phone = place.phone
  const latitude = optionalNumber(input.place.lat)
  const longitude = optionalNumber(input.place.lng)
  const logoImageUrl = place.logoImage
  const cardImageUrl = resolvedIdentity.imageUrl
  const mediaBackdropColor = place.mediaBackdropColor

  return {
    id: input.id,
    can_write: input.canWrite,
    place_id: input.id,
    slug: readRecordString(input.root, 'slug'),
    visibility,
    identity: {
      display_name: displayName,
      tagline,
      image_url: cardImageUrl,
      ...(logoImageUrl ? { logo_image_url: logoImageUrl } : {}),
      ...(mediaBackdropColor
        ? { media_backdrop_color: mediaBackdropColor }
        : {}),
      ...(resolvedIdentity.wordmarkImageUrl
        ? { wordmark_image_url: resolvedIdentity.wordmarkImageUrl }
        : {}),
      gallery,
    },
    menus: {
      ...(menus.context ? { context: menus.context } : {}),
      currency_format: menus.currencyFormat,
      show_currency: menus.showCurrency,
      available: menus.available,
      ...(menus.primaryMenuId ? { primary_menu_id: menus.primaryMenuId } : {}),
      ...(menus.specialsEnabled ? { specials_enabled: true } : {}),
      ...(menus.specialsMenuId
        ? { specials_menu_id: menus.specialsMenuId }
        : {}),
    },
    ...(themePalette
      ? { theme: { palette: themePalette } }
      : {}),
    ...(Object.keys(orders).length
      ? { orders: orders as KitchenOrdersConfig }
      : {}),
    fulfilment: readKitchenFulfilmentConfig(input.root),
    sproochli: readKitchenSproochliConfig(input.root),
    display_name: displayName,
    name: displayName,
    ...(tagline ? { tagline } : {}),
    ...(shortName ? { short_name: shortName } : {}),
    ...(brandTagline ? { brand_tagline: brandTagline } : {}),
    ...(formattedAddress ? { formatted_address: formattedAddress } : {}),
    ...(shortAddress ? { short_address: shortAddress } : {}),
    ...(cardImageUrl ? { image_url: cardImageUrl } : {}),
    ...(mediaBackdropColor ? { media_backdrop_color: mediaBackdropColor } : {}),
    ...(gallery.length ? { food_gallery: gallery } : {}),
    ...(resolvedIdentity.currencyCode
      ? { currency_code: resolvedIdentity.currencyCode }
      : {}),
    ...(claimedBy ? { claimed_by: claimedBy } : {}),
    ...(about ? { about } : {}),
    ...(website ? { website } : {}),
    ...(phone ? { phone } : {}),
    ...(latitude !== undefined ? { lat: latitude } : {}),
    ...(longitude !== undefined ? { lng: longitude } : {}),
    route_scope: 'live',
  }
}

export async function readKitchenWorkspaceTargets(
  event: H3Event
): Promise<KitchenWorkspaceTargetsResponse> {
  const { uid } = await requireFirebaseBearerUser(
    event,
    'Sign in to view Kitchen targets.'
  )
  const db = getRuntimeFirestore()

  const indexedTargetIds = await resolveKitchenWorkspaceTargetIds(uid)
  if (!indexedTargetIds.length) {
    return { ok: true, family: 'kitchen', items: [] }
  }

  const rootSnapshots = await db.getAll(
    ...indexedTargetIds.map((id) => db.doc(`kitchens/${id}`))
  )
  const roots = new Map(
    rootSnapshots.map((snapshot) => [snapshot.id, snapshot])
  )
  const relatedRefs = new Map<string, ReturnType<typeof db.doc>>()

  for (const id of indexedTargetIds) {
    const rootSnapshot = roots.get(id)
    if (!rootSnapshot?.exists) {
      conflict(`Kitchen target ${id} is missing its canonical root.`)
    }
  }

  const targetIds = indexedTargetIds
  for (const id of targetIds) {
    for (const ref of [
      db.doc(`kitchens/${id}/team/${uid}`),
      db.doc(`${PlaceStorage.collection}/${id}`),
    ]) {
      relatedRefs.set(ref.path, ref)
    }
  }

  const relatedSnapshots = await db.getAll(...relatedRefs.values())
  const related = new Map(
    relatedSnapshots.map((snapshot) => [snapshot.ref.path, snapshot])
  )
  const items = targetIds.map((id) => {
    const rootSnapshot = roots.get(id)!
    const root = rootSnapshot.data() || {}
    const teamPath = `kitchens/${id}/team/${uid}`
    const placeId = id
    const placePath = `${PlaceStorage.collection}/${placeId}`
    const teamSnapshot = related.get(teamPath)
    const placeSnapshot = related.get(placePath)

    if (!teamSnapshot?.exists) {
      conflict(`Kitchen target ${id} is missing its Team membership.`)
    }
    if (!placeSnapshot?.exists) {
      conflict(`Kitchen target ${id} is missing its canonical Place.`)
    }
    const member = teamSnapshot.data() || {}
    const teamRole = text(member.role)
    if (
      text(member.user_id) !== uid ||
      member.status !== 'active' ||
      !['owner', 'operator', 'member'].includes(teamRole)
    ) {
      throw createError({
        statusCode: 403,
        statusMessage: `Kitchen target ${id} requires active Team membership.`,
      })
    }

    return projectKitchenTarget({
      id,
      canWrite: teamRole === 'owner' || teamRole === 'operator',
      root,
      place: placeSnapshot.data() || {},
    })
  })

  return { ok: true, family: 'kitchen', items }
}
