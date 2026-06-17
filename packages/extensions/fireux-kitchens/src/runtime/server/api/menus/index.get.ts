import { defineEventHandler } from 'h3'
import { readRecordString } from 'fireux-core/runtime/server/utils/records/read.ts'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'
import { publicMenuFromData } from '../../utils/public-menus.ts'

const kitchenDisplayName = (data: Record<string, unknown>) =>
  readRecordString(data, 'display_name') ||
  readRecordString(data, 'name') ||
  readRecordString(data, 'short_name')

export default defineEventHandler(async () => {
  const db = getRuntimeFirestore()
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

  const menus = snap.docs.flatMap((doc) => {
    const data = doc.data()
    const status = readRecordString(data, 'status')
    const kitchenId = readRecordString(data, 'kitchen_id')

    if (status !== 'published') return []

    return [publicMenuFromData(doc.id, data, {
      kitchenName: kitchenNames.get(kitchenId) || '',
    })]
  })

  return menus.sort((a, b) => a.name.localeCompare(b.name))
})
