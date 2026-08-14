// Concurrent edit — 2026-07-21 20:57 CEST — Kitchen Console targets: project authorized roots without browser Firestore reads.
// Concurrent edit — 2026-07-22 12:35 CEST — Canonical Kitchen theme write: project resolved style and server-authorized write capability.
import {
  createError,
  defineEventHandler,
  setResponseHeaders,
  type H3Event,
} from 'h3'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { requireFirebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import { isFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { readRecordString } from 'fireux-core/runtime/server/utils/records/read'
import { PlaceStorage } from 'fireux-places/runtime/models/place.model'
import { readPlacePresentation } from 'fireux-places/runtime/utils/place-spine'
import {
  type KitchenConsoleTargetItem,
  type KitchenConsoleTargetsResponse,
} from '../../../../models/kitchen/kitchen-index.model.ts'
import type {
  KitchenOrdersConfig,
  KitchenTablesConfig,
} from '../../../../models/kitchen.model.ts'
import { readKitchenOnboardingSupport } from '../../../../server/kitchen/onboarding-policy.ts'
import {
  readFireuxEntityManagement,
  resolveFireuxEntityManagementAppId,
} from 'fireux-core/runtime/utils/entity-management'
import { resolveKitchenConsoleTargetIds } from '../../../../server/kitchen/console-targets.ts'
import { menuKitchenIdentity } from '../../../../server/menu/ownership/kitchen-scope.ts'
import {
  readKitchenFulfilmentConfig,
  readKitchenIdentity,
  readKitchenMenusConfig,
  readKitchenSproochliConfig,
  readKitchenVisibility,
  readKitchenConsolePalette,
} from '../../../../utils/kitchen-spine.ts'

type StoredRecord = Record<string, unknown>
type CanonicalKitchenScope = {
  management: KitchenConsoleTargetItem['management']
  appId: string
}

const text = (value: unknown) => String(value ?? '').trim()
const record = (value: unknown): StoredRecord =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? value as StoredRecord
    : {}

function conflict(statusMessage: string): never {
  throw createError({ statusCode: 409, statusMessage })
}

function readCanonicalKitchenScope(
  kitchenId: string,
  data: StoredRecord,
  ecosystem: string
): CanonicalKitchenScope {
  const hasRetiredScope = [
    'app_scope',
    'app_scope_state',
    'app_scope_app_id',
    'app_id',
    'console',
  ].some(key => Object.hasOwn(data, key))
  const management = readFireuxEntityManagement(data.management)
  const appId = management
    ? resolveFireuxEntityManagementAppId(management, ecosystem)
    : ''

  if (
    hasRetiredScope ||
    !management ||
    management.mode === 'root' ||
    !isFirestoreDocumentId(appId)
  ) {
    conflict(`Kitchen ${kitchenId} has an invalid canonical App scope.`)
  }

  return {
    management,
    appId,
  }
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
  support: StoredRecord
  place: StoredRecord
  scope: CanonicalKitchenScope
}): KitchenConsoleTargetItem {
  const rootIdentity = readKitchenIdentity(input.root)
  const place = readPlacePresentation(input.place)
  const resolvedIdentity = menuKitchenIdentity(
    input.root,
    input.support,
    input.place
  )
  const displayName = text(resolvedIdentity.name)
  if (!displayName) {
    conflict(`Kitchen ${input.id} has no usable canonical identity.`)
  }

  const visibility = readKitchenVisibility(input.root)
  const menus = readKitchenMenusConfig(input.support)
  const resolvedMenuStyle = record(resolvedIdentity.page_style)
  const gallery = place.gallery
  const tagline =
    rootIdentity.tagline ||
    place.brandTagline
  const supportConsole = record(input.support.console)
  const consolePalette = readKitchenConsolePalette(input.support)
  const orders = record(supportConsole.orders)
  const tables = record(supportConsole.tables)
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
  const cardImageUrl = rootIdentity.cardImageUrl || resolvedIdentity.imageUrl
  const mediaBackdropColor =
    rootIdentity.mediaBackdropColor ||
    place.mediaBackdropColor

  return {
    id: input.id,
    can_write: input.canWrite,
    management: input.scope.management,
    place_id: input.id,
    slug: readRecordString(input.root, 'slug'),
    visibility,
    identity: {
      display_name: displayName,
      tagline,
      image_url: cardImageUrl,
      ...(rootIdentity.cardImageUrl
        ? { card_image_url: rootIdentity.cardImageUrl }
        : {}),
      ...(rootIdentity.logoImageUrl
        ? { logo_image_url: rootIdentity.logoImageUrl }
        : {}),
      ...(mediaBackdropColor
        ? { media_backdrop_color: mediaBackdropColor }
        : {}),
      ...(resolvedIdentity.wordmarkImageUrl
        ? { wordmark_image_url: resolvedIdentity.wordmarkImageUrl }
        : {}),
      gallery,
    },
    menus: {
      currency_format: menus.currencyFormat,
      show_currency: menus.showCurrency,
      available: menus.available,
      ...(menus.primaryMenuId
        ? { primary_menu_id: menus.primaryMenuId }
        : {}),
      ...(menus.specialsEnabled ? { specials_enabled: true } : {}),
      ...(menus.specialsMenuId
        ? { specials_menu_id: menus.specialsMenuId }
        : {}),
      ...(Object.keys(resolvedMenuStyle).length
        ? { style: resolvedMenuStyle }
        : {}),
    },
    ...(consolePalette ? { console_theme: { palette: consolePalette } } : {}),
    ...(Object.keys(orders).length
      ? { orders: orders as KitchenOrdersConfig }
      : {}),
    ...(Object.keys(tables).length
      ? { tables: tables as KitchenTablesConfig }
      : {}),
    fulfilment: readKitchenFulfilmentConfig(input.support),
    sproochli: readKitchenSproochliConfig(input.support),
    display_name: displayName,
    name: displayName,
    ...(tagline ? { tagline } : {}),
    ...(shortName ? { short_name: shortName } : {}),
    ...(brandTagline ? { brand_tagline: brandTagline } : {}),
    ...(formattedAddress ? { formatted_address: formattedAddress } : {}),
    ...(shortAddress ? { short_address: shortAddress } : {}),
    ...(cardImageUrl
      ? { image_url: cardImageUrl }
      : {}),
    ...(rootIdentity.cardImageUrl && mediaBackdropColor
      ? { media_backdrop_color: mediaBackdropColor }
      : {}),
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

export default defineEventHandler(
  async (event: H3Event): Promise<KitchenConsoleTargetsResponse> => {
    const { uid } = await requireFirebaseBearerUser(
      event,
      'Sign in to view Kitchen targets.'
    )
    const { appId, ecosystem, isGlobal } = useFireUXConfig()
    const db = getRuntimeFirestore()
    const currentMembershipRef = db.doc(`apps/${appId}/users/${uid}`)
    const currentMembershipSnapshot = await currentMembershipRef.get()
    const currentMembership = currentMembershipSnapshot.data() || {}
    const currentRole = text(currentMembership.role)
    if (
      !currentMembershipSnapshot.exists ||
      (currentRole !== 'admin' && currentRole !== 'user')
    ) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Current App membership is required.',
      })
    }

    const indexedTargetIds = await resolveKitchenConsoleTargetIds(
      uid,
      currentMembership
    )
    if (!indexedTargetIds.length) {
      setResponseHeaders(event, {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'private, no-store',
      })
      return { ok: true, appId, family: 'kitchen', items: [] }
    }

    const rootSnapshots = await db.getAll(
      ...indexedTargetIds.map(id => db.doc(`kitchens/${id}`))
    )
    const roots = new Map(
      rootSnapshots.map(snapshot => [snapshot.id, snapshot])
    )
    const scopes = new Map<string, CanonicalKitchenScope>()
    const relatedRefs = new Map<string, ReturnType<typeof db.doc>>()

    for (const id of indexedTargetIds) {
      const rootSnapshot = roots.get(id)
      if (!rootSnapshot?.exists) {
        conflict(`Kitchen target ${id} is missing its canonical root.`)
      }
      const root = rootSnapshot.data() || {}
      const scope = readCanonicalKitchenScope(id, root, ecosystem)
      scopes.set(id, scope)
    }

    const targetIds = isGlobal
      ? indexedTargetIds
      : indexedTargetIds.filter(id => scopes.get(id)?.appId === appId)
    for (const id of targetIds) {
      const scope = scopes.get(id)!
      for (const ref of [
        db.doc(`apps/${scope.appId}/kitchens/${id}`),
        db.doc(`apps/${scope.appId}/users/${uid}`),
        db.doc(`${PlaceStorage.collection}/${id}`),
      ]) {
        relatedRefs.set(ref.path, ref)
      }
    }

    const relatedSnapshots = await db.getAll(...relatedRefs.values())
    const related = new Map(
      relatedSnapshots.map(snapshot => [snapshot.ref.path, snapshot])
    )
    const items = targetIds.map((id) => {
      const rootSnapshot = roots.get(id)!
      const root = rootSnapshot.data() || {}
      const scope = scopes.get(id)!
      const supportPath = `apps/${scope.appId}/kitchens/${id}`
      const membershipPath = `apps/${scope.appId}/users/${uid}`
      const placeId = id
      const placePath = `${PlaceStorage.collection}/${placeId}`
      const supportSnapshot = related.get(supportPath)
      const membershipSnapshot = related.get(membershipPath)
      const placeSnapshot = related.get(placePath)

      if (!supportSnapshot?.exists) {
        conflict(`Kitchen target ${id} is missing its same-id App support.`)
      }
      if (!placeSnapshot?.exists) {
        conflict(`Kitchen target ${id} is missing its canonical Place.`)
      }
      const support = supportSnapshot.data() || {}
      const authority = readKitchenOnboardingSupport(support)
      if (!authority) {
        conflict(`Kitchen target ${id} has invalid App support.`)
      }
      const scopedRole = text(membershipSnapshot?.get('role'))
      if (
        !membershipSnapshot?.exists ||
        (scopedRole !== 'admin' && scopedRole !== 'user')
      ) {
        throw createError({
          statusCode: 403,
          statusMessage: `Kitchen target ${id} requires scoped App membership.`,
        })
      }
      if (
        scopedRole !== 'admin' &&
        !authority.operatorIds.includes(uid) &&
        !authority.teamIds.includes(uid)
      ) {
        throw createError({
          statusCode: 403,
          statusMessage: `Kitchen target ${id} requires operator access.`,
        })
      }

      return projectKitchenTarget({
        id,
        canWrite:
          scopedRole === 'admin' || authority.operatorIds.includes(uid),
        root,
        support,
        place: placeSnapshot.data() || {},
        scope,
      })
    })

    setResponseHeaders(event, {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'private, no-store',
    })
    return { ok: true, appId, family: 'kitchen', items }
  }
)
