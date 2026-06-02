import { defineEventHandler } from 'h3'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'

type UploadedMenuSummary = {
  id: string
  slug: string
  name: string
  description: string
  status: string
  doc_name: string
  doc_type: string
  path: string
  qr_path: string
}

const readString = (data: Record<string, unknown>, key: string) => {
  const value = data[key]
  return typeof value === 'string' ? value.trim() : ''
}

const menuName = (slug: string, name: string) => {
  if (name) return name
  return slug
}

const menuSlug = (data: Record<string, unknown>, docId: string) => {
  const storedSlug = readString(data, 'slug')
  if (storedSlug) return storedSlug
  return docId
}

export default defineEventHandler(async () => {
  const snap = await getRuntimeFirestore()
    .collection('menus')
    .where('status', '==', 'published')
    .limit(100)
    .get()

  const menus: UploadedMenuSummary[] = snap.docs.map((doc) => {
    const data = doc.data()
    const slug = menuSlug(data, doc.id)
    const encodedSlug = encodeURIComponent(slug)

    return {
      id: doc.id,
      slug,
      name: menuName(slug, readString(data, 'name')),
      description: readString(data, 'description'),
      status: readString(data, 'status'),
      doc_name: readString(data, 'doc_name'),
      doc_type: readString(data, 'doc_type'),
      path: `/menus/${encodedSlug}`,
      qr_path: `/menus/${encodedSlug}/qr`,
    }
  })

  return menus.sort((a, b) => a.name.localeCompare(b.name))
})
