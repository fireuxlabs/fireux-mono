import { defineEventHandler } from 'h3'
import { useRuntimeConfig } from '#imports'
import { readRecordString } from 'fireux-core/runtime/server/utils/records/read.ts'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'
import { menuSurfaceFromData } from '../../utils/menu-surface.ts'
import { menuSourceFromData } from '../../utils/menu-surface-source.ts'
import {
  menuCreatorLabel,
  readMenuCreatorLabels,
} from '../../utils/menu-creators.ts'
import { menuOwnerAppView } from '../../utils/menu-owner-app.ts'
import {
  menuSurfaceDataWithSourceBehaviour,
  readMenuSourceData,
} from '../../utils/menu-source-behaviour.ts'
import { readMenuPageStyle } from '../../utils/menu-page-style.ts'
import {
  readKitchenIdentity,
  readKitchenMenuStyle,
} from '../../../utils/kitchen-spine'

const kitchenDisplayName = (data: Record<string, unknown>) =>
  readKitchenIdentity(data).displayName

const currentAppId = () => {
  const fireux = (useRuntimeConfig().public?.fireux ?? {}) as Record<string, unknown>
  return String(fireux.id ?? '').trim()
}

export default defineEventHandler(async () => {
  const db = getRuntimeFirestore()
  const appId = currentAppId()
  const snap = await db
    .collection('menus')
    .limit(100)
    .get()

  const kitchenIds = Array.from(
    new Set(
      snap.docs
        .map((doc) => menuSourceFromData(doc.data()).kitchen_id || '')
        .filter(Boolean)
    )
  )
  const kitchenEntries = await Promise.all(
    kitchenIds.map(async (kitchenId) => {
      const kitchenSnap = await db.collection('kitchens').doc(kitchenId).get()
      const kitchenData = kitchenSnap.exists ? kitchenSnap.data() || {} : {}

      return [
        kitchenId,
        {
          name: kitchenSnap.exists ? kitchenDisplayName(kitchenData) : '',
          page_style: readMenuPageStyle(readKitchenMenuStyle(kitchenData)),
        },
      ] as const
    })
  )
  const kitchens = new Map(kitchenEntries)
  const ownerAppIds = Array.from(
    new Set(
      snap.docs
        .map((doc) => menuSourceFromData(doc.data()).app_id || '')
        .filter(Boolean)
    )
  )
  const ownerAppEntries = await Promise.all(
    ownerAppIds.map(async (ownerAppId) => {
      const [appSnap, kitchenCountSnap] = await Promise.all([
        db.collection('apps').doc(ownerAppId).get(),
        db.collection(`apps/${ownerAppId}/kitchens`).count().get(),
      ])

      return [
        ownerAppId,
        {
          app: appSnap.exists ? appSnap.data() || {} : {},
          kitchenCount: Number(kitchenCountSnap.data().count || 0),
        },
      ] as const
    })
  )
  const ownerApps = new Map(ownerAppEntries)
  const creatorLabels = await readMenuCreatorLabels(
    snap.docs.map((doc) => readRecordString(doc.data(), 'created_by'))
  )

  const menuRows = await Promise.all(snap.docs.map(async (doc) => {
    const data = doc.data()
    const status = readRecordString(data, 'status')
    const source = menuSourceFromData(data)
    const kitchenId = source.kitchen_id || ''
    const kitchenAppId = source.app_id || ''
    const kitchenMenuId = source.menu_id || ''
    const ownerApp = ownerApps.get(kitchenAppId)

    if (status !== 'published') return null
    const sourceData = await readMenuSourceData(source)

    return menuSurfaceFromData(doc.id, menuSurfaceDataWithSourceBehaviour(data, sourceData), {
      kitchenName: kitchens.get(kitchenId)?.name || '',
      page_style: kitchens.get(kitchenId)?.page_style,
      createdByLabel: kitchenId
        ? ''
        : menuCreatorLabel(
            readRecordString(data, 'created_by'),
            creatorLabels
          ),
      ...menuOwnerAppView({
        ownerAppId: kitchenAppId,
        currentAppId: appId,
        ownerAppData: ownerApp?.app || {},
        ownerAppKitchenCount: ownerApp?.kitchenCount || 0,
        kitchenSlug: source.kitchen_slug || '',
        menuId: kitchenMenuId || doc.id,
      }),
    })
  }))
  const menus = menuRows.filter(
    (menu): menu is Exclude<(typeof menuRows)[number], null> => Boolean(menu)
  )

  return menus.sort((a, b) => a.name.localeCompare(b.name))
})
