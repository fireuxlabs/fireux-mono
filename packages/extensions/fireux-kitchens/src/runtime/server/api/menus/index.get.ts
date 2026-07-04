import { defineEventHandler } from 'h3'
import { readRecordString } from 'fireux-core/runtime/server/utils/records/read.ts'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'
import { menuSourceFromData } from '../../utils/menu/public/source.ts'

const text = (value: unknown) => String(value ?? '').trim()

export default defineEventHandler(async () => {
  const db = getRuntimeFirestore()
  const snap = await db
    .collection('menus')
    .limit(100)
    .get()

  const menus = snap.docs.map((doc) => {
    const data = doc.data()
    const status = readRecordString(data, 'status')
    const source = menuSourceFromData(data)

    if (status !== 'published') return null

    const path = text(data.path) || `/menus/${encodeURIComponent(doc.id)}`

    return {
      id: doc.id,
      slug: text(data.slug) || doc.id,
      name: readRecordString(data, 'name') || doc.id,
      description: readRecordString(data, 'description'),
      status,
      path,
      qr_path: text(data.qr_path) || `${path}/qr`,
      source_kind: readRecordString(data, 'source_kind') || readRecordString(data, 'kind'),
      source,
      image_url: readRecordString(data, 'image_url'),
      image_shade: readRecordString(data, 'image_shade'),
    }
  }).filter((menu): menu is NonNullable<typeof menu> => Boolean(menu))

  return menus.sort((a, b) => a.name.localeCompare(b.name))
})
