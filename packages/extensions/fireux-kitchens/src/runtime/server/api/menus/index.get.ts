import { defineEventHandler } from 'h3'
import { useRuntimeConfig } from '#imports'
import { readRecordString } from 'fireux-core/runtime/server/utils/records/read.ts'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'
import {
  publicMenuCreatorLabel,
  publicMenuFromData,
  publicMenuOwnerAppView,
  readPublicMenuCreatorLabels,
} from '../../utils/public-menus.ts'

const kitchenDisplayName = (data: Record<string, unknown>) =>
  readRecordString(data, 'display_name') ||
  readRecordString(data, 'name') ||
  readRecordString(data, 'short_name')

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
        .map((doc) => readRecordString(doc.data(), 'kitchen_id'))
        .filter(Boolean)
    )
  )
  const kitchenEntries = await Promise.all(
    kitchenIds.map(async (kitchenId) => {
      const kitchenSnap = await db.collection('kitchens').doc(kitchenId).get()

      return [
        kitchenId,
        kitchenSnap.exists ? kitchenDisplayName(kitchenSnap.data() || {}) : '',
      ] as const
    })
  )
  const kitchenNames = new Map(kitchenEntries)
  const ownerAppIds = Array.from(
    new Set(
      snap.docs
        .map((doc) => readRecordString(doc.data(), 'kitchen_app_id'))
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
  const creatorLabels = await readPublicMenuCreatorLabels(
    snap.docs.map((doc) => readRecordString(doc.data(), 'created_by'))
  )

  const menus = snap.docs.flatMap((doc) => {
    const data = doc.data()
    const status = readRecordString(data, 'status')
    const kitchenId = readRecordString(data, 'kitchen_id')
    const kitchenAppId = readRecordString(data, 'kitchen_app_id')
    const kitchenMenuId = readRecordString(data, 'kitchen_menu_id')
    const ownerApp = ownerApps.get(kitchenAppId)

    if (status !== 'published') return []

    return [publicMenuFromData(doc.id, data, {
      kitchenName: kitchenNames.get(kitchenId) || '',
      createdByLabel: kitchenId
        ? ''
        : publicMenuCreatorLabel(
            readRecordString(data, 'created_by'),
            creatorLabels
          ),
      ...publicMenuOwnerAppView({
        ownerAppId: kitchenAppId,
        currentAppId: appId,
        ownerAppData: ownerApp?.app || {},
        ownerAppKitchenCount: ownerApp?.kitchenCount || 0,
        kitchenSlug: readRecordString(data, 'kitchen_slug'),
        menuId: kitchenMenuId || doc.id,
      }),
    })]
  })

  return menus.sort((a, b) => a.name.localeCompare(b.name))
})
