// Concurrent edit — 2026-07-22 12:41 CEST — Canonical Kitchen theme write: revalidate fixed-runtime target and root ownership in one transaction.
import { useRuntimeConfig } from '#imports'
import { FieldValue } from 'firebase-admin/firestore'
import { createError, type H3Event } from 'h3'
import { requireFirebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import {
  compactBrandPalette,
  parseBrandPalette,
} from 'fireux-core/runtime/utils/brand-palette'
import type { PageStyle } from 'fireux-core/runtime/models/utils/style.model'
import { KitchenStorage } from '../../models/kitchen.model.ts'
import { parseMenuPageStyleInput } from '../menu/payload/page-style.ts'
import {
  readKitchenOnboardingScope,
  readKitchenOnboardingSupport,
} from './onboarding-policy.ts'
import { resolveKitchenConsoleTargetIds } from './console-targets.ts'

const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}

function badRequest(statusMessage: string): never {
  throw createError({ statusCode: 400, statusMessage })
}

function request(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    badRequest('Kitchen theme request must be an object.')
  }
  const source = value as Record<string, unknown>
  const allowed = new Set(['kitchen_id', 'style'])
  const unsupported = Object.keys(source).find((key) => !allowed.has(key))
  if (unsupported)
    badRequest(`Kitchen theme contains unsupported field: ${unsupported}.`)
  const style = parseMenuPageStyleInput(source.style)
  if ('error' in style) badRequest(style.error)
  return {
    kitchenId: requireFirestoreDocumentId(source.kitchen_id, 'Kitchen id'),
    style: style.value,
  }
}

function memberRole(
  exists: boolean,
  value: unknown,
  statusMessage: string
): 'admin' | 'user' {
  const role = String(value ?? '').trim()
  if (!exists || (role !== 'admin' && role !== 'user')) {
    throw createError({ statusCode: 403, statusMessage })
  }
  return role
}

function compactRootStyle(
  style: Partial<PageStyle>,
  placePalette: unknown
): Partial<PageStyle> {
  const next = { ...style }
  delete next.primary_color
  delete next.secondary_color
  Object.assign(next, compactBrandPalette(style, placePalette))

  if (next.font_source === 'system' && !next.font_family) {
    delete next.font_source
  }
  if (next.title_font_source === 'system' && !next.title_font_family) {
    delete next.title_font_source
  }
  return next
}

export async function updateKitchenTheme(event: H3Event, input: unknown) {
  const requested = request(input)
  const runtimeAppId = requireFirestoreDocumentId(
    useRuntimeConfig(event).public?.fireux?.id,
    'Runtime App id'
  )
  const { uid } = await requireFirebaseBearerUser(
    event,
    'Sign in to manage this Kitchen.'
  )
  const db = getRuntimeFirestore()
  const rootRef = db
    .collection(KitchenStorage.rootCollection)
    .doc(requested.kitchenId)
  const runtimeMembershipRef = db.doc(`apps/${runtimeAppId}/users/${uid}`)

  const result = await db.runTransaction(async (transaction) => {
    const [root, runtimeMembership] = await Promise.all([
      transaction.get(rootRef),
      transaction.get(runtimeMembershipRef),
    ])
    if (!root.exists) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Kitchen not found.',
      })
    }
    memberRole(
      runtimeMembership.exists,
      runtimeMembership.get('role'),
      'Current App membership is required to manage this Kitchen.'
    )
    const runtimeTargetIds = await resolveKitchenConsoleTargetIds(
      runtimeAppId,
      uid,
      runtimeMembership.data() || {}
    )
    if (!runtimeTargetIds.includes(requested.kitchenId)) {
      throw createError({
        statusCode: 403,
        statusMessage: 'This Kitchen is not an available Console target.',
      })
    }

    const scope = readKitchenOnboardingScope(root.data() || {})
    if (scope.state !== 'parent_app' && scope.state !== 'tenant_app') {
      throw createError({
        statusCode: 409,
        statusMessage: 'The Kitchen is not attached to an App.',
      })
    }
    const ownerAppId = requireFirestoreDocumentId(
      scope.appId,
      'Kitchen owner App id'
    )
    const ownerMembershipRef = db.doc(`apps/${ownerAppId}/users/${uid}`)
    const supportRef = db.doc(
      `apps/${ownerAppId}/${KitchenStorage.scopeCollection}/${requested.kitchenId}`
    )
    const [ownerMembership, support] = await Promise.all([
      ownerMembershipRef.path === runtimeMembershipRef.path
        ? Promise.resolve(runtimeMembership)
        : transaction.get(ownerMembershipRef),
      transaction.get(supportRef),
    ])
    const ownerRole = memberRole(
      ownerMembership.exists,
      ownerMembership.get('role'),
      'Kitchen owner App membership is required.'
    )
    if (!support.exists) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Kitchen not found.',
      })
    }
    const authority = readKitchenOnboardingSupport(support.data() || {})
    if (
      !authority ||
      (ownerRole !== 'admin' && !authority.operatorIds.includes(uid))
    ) {
      throw createError({
        statusCode: 403,
        statusMessage: 'App admin or Kitchen operator access is required.',
      })
    }

    const placeId = requireFirestoreDocumentId(
      root.get('place_id'),
      'Kitchen Place id'
    )
    const placeRef = db.doc(`places/${placeId}`)
    const place = await transaction.get(placeRef)
    if (!place.exists) {
      throw createError({
        statusCode: 409,
        statusMessage: 'The linked Place does not exist.',
      })
    }

    const placePalette = parseBrandPalette(place.get('brand_palette'))
    if (!placePalette.ok) {
      throw createError({
        statusCode: 409,
        statusMessage: 'The linked Place brand palette needs repair.',
      })
    }
    const compact = compactRootStyle(requested.style, placePalette.value)
    const rootPatch: Record<string, unknown> = {
      'menus.style': Object.keys(compact).length
        ? compact
        : FieldValue.delete(),
      updated: serverAuditStamp({ by: uid, appId: ownerAppId }),
    }
    if (Object.hasOwn(root.data() || {}, 'menu_style')) {
      rootPatch.menu_style = FieldValue.delete()
    }
    transaction.update(rootRef, rootPatch)

    const supportMenus = record(support.get('menus'))
    const supportData = support.data() || {}
    const supportPatch: Record<string, unknown> = {}
    if (Object.hasOwn(supportMenus, 'style')) {
      supportPatch['menus.style'] = FieldValue.delete()
    }
    if (Object.hasOwn(supportData, 'menu_style')) {
      supportPatch.menu_style = FieldValue.delete()
    }
    if (Object.keys(supportPatch).length) {
      transaction.update(supportRef, {
        ...supportPatch,
        updated: serverAuditStamp({ by: uid, appId: ownerAppId }),
      })
    }
    return { appId: ownerAppId, style: compact }
  })

  return {
    ok: true as const,
    app_id: result.appId,
    kitchen_id: requested.kitchenId,
    ...(Object.keys(result.style).length ? { style: result.style } : {}),
  }
}
