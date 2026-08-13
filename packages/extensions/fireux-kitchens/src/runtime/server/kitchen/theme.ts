// Concurrent edit — 2026-07-22 12:41 CEST — Canonical Kitchen theme write: revalidate fixed-runtime target and root ownership in one transaction.
import { FieldValue, type DocumentData } from 'firebase-admin/firestore'
import { createError, type H3Event } from 'h3'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import {
  readConsolePalette,
} from 'fireux-core/runtime/utils/brand-palette'
import type { PageStyle } from 'fireux-core/runtime/models/utils/style.model'
import type { ConsolePalette } from 'fireux-core/types/theme'
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
  const allowed = new Set(['kitchen_id', 'style', 'palette'])
  const unsupported = Object.keys(source).find((key) => !allowed.has(key))
  if (unsupported)
    badRequest(`Kitchen theme contains unsupported field: ${unsupported}.`)
  const hasStyle = Object.hasOwn(source, 'style')
  const style = hasStyle ? parseMenuPageStyleInput(source.style) : null
  if (style && 'error' in style) badRequest(style.error)
  const hasPalette = Object.hasOwn(source, 'palette')
  const palette = hasPalette ? readConsolePalette(source.palette) : null
  if (hasPalette && !palette) {
    badRequest('Console palette must provide exactly four valid colours.')
  }
  if (!hasStyle && !hasPalette) badRequest('Kitchen theme has no changes.')
  return {
    kitchenId: requireFirestoreDocumentId(source.kitchen_id, 'Kitchen id'),
    style: style && 'value' in style ? style.value : null,
    palette,
  }
}

function compactConsoleStyle(style: Partial<PageStyle>): Partial<PageStyle> {
  const next = { ...style }
  delete next.background_color_light
  delete next.background_color_dark
  delete next.font_color_light
  delete next.font_color_dark
  delete next.title_color_light
  delete next.title_color_dark
  delete next.primary_color
  delete next.secondary_color

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

      const compact = requested.style
        ? compactConsoleStyle(requested.style)
        : null
      const supportPatch: Record<string, unknown> = {
        ...(requested.palette
          ? { 'console.theme.palette': requested.palette as ConsolePalette }
          : {}),
        ...(compact
          ? {
              'console.menus.style': Object.keys(compact).length
                ? compact
                : FieldValue.delete(),
            }
          : {}),
        updated: serverAuditStamp({ by: actor.uid, appId: current.ownerAppId }),
      }
      mutations.update(current.supports, requested.kitchenId, supportPatch)

      const rootPatch: Record<string, unknown> = {}
      if (Object.hasOwn(current.rootData, 'menu_style')) {
        rootPatch.menu_style = FieldValue.delete()
      }
      if (Object.hasOwn(current.rootData, 'menus')) {
        const rootMenus = record(current.rootData.menus)
        if (Object.hasOwn(rootMenus, 'style')) {
          rootPatch['menus.style'] = FieldValue.delete()
        }
      }
      if (Object.keys(rootPatch).length) {
        mutations.update<DocumentData>(
          FIRESTORE_MUTATION_TARGETS.kitchens,
          requested.kitchenId,
          {
            ...rootPatch,
            updated: serverAuditStamp({ by: actor.uid, appId: current.ownerAppId }),
          }
        )
      }
      return {
        appId: current.ownerAppId,
        style: compact,
        palette: requested.palette,
      }
    }
  )

  return {
    ok: true as const,
    app_id: result.appId,
    kitchen_id: requested.kitchenId,
    ...(result.style && Object.keys(result.style).length
      ? { style: result.style }
      : {}),
    ...(result.palette ? { palette: result.palette } : {}),
  }
}
