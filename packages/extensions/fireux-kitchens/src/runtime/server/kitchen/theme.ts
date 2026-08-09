// Concurrent edit — 2026-07-22 12:41 CEST — Canonical Kitchen theme write: revalidate fixed-runtime target and root ownership in one transaction.
import { FieldValue, type DocumentData } from 'firebase-admin/firestore'
import { createError, type H3Event } from 'h3'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import {
  compactBrandPalette,
  parseBrandPalette,
} from 'fireux-core/runtime/utils/brand-palette'
import type { PageStyle } from 'fireux-core/runtime/models/utils/style.model'
import { FIRESTORE_MUTATION_TARGETS } from 'fireux-core/runtime/utils/firestore-mutations/targets'
import { parseMenuPageStyleInput } from '../menu/payload/page-style.ts'
import {
  readKitchenMutationActor,
  requireKitchenMutationAuthority,
} from './mutation-authority.ts'

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
  const actor = await readKitchenMutationActor(event)
  const result = await runGuardedServerTransaction(
    { kind: 'runtime' },
    async (mutations) => {
      const current = await requireKitchenMutationAuthority(
        mutations,
        actor,
        requested.kitchenId
      )

      const placePalette = parseBrandPalette(current.placeData.brand_palette)
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
        updated: serverAuditStamp({
          by: actor.uid,
          appId: current.ownerAppId,
        }),
      }
      if (Object.hasOwn(current.rootData, 'menu_style')) {
        rootPatch.menu_style = FieldValue.delete()
      }
      mutations.update<DocumentData>(
        FIRESTORE_MUTATION_TARGETS.kitchens,
        requested.kitchenId,
        rootPatch
      )

      const supportMenus = record(current.supportData.menus)
      const supportPatch: Record<string, unknown> = {}
      if (Object.hasOwn(supportMenus, 'style')) {
        supportPatch['menus.style'] = FieldValue.delete()
      }
      if (Object.hasOwn(current.supportData, 'menu_style')) {
        supportPatch.menu_style = FieldValue.delete()
      }
      if (Object.keys(supportPatch).length) {
        mutations.update(current.supports, requested.kitchenId, {
          ...supportPatch,
          updated: serverAuditStamp({
            by: actor.uid,
            appId: current.ownerAppId,
          }),
        })
      }
      return { appId: current.ownerAppId, style: compact }
    }
  )

  return {
    ok: true as const,
    app_id: result.appId,
    kitchen_id: requested.kitchenId,
    ...(Object.keys(result.style).length ? { style: result.style } : {}),
  }
}
