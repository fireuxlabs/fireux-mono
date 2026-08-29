// Concurrent edit — 2026-08-23 CEST — Kitchen Workspace reset: read Kitchens directly from active Team membership.
// Concurrent edit — 2026-07-22 12:35 CEST — Canonical Kitchen theme write: project resolved style and server-authorized write capability.
import { createError, type H3Event } from 'h3'
import { requireFirebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import { isFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { readRecordString } from 'fireux-core/runtime/server/utils/records/read'
import { readPlacePresentation } from 'fireux-places/runtime/place/utils/place-spine'
import {
  type KitchenWorkspaceCurrentResponse,
  type KitchenWorkspaceKitchen,
  type KitchenWorkspaceKitchensResponse,
} from '../../models/kitchen-index.model.ts'
import type { KitchenOrdersConfig } from '../../models/kitchen-configuration.model.ts'
import type { KitchenFulfilment } from '../../models/fulfilment.model.ts'
import { readKitchenFulfilment } from './fulfilment.ts'
import { readKitchenSproochliAttachment } from './sproochli-attachment.ts'
import { readUserKitchenIds } from './user-kitchens.ts'
import {
  PRIMARY_KITCHEN_DOCUMENT,
  type PrimaryKitchenPreference,
} from './primary-kitchen.ts'
import { menuKitchenIdentity } from '../../../menu/server/ownership/kitchen-scope.ts'
import {
  readKitchenMenusConfig,
  readKitchenVisibility,
  readKitchenThemePalette,
} from '../../utils/kitchen-readers.ts'

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

function projectKitchen(input: {
  id: string
  canWrite: boolean
  fulfilment: KitchenFulfilment
  sproochli: KitchenWorkspaceKitchen['sproochli']
  root: StoredRecord
  place: StoredRecord | null
}): KitchenWorkspaceKitchen {
  const placeData = input.place || {}
  const place = readPlacePresentation(placeData)
  const resolvedIdentity = menuKitchenIdentity(input.root, placeData)
  const displayName = text(resolvedIdentity.name)
  if (!displayName) {
    conflict(`Kitchen ${input.id} has no usable canonical identity.`)
  }

  const visibility = readKitchenVisibility(input.root)
  const menus = readKitchenMenusConfig(input.root)
  const gallery = place.gallery
  const tagline = place.tagline
  const themePalette = readKitchenThemePalette(input.root)
  const orders = record(input.root.orders)
  const shortName = place.shortName
  const formattedAddress = place.formattedAddress
  const shortAddress = place.shortAddress
  const claimedBy = readRecordString(input.root, 'claimed_by')
  const about = place.about
  const website = place.website
  const phone = place.phone
  const latitude = optionalNumber(placeData.lat)
  const longitude = optionalNumber(placeData.lng)
  const cardImageUrl = resolvedIdentity.imageUrl
  const mediaBackdropColor = place.mediaBackdropColor

  return {
    id: input.id,
    can_write: input.canWrite,
    slug: readRecordString(input.root, 'slug'),
    visibility,
    identity: {
      display_name: displayName,
      tagline,
      image_url: cardImageUrl,
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
    ...(themePalette ? { theme: { palette: themePalette } } : {}),
    ...(Object.keys(orders).length
      ? { orders: orders as KitchenOrdersConfig }
      : {}),
    fulfilment: input.fulfilment,
    sproochli: input.sproochli,
    display_name: displayName,
    name: displayName,
    ...(tagline ? { tagline } : {}),
    ...(shortName ? { short_name: shortName } : {}),
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

async function readKitchen(
  uid: string,
  id: string
): Promise<KitchenWorkspaceKitchen> {
  if (!isFirestoreDocumentId(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid Kitchen ID.' })
  }
  const db = getRuntimeFirestore()
  const rootRef = db.doc(`kitchens/${id}`)
  const teamRef = db.doc(`kitchens/${id}/team/${uid}`)
  const placeRef = db.doc(`places/${id}`)
  const [rootSnapshot, teamSnapshot, placeSnapshot] = await db.getAll(
    rootRef,
    teamRef,
    placeRef
  )

  if (!rootSnapshot.exists) {
    conflict(`Kitchen ${id} is missing its canonical root.`)
  }
  if (!teamSnapshot.exists) {
    conflict(`Kitchen ${id} is missing its Team membership.`)
  }

  const root = rootSnapshot.data() || {}
  const member = teamSnapshot.data() || {}
  const teamRole = text(member.role)
  if (
    text(member.user_id) !== uid ||
    member.status !== 'active' ||
    !['owner', 'operator', 'member'].includes(teamRole)
  ) {
    throw createError({
      statusCode: 403,
      statusMessage: `Kitchen ${id} requires active Team membership.`,
    })
  }

  return projectKitchen({
    id,
    canWrite: teamRole === 'owner' || teamRole === 'operator',
    fulfilment: await readKitchenFulfilment(db, id),
    sproochli: await readKitchenSproochliAttachment(db, id, root),
    root,
    place: placeSnapshot.exists ? placeSnapshot.data() || {} : null,
  })
}

async function readPrimaryKitchenId(uid: string, kitchenIds: string[]) {
  const snapshot = await getRuntimeFirestore()
    .doc(`users/${uid}/private/${PRIMARY_KITCHEN_DOCUMENT}`)
    .get()
  const stored = text(
    (snapshot.data() as PrimaryKitchenPreference | undefined)
      ?.primary_kitchen_id
  )
  if (kitchenIds.includes(stored)) return stored
  return kitchenIds.length === 1 ? kitchenIds[0]! : ''
}

export async function readKitchenWorkspaceKitchens(
  event: H3Event
): Promise<KitchenWorkspaceKitchensResponse> {
  const { uid } = await requireFirebaseBearerUser(
    event,
    'A Firebase identity is required to view Kitchens.',
    { allowAnonymous: true }
  )
  const kitchenIds = await readUserKitchenIds(uid)
  return {
    ok: true,
    family: 'kitchen',
    primary_kitchen_id: await readPrimaryKitchenId(uid, kitchenIds),
    items: await Promise.all(kitchenIds.map((id) => readKitchen(uid, id))),
  }
}

export async function readKitchenWorkspaceCurrent(
  event: H3Event,
  requestedId = ''
): Promise<KitchenWorkspaceCurrentResponse> {
  const { uid } = await requireFirebaseBearerUser(
    event,
    'A Firebase identity is required to view a Kitchen.',
    { allowAnonymous: true }
  )
  const kitchenIds = await readUserKitchenIds(uid)
  const kitchenId =
    requestedId && kitchenIds.includes(requestedId)
      ? requestedId
      : (kitchenIds[0] ?? '')
  return {
    ok: true,
    family: 'kitchen',
    current: kitchenId ? await readKitchen(uid, kitchenId) : null,
  }
}
