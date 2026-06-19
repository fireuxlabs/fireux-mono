import {
  createError,
  defineEventHandler,
  getQuery,
  getRouterParam,
} from 'h3'
import { useRuntimeConfig } from '#imports'
import { readRecordString } from 'fireux-core/runtime/server/utils/records/read.ts'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'
import {
  publicMenuCreatorLabel,
  publicMenuFromData,
  publicMenuOwnerAppView,
  publicMenuPayloadFromApi,
  publicMenuSourceFromData,
  readPublicMenuCreatorLabels,
} from '../../utils/public-menus.ts'

const text = (value: unknown) => String(value ?? '').trim()

type RootMenuKitchenScope = {
  kitchenId?: string
  kitchenSlug?: string
  kitchenName?: string
  kitchenAppId?: string
  kitchenMenuId?: string
  createdByLabel?: string
}

const currentAppId = () => {
  const fireux = (useRuntimeConfig().public?.fireux ?? {}) as Record<string, unknown>
  return text(fireux.id)
}

const resolveSourceAppId = (
  kitchenData: Record<string, unknown>,
  fallbackAppId: string
) => readRecordString(kitchenData, 'app_scope_app_id') || fallbackAppId

const kitchenDisplayName = (data: Record<string, unknown>) =>
  readRecordString(data, 'display_name') ||
  readRecordString(data, 'name') ||
  readRecordString(data, 'short_name')

const apiTo = (view: unknown) =>
  view && typeof view === 'object' && 'apiTo' in view
    ? text((view as Record<string, unknown>).apiTo)
    : ''

async function readOwnerAppView(options: {
  ownerAppId: string
  kitchenSlug: string
  menuId: string
}) {
  if (!options.ownerAppId || !options.kitchenSlug || !options.menuId) {
    return {}
  }

  const db = getRuntimeFirestore()
  const [appSnap, kitchenCountSnap] = await Promise.all([
    db.collection('apps').doc(options.ownerAppId).get(),
    db.collection(`apps/${options.ownerAppId}/kitchens`).count().get(),
  ])

  return publicMenuOwnerAppView({
    ownerAppId: options.ownerAppId,
    currentAppId: currentAppId(),
    ownerAppData: appSnap.exists ? appSnap.data() || {} : {},
    ownerAppKitchenCount: Number(kitchenCountSnap.data().count || 0),
    kitchenSlug: options.kitchenSlug,
    menuId: options.menuId,
  })
}

async function readRootMenuKitchenScope(
  data: Record<string, unknown>
): Promise<RootMenuKitchenScope> {
  const source = publicMenuSourceFromData(data)
  const kitchenId = source.kitchen_id || ''
  const kitchenSlug = source.kitchen_slug || ''
  if (!kitchenId && !kitchenSlug) return {}

  const db = getRuntimeFirestore()
  const snap = kitchenId
    ? await db.collection('kitchens').doc(kitchenId).get()
    : (await db
        .collection('kitchens')
        .where('slug', '==', kitchenSlug.toLowerCase())
        .limit(1)
        .get()).docs[0]

  const kitchenData = snap?.exists ? snap.data() || {} : {}
  const resolvedKitchenId = snap?.exists ? snap.id : kitchenId
  const resolvedKitchenSlug = readRecordString(kitchenData, 'slug') || kitchenSlug

  return {
    kitchenId: resolvedKitchenId,
    kitchenSlug: resolvedKitchenSlug,
    kitchenName: kitchenDisplayName(kitchenData),
    kitchenAppId:
      source.app_id ||
      resolveSourceAppId(kitchenData, currentAppId()),
    kitchenMenuId: source.menu_id || '',
    createdByLabel: '',
  }
}

async function readKitchenPublicMenu(menuId: string, kitchenSlug: string) {
  const db = getRuntimeFirestore()
  const rootKitchenSnap = await db
    .collection('kitchens')
    .where('slug', '==', kitchenSlug.toLowerCase())
    .limit(1)
    .get()
  const kitchenDoc = rootKitchenSnap.docs[0]

  if (!kitchenDoc) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Kitchen not found.',
    })
  }

  const kitchenData = kitchenDoc.data() || {}
  const kitchenAppId = resolveSourceAppId(kitchenData, currentAppId())
  const ownerAppView = await readOwnerAppView({
    ownerAppId: kitchenAppId,
    kitchenSlug,
    menuId,
  })
  const ownerPayload = await publicMenuPayloadFromApi(apiTo(ownerAppView))
  const menuSnap = await db
    .collection(`apps/${kitchenAppId}/kitchens/${kitchenDoc.id}/menus`)
    .doc(menuId)
    .get()

  if (!menuSnap.exists) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Menu not found.',
    })
  }

  const data = menuSnap.data() || {}
  if (readRecordString(data, 'status') !== 'published') {
    throw createError({
      statusCode: 404,
      statusMessage: 'Menu not found.',
    })
  }

  return publicMenuFromData(menuId, data, {
    kitchenId: kitchenDoc.id,
    kitchenSlug,
    kitchenName: kitchenDisplayName(kitchenData),
    kitchenAppId,
    kitchenMenuId: menuId,
    sourceKind:
      readRecordString(data, 'source_kind') ||
      (readRecordString(data, 'doc_url') ? '' : 'kitchen-menu'),
    path: `/kitchens/${encodeURIComponent(kitchenSlug)}/menus/${encodeURIComponent(menuId)}`,
    ...ownerAppView,
    ...ownerPayload,
  })
}

async function readPublicMenuSurface(menuId: string) {
  const db = getRuntimeFirestore()
  const snap = await db.collection('menus').doc(menuId).get()

  if (!snap.exists) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Menu not found.',
    })
  }

  const data = snap.data() || {}
  const createdBy = readRecordString(data, 'created_by')
  const creatorLabels = await readPublicMenuCreatorLabels([createdBy])
  const kitchenScope = await readRootMenuKitchenScope(data)
  const source = publicMenuSourceFromData(data, kitchenScope)
  const ownerAppView = await readOwnerAppView({
    ownerAppId: source.app_id || '',
    kitchenSlug: source.kitchen_slug || '',
    menuId: source.menu_id || menuId,
  })
  const ownerPayload = await publicMenuPayloadFromApi(apiTo(ownerAppView))

  return publicMenuFromData(menuId, data, {
    ...kitchenScope,
    ...ownerAppView,
    ...ownerPayload,
    createdByLabel:
      kitchenScope.createdByLabel ??
      publicMenuCreatorLabel(createdBy, creatorLabels),
  })
}

export default defineEventHandler(async (event) => {
  const menuId = text(getRouterParam(event, 'menuId'))
  const kitchenSlug = text(getQuery(event).kitchenSlug)
  if (!menuId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Menu path is required.',
    })
  }

  if (kitchenSlug) {
    return readKitchenPublicMenu(menuId, kitchenSlug)
  }

  return readPublicMenuSurface(menuId)
})
