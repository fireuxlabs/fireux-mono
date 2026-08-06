// Concurrent edit — 2026-07-22 12:41 CEST — Canonical Kitchen theme write: revalidate fixed-runtime target and root ownership in one transaction.
import { useRuntimeConfig } from '#imports'
import { FieldValue, type DocumentData } from 'firebase-admin/firestore'
import { createError, type H3Event } from 'h3'
import { requireFirebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import {
  compactBrandPalette,
  parseBrandPalette,
} from 'fireux-core/runtime/utils/brand-palette'
import type { PageStyle } from 'fireux-core/runtime/models/utils/style.model'
import {
  FIRESTORE_MUTATION_TARGETS,
  serverAppKitchensTarget,
  serverAppUsersTarget,
} from 'fireux-core/runtime/utils/firestore-mutations/targets'
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
  const result = await runGuardedServerTransaction(
    { kind: 'runtime' },
    async (mutations) => {
      const runtimeMemberships = serverAppUsersTarget(runtimeAppId)
      const [root, runtimeMembership] = await Promise.all([
        mutations.read(
          FIRESTORE_MUTATION_TARGETS.kitchens,
          requested.kitchenId
        ),
        mutations.read(runtimeMemberships, uid),
      ])
      if (!root.exists) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Kitchen not found.',
        })
      }
      memberRole(
        runtimeMembership.exists,
        runtimeMembership.data?.role,
        'Current App membership is required to manage this Kitchen.'
      )
      const runtimeTargetIds = await resolveKitchenConsoleTargetIds(
        uid,
        runtimeMembership.data || {}
      )
      if (!runtimeTargetIds.includes(requested.kitchenId)) {
        throw createError({
          statusCode: 403,
          statusMessage: 'This Kitchen is not an available Console target.',
        })
      }

      const rootData = root.data || {}
      const scope = readKitchenOnboardingScope(rootData)
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
      const ownerMemberships = serverAppUsersTarget(ownerAppId)
      const supports = serverAppKitchensTarget(ownerAppId)
      const [ownerMembership, support] = await Promise.all([
        ownerAppId === runtimeAppId
          ? Promise.resolve(runtimeMembership)
          : mutations.read(ownerMemberships, uid),
        mutations.read(supports, requested.kitchenId),
      ])
      const ownerRole = memberRole(
        ownerMembership.exists,
        ownerMembership.data?.role,
        'Kitchen owner App membership is required.'
      )
      if (!support.exists) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Kitchen not found.',
        })
      }
      const supportData = support.data || {}
      const authority = readKitchenOnboardingSupport(supportData)
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
        rootData.place_id,
        'Kitchen Place id'
      )
      const place = await mutations.read(
        FIRESTORE_MUTATION_TARGETS.places,
        placeId
      )
      if (!place.exists) {
        throw createError({
          statusCode: 409,
          statusMessage: 'The linked Place does not exist.',
        })
      }

      const placePalette = parseBrandPalette(place.data?.brand_palette)
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
      if (Object.hasOwn(rootData, 'menu_style')) {
        rootPatch.menu_style = FieldValue.delete()
      }
      mutations.update<DocumentData>(
        FIRESTORE_MUTATION_TARGETS.kitchens,
        requested.kitchenId,
        rootPatch
      )

      const supportMenus = record(supportData.menus)
      const supportPatch: Record<string, unknown> = {}
      if (Object.hasOwn(supportMenus, 'style')) {
        supportPatch['menus.style'] = FieldValue.delete()
      }
      if (Object.hasOwn(supportData, 'menu_style')) {
        supportPatch.menu_style = FieldValue.delete()
      }
      if (Object.keys(supportPatch).length) {
        mutations.update(supports, requested.kitchenId, {
          ...supportPatch,
          updated: serverAuditStamp({ by: uid, appId: ownerAppId }),
        })
      }
      return { appId: ownerAppId, style: compact }
    }
  )

  return {
    ok: true as const,
    app_id: result.appId,
    kitchen_id: requested.kitchenId,
    ...(Object.keys(result.style).length ? { style: result.style } : {}),
  }
}
