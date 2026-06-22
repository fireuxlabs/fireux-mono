import {
  createError,
  defineEventHandler,
  getQuery,
  getRouterParam,
} from 'h3'
import { useRuntimeConfig } from '#imports'
import { readRecordString } from 'fireux-core/runtime/server/utils/records/read.ts'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'
import { setCorsHeaders } from 'fireux-core/runtime/server/utils/http/cors.ts'
import {
  menuSurfaceFromData,
  menuSourceFromData,
} from '../../utils/menu-surface.ts'
import {
  menuCreatorLabel,
  readMenuCreatorLabels,
} from '../../utils/menu-creators.ts'
import {
  menuOwnerAppApiTo,
  readMenuOwnerAppView,
} from '../../utils/menu-owner-app.ts'
import { menuSourcePayloadFromApi } from '../../utils/menu-source-payload.ts'
import { readKitchenMenuPublicRows } from '../../utils/kitchen-menu-public-rows.ts'
import {
  kitchenDisplayName,
  readMenuKitchenBySlug,
  readRootMenuKitchenScope,
  resolveSourceAppId,
} from '../../utils/menu-kitchen-scope.ts'

const text = (value: unknown) => String(value ?? '').trim()

const currentAppId = () => {
  const fireux = (useRuntimeConfig().public?.fireux ?? {}) as Record<string, unknown>
  return text(fireux.id)
}

async function readKitchenMenu(menuId: string, kitchenSlug: string) {
  const db = getRuntimeFirestore()
  const kitchen = await readMenuKitchenBySlug(kitchenSlug)

  if (!kitchen) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Kitchen not found.',
    })
  }

  const kitchenAppId = resolveSourceAppId(kitchen.data, currentAppId())
  const ownerAppView = await readMenuOwnerAppView({
    ownerAppId: kitchenAppId,
    currentAppId: currentAppId(),
    kitchenSlug,
    menuId,
  })
  const ownerPayload = await menuSourcePayloadFromApi(
    menuOwnerAppApiTo(ownerAppView)
  )
  const menuSnap = await db
    .collection(`apps/${kitchenAppId}/kitchens/${kitchen.id}/menus`)
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
  const sections = await readKitchenMenuPublicRows(db, {
    appId: kitchenAppId,
    kitchenId: kitchen.id,
    menuId,
  })

  return menuSurfaceFromData(menuId, data, {
    kitchenId: kitchen.id,
    kitchenSlug,
    kitchenName: kitchenDisplayName(kitchen.data),
    kitchenAppId,
    kitchenMenuId: menuId,
    sourceKind:
      readRecordString(data, 'source_kind') ||
      (readRecordString(data, 'doc_url') ? '' : 'kitchen-menu'),
    path: `/kitchens/${encodeURIComponent(kitchenSlug)}/menus/${encodeURIComponent(menuId)}`,
    sections,
    ...ownerAppView,
    ...ownerPayload,
  })
}

async function readMenuSurface(menuId: string) {
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
  const creatorLabels = await readMenuCreatorLabels([createdBy])
  const kitchenScope = await readRootMenuKitchenScope(data, currentAppId())
  const source = menuSourceFromData(data, kitchenScope)
  const ownerAppView = await readMenuOwnerAppView({
    ownerAppId: source.app_id || '',
    currentAppId: currentAppId(),
    kitchenSlug: source.kitchen_slug || '',
    menuId: source.menu_id || menuId,
  })
  const ownerPayload = await menuSourcePayloadFromApi(
    menuOwnerAppApiTo(ownerAppView)
  )
  const sourceSections =
    source.app_id && source.kitchen_id && source.menu_id
      ? await readKitchenMenuPublicRows(db, {
          appId: source.app_id,
          kitchenId: source.kitchen_id,
          menuId: source.menu_id,
        })
      : []

  return menuSurfaceFromData(menuId, data, {
    ...kitchenScope,
    ...ownerAppView,
    ...ownerPayload,
    sections: sourceSections,
    createdByLabel:
      kitchenScope.createdByLabel ??
      menuCreatorLabel(createdBy, creatorLabels),
  })
}

export default defineEventHandler(async (event) => {
  setCorsHeaders(event, {
    methods: ['GET'],
  })

  const menuId = text(getRouterParam(event, 'menuId'))
  const kitchenSlug = text(getQuery(event).kitchenSlug)
  if (!menuId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Menu path is required.',
    })
  }

  if (kitchenSlug) {
    return readKitchenMenu(menuId, kitchenSlug)
  }

  return readMenuSurface(menuId)
})
