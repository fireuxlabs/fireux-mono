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
  readPublicMenuCreatorLabels,
} from '../../utils/public-menus.ts'

const text = (value: unknown) => String(value ?? '').trim()

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
  const kitchenAppId = readRecordString(data, 'kitchen_app_id')
  const kitchenId = readRecordString(data, 'kitchen_id')
  const kitchenMenuId = readRecordString(data, 'kitchen_menu_id')

  if (kitchenAppId && kitchenId && kitchenMenuId) {
    const [menuSnap, kitchenSnap, appSnap, kitchenCountSnap] = await Promise.all([
      db
        .doc(`apps/${kitchenAppId}/kitchens/${kitchenId}/menus/${kitchenMenuId}`)
        .get(),
      db.collection('kitchens').doc(kitchenId).get(),
      db.collection('apps').doc(kitchenAppId).get(),
      db.collection(`apps/${kitchenAppId}/kitchens`).count().get(),
    ])

    if (!menuSnap.exists) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Menu not found.',
      })
    }

    const menuData = menuSnap.data() || {}
    if (readRecordString(menuData, 'status') !== 'published') {
      throw createError({
        statusCode: 404,
        statusMessage: 'Menu not found.',
      })
    }

    return publicMenuFromData(menuId, menuData, {
      kitchenId,
      kitchenSlug: readRecordString(data, 'kitchen_slug'),
      kitchenName: kitchenSnap.exists ? kitchenDisplayName(kitchenSnap.data() || {}) : '',
      kitchenAppId,
      kitchenMenuId,
      sourceKind:
        readRecordString(data, 'source_kind') ||
        readRecordString(data, 'kind') ||
        readRecordString(menuData, 'source_kind'),
      path: `/menus/${encodeURIComponent(menuId)}`,
      qrPath: `/menus/${encodeURIComponent(menuId)}/qr`,
      ...publicMenuOwnerAppView({
        ownerAppId: kitchenAppId,
        currentAppId: currentAppId(),
        ownerAppData: appSnap.exists ? appSnap.data() || {} : {},
        ownerAppKitchenCount: Number(kitchenCountSnap.data().count || 0),
        kitchenSlug: readRecordString(data, 'kitchen_slug'),
        menuId: kitchenMenuId,
      }),
    })
  }

  const createdBy = readRecordString(data, 'created_by')
  const creatorLabels = await readPublicMenuCreatorLabels([createdBy])

  return publicMenuFromData(menuId, data, {
    createdByLabel: publicMenuCreatorLabel(createdBy, creatorLabels),
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
