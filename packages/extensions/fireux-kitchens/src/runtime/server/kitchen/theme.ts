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
import { kitchenRootTarget } from './firestore-targets'
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

function splitKitchenTheme(
  style: Partial<PageStyle>,
  placePalette: unknown
): { brandPalette: Partial<PageStyle>; menuStyle: Partial<PageStyle> } {
  const brandPalette = compactBrandPalette(style, placePalette)
  const menuStyle = { ...style }
  delete menuStyle.primary_color
  delete menuStyle.secondary_color

  if (menuStyle.font_source === 'system' && !menuStyle.font_family) {
    delete menuStyle.font_source
  }
  if (menuStyle.title_font_source === 'system' && !menuStyle.title_font_family) {
    delete menuStyle.title_font_source
  }
  return { brandPalette, menuStyle }
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
      const theme = splitKitchenTheme(requested.style, placePalette.value)
      const rootPatch: Record<string, unknown> = {
        brand_palette: Object.keys(theme.brandPalette).length
          ? theme.brandPalette
          : FieldValue.delete(),
        updated: serverAuditStamp({
          by: actor.uid,
          appId: current.ownerAppId,
        }),
      }
      mutations.update<DocumentData>(
        kitchenRootTarget,
        requested.kitchenId,
        rootPatch
      )

      mutations.update(current.supports, requested.kitchenId, {
        'console.menus.style': Object.keys(theme.menuStyle).length
          ? theme.menuStyle
          : FieldValue.delete(),
        updated: serverAuditStamp({
          by: actor.uid,
          appId: current.ownerAppId,
        }),
      })
      return {
        appId: current.ownerAppId,
        style: { ...theme.menuStyle, ...theme.brandPalette },
      }
    }
  )

  return {
    ok: true as const,
    app_id: result.appId,
    kitchen_id: requested.kitchenId,
    ...(Object.keys(result.style).length ? { style: result.style } : {}),
  }
}
