import { createError, type H3Event } from 'h3'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import {
  compactAppPalette,
  readAppPalette,
  readAppPaletteLayer,
  readWorkspacePalette,
  resolveAppPalette,
} from 'fireux-core/runtime/utils/brand-palette'
import { FIRESTORE_MUTATION_TARGETS } from 'fireux-core/runtime/utils/firestore-mutations/targets'
import type {
  AppPalette,
  AppTypography,
  WorkspacePalette,
} from 'fireux-core/types/theme'
import {
  readKitchenMutationActor,
  requireKitchenMutationAuthority,
} from '../core/mutation-authority.ts'

const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}

const text = (value: unknown) => String(value ?? '').trim()

function fail(statusCode: number, statusMessage: string): never {
  throw createError({ statusCode, statusMessage })
}

function typography(value: unknown): AppTypography | null {
  const source = record(value)
  if (
    Object.keys(source).some(
      (key) => key !== 'display_family' && key !== 'body_family'
    )
  )
    return null
  const displayFamily = text(source.display_family)
  const bodyFamily = text(source.body_family)
  if (
    !displayFamily ||
    !bodyFamily ||
    displayFamily.length > 200 ||
    bodyFamily.length > 200
  )
    return null
  return {
    display_family: displayFamily,
    body_family: bodyFamily,
  }
}

function media(value: unknown) {
  const source = record(value)
  return {
    logo_url: text(source.logo_url),
    wordmark_light_url: text(source.wordmark_light_url),
    wordmark_dark_url: text(source.wordmark_dark_url),
    cover_url: text(source.cover_url),
    thumbnail_url: text(source.thumbnail_url),
  }
}

function workspacePalette(value: unknown): WorkspacePalette | null {
  const kitchen = record(value)
  const theme = record(kitchen.theme)
  return readWorkspacePalette(theme.palette)
}

async function readContext(event: H3Event, kitchenId: string) {
  const actor = await readKitchenMutationActor(event)
  const db = getRuntimeFirestore()
  const root = await db.doc(`kitchens/${kitchenId}`).get()
  if (!root.exists) fail(404, 'Kitchen not found.')
  const management = record(root.data()?.management)
  if (management.mode !== 'app') {
    fail(409, 'This Kitchen does not have a dedicated App.')
  }
  const appId = requireFirestoreDocumentId(
    management.app_id,
    'Dedicated App id'
  )
  const [app, support, membership] = await Promise.all([
    db.doc(`apps/${appId}`).get(),
    db.doc(`apps/${appId}/kitchens/${kitchenId}`).get(),
    db.doc(`apps/${appId}/users/${actor.uid}`).get(),
  ])
  if (!app.exists) fail(409, 'The dedicated App record does not exist.')
  if (!support.exists)
    fail(409, 'The dedicated App Kitchen support does not exist.')
  const role = text(membership.get('role'))
  const supportData = support.data() || {}
  const operators = Array.isArray(supportData.operator_ids)
    ? supportData.operator_ids.map(text)
    : []
  if (!membership.exists || !['admin', 'user'].includes(role)) {
    fail(403, 'Dedicated App membership is required.')
  }
  if (role !== 'admin' && !operators.includes(actor.uid)) {
    fail(403, 'Dedicated App admin or Kitchen operator access is required.')
  }
  const appData = app.data() || {}
  const theme = record(appData.theme)
  const inheritedPalette = workspacePalette(root.data())
  const layer = readAppPaletteLayer(theme.palette)
  return {
    appId,
    canWrite: role === 'admin',
    appData,
    inheritedPalette,
    layer,
    effectivePalette:
      inheritedPalette && layer
        ? resolveAppPalette(inheritedPalette, layer)
        : null,
    typography: typography(theme.typography),
  }
}

export async function readKitchenAppTheme(event: H3Event, kitchenId: unknown) {
  const id = requireFirestoreDocumentId(kitchenId, 'Kitchen id')
  const context = await readContext(event, id)
  return {
    ok: true as const,
    kitchen_id: id,
    app_id: context.appId,
    can_write: context.canWrite,
    workspace_palette: context.inheritedPalette,
    app_palette: context.layer,
    effective_palette: context.effectivePalette,
    typography: context.typography,
    media: media(context.appData.media),
  }
}

function request(value: unknown) {
  const source = record(value)
  const unsupported = Object.keys(source).find(
    (key) => !['kitchen_id', 'palette', 'typography'].includes(key)
  )
  if (unsupported)
    fail(400, `App theme contains unsupported field: ${unsupported}.`)
  const kitchenId = requireFirestoreDocumentId(source.kitchen_id, 'Kitchen id')
  const palette = readAppPalette(source.palette)
  if (!palette)
    fail(400, 'App palette must provide exactly eight valid colours.')
  const fonts = typography(source.typography)
  if (!fonts) {
    fail(400, 'App typography must provide display_family and body_family.')
  }
  return { kitchenId, palette, typography: fonts }
}

export async function updateKitchenAppTheme(event: H3Event, value: unknown) {
  const requested = request(value)
  const actor = await readKitchenMutationActor(event)
  const result = await runGuardedServerTransaction(
    { kind: 'runtime' },
    async (mutations) => {
      const current = await requireKitchenMutationAuthority(
        mutations,
        actor,
        requested.kitchenId
      )
      const management = record(current.rootData.management)
      if (management.mode !== 'app') {
        fail(409, 'This Kitchen does not have a dedicated App.')
      }
      if (current.ownerRole !== 'admin') {
        fail(403, 'Dedicated App admin access is required.')
      }
      const inheritedPalette = workspacePalette(current.rootData)
      if (!inheritedPalette) {
        fail(409, 'Complete the Workspace palette before editing the App theme.')
      }
      const app = await mutations.read<Record<string, unknown>>(
        FIRESTORE_MUTATION_TARGETS.runtimeApps,
        current.ownerAppId
      )
      if (!app.exists) fail(409, 'The dedicated App record does not exist.')
      const compact = compactAppPalette(
        requested.palette as AppPalette,
        inheritedPalette
      )
      mutations.update(
        FIRESTORE_MUTATION_TARGETS.runtimeApps,
        current.ownerAppId,
        {
          'theme.palette': compact,
          'theme.typography': requested.typography,
          updated: serverAuditStamp({
            by: actor.uid,
            appId: current.ownerAppId,
          }),
        }
      )
      return { appId: current.ownerAppId, compact }
    }
  )
  return {
    ok: true as const,
    kitchen_id: requested.kitchenId,
    app_id: result.appId,
    app_palette: result.compact,
    effective_palette: requested.palette,
    typography: requested.typography,
  }
}
