import { defineEventHandler } from 'h3'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'
import { publicMenuFromData } from '../../utils/public-menus.ts'

export default defineEventHandler(async () => {
  const snap = await getRuntimeFirestore()
    .collection('menus')
    .limit(100)
    .get()

  const menus = snap.docs.map((doc) => publicMenuFromData(doc.id, doc.data()))

  return menus.sort((a, b) => a.name.localeCompare(b.name))
})
