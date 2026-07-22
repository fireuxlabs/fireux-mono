// Concurrent edit — 2026-07-21 20:57 CEST — Kitchen Console targets: project authorized roots without browser Firestore reads.
// Concurrent edit — 2026-07-22 12:35 CEST — Canonical Kitchen theme write: project resolved style and server-authorized write capability.
import {
  createError,
  defineEventHandler,
  setResponseHeaders,
  type H3Event,
} from 'h3'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig.ts'
import { requireFirebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer.ts'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'
import { isFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path.ts'
import { readRecordString } from 'fireux-core/runtime/server/utils/records/read.ts'
import { PlaceStorage } from 'fireux-places/runtime/models/place.model.ts'
import {
  type KitchenConsoleTargetItem,
  type KitchenConsoleTargetsResponse,
} from '../../../../models/kitchen/kitchen-index.model.ts'
import type {
  KitchenOrdersConfig,
  KitchenTablesConfig,
} from '../../../../models/kitchen.model.ts'
import { readKitchenOnboardingSupport } from '../../../../server/kitchen/onboarding-policy.ts'
import { resolveRuntimeKitchenTargetIds } from '../../../../server/kitchen/console-targets.ts'
import { menuKitchenIdentity } from '../../../../server/menu/ownership/kitchen-scope.ts'
import {
  readKitchenFulfilmentConfig,
  readKitchenIdentity,
  readKitchenMenusConfig,
  readKitchenVisibility,
} from '../../../../utils/kitchen-spine.ts'

type StoredRecord = Record<string, unknown>
type CanonicalKitchenScope = KitchenConsoleTargetItem['app_scope']

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
  data: StoredRecord
): CanonicalKitchenScope {
  const scope = record(data.app_scope)
  const keys = Object.keys(scope).sort()
  const state = scope.state
  const appId = text(scope.app_id)
  const hasLegacyScope = [
    'app_scope_state',
    'app_scope_app_id',
    'app_id',
  ].some(key => Object.hasOwn(data, key))

  if (
    hasLegacyScope ||
    keys.length !== 2 ||
    keys[0] !== 'app_id' ||
    keys[1] !== 'state' ||
    (state !== 'parent_app' && state !== 'tenant_app') ||
    !isFirestoreDocumentId(appId)
  ) {
    conflict(`Kitchen ${kitchenId} has an invalid canonical App scope.`)
  }

  return { state, app_id: appId }
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
  const supportIdentity = readKitchenIdentity(input.support)
  const placeIdentity = readKitchenIdentity(input.place)
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
  const menus = readKitchenMenusConfig(input.root)
  const resolvedMenuStyle = record(resolvedIdentity.page_style)
  const gallery = placeIdentity.gallery.length
    ? placeIdentity.gallery
    : supportIdentity.gallery.length
      ? supportIdentity.gallery
      : rootIdentity.gallery
  const tagline =
    supportIdentity.tagline ||
    rootIdentity.tagline ||
    readRecordString(input.place, 'brand_tagline')
  const orders = record(input.root.orders)
  const tables = record(input.root.tables)
  const shortName = readRecordString(input.place, 'short_name')
  const brandTagline = readRecordString(input.place, 'brand_tagline')
  const formattedAddress = readRecordString(input.place, 'formatted_address')
  const shortAddress = readRecordString(input.place, 'short_address')
  const claimedBy = readRecordString(input.root, 'claimed_by')
  const about = readRecordString(input.place, 'about')
  const website = readRecordString(input.place, 'website')
  const phone = readRecordString(input.place, 'phone')
  const latitude = optionalNumber(input.place.lat)
  const longitude = optionalNumber(input.place.lng)

  return {
    id: input.id,
    can_write: input.canWrite,
    app_scope: input.scope,
    place_id: readRecordString(input.root, 'place_id'),
    slug: readRecordString(input.root, 'slug'),
    visibility: {
      show: visibility.show,
      active: visibility.active,
      is_test: visibility.isTest,
    },
    identity: {
      display_name: displayName,
      tagline,
      image_url: resolvedIdentity.imageUrl,
      image_shade: resolvedIdentity.imageShade,
      ...(resolvedIdentity.wordmarkImageUrl
        ? { wordmark_image_url: resolvedIdentity.wordmarkImageUrl }
        : {}),
      gallery,
    },
    menus: {
      currency_format: menus.currencyFormat,
      show_currency: menus.showCurrency,
      available: menus.available,
      ...(Object.keys(resolvedMenuStyle).length
        ? { style: resolvedMenuStyle }
        : {}),
    },
    ...(Object.keys(orders).length
      ? { orders: orders as KitchenOrdersConfig }
      : {}),
    ...(Object.keys(tables).length
      ? { tables: tables as KitchenTablesConfig }
      : {}),
    fulfilment: readKitchenFulfilmentConfig(input.root),
    show: visibility.show,
    active: visibility.active,
    is_test_kitchen: visibility.isTest,
    display_name: displayName,
    name: displayName,
    ...(tagline ? { tagline } : {}),
    ...(shortName ? { short_name: shortName } : {}),
    ...(brandTagline ? { brand_tagline: brandTagline } : {}),
    ...(formattedAddress ? { formatted_address: formattedAddress } : {}),
    ...(shortAddress ? { short_address: shortAddress } : {}),
    ...(resolvedIdentity.imageUrl
      ? { image_url: resolvedIdentity.imageUrl }
      : {}),
    ...(resolvedIdentity.imageUrl
      ? { image_shade: resolvedIdentity.imageShade }
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
    const { appId } = useFireUXConfig()
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

    const targetIds = resolveRuntimeKitchenTargetIds(event, currentMembership)
    if (!targetIds.length) {
      setResponseHeaders(event, {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'private, no-store',
      })
      return { ok: true, appId, items: [] }
    }

    const rootSnapshots = await db.getAll(
      ...targetIds.map(id => db.doc(`kitchens/${id}`))
    )
    const roots = new Map(
      rootSnapshots.map(snapshot => [snapshot.id, snapshot])
    )
    const scopes = new Map<string, CanonicalKitchenScope>()
    const relatedRefs = new Map<string, ReturnType<typeof db.doc>>()

    for (const id of targetIds) {
      const rootSnapshot = roots.get(id)
      if (!rootSnapshot?.exists) {
        conflict(`Kitchen target ${id} is missing its canonical root.`)
      }
      const root = rootSnapshot.data() || {}
      const scope = readCanonicalKitchenScope(id, root)
      const placeId = readRecordString(root, 'place_id')
      if (!isFirestoreDocumentId(placeId)) {
        conflict(`Kitchen ${id} has an invalid canonical Place reference.`)
      }

      scopes.set(id, scope)
      for (const ref of [
        db.doc(`apps/${scope.app_id}/kitchens/${id}`),
        db.doc(`apps/${scope.app_id}/users/${uid}`),
        db.doc(`${PlaceStorage.collection}/${placeId}`),
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
      const supportPath = `apps/${scope.app_id}/kitchens/${id}`
      const membershipPath = `apps/${scope.app_id}/users/${uid}`
      const placeId = readRecordString(root, 'place_id')
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
    return { ok: true, appId, items }
  }
)
