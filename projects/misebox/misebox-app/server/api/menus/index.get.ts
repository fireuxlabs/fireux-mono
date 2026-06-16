import { defineEventHandler } from 'h3'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'
import { documentKindFromFile } from 'fireux-core/runtime/server/utils/files/document-kind.ts'
import { readRecordString } from 'fireux-core/runtime/server/utils/records/read.ts'

type UploadedMenuSummary = {
  id: string
  slug: string
  name: string
  description: string
  kind: string
  path: string
  qr_path: string
}

const menuName = (slug: string, name: string) => {
  if (name) return name
  return slug
}

const menuSlug = (data: Record<string, unknown>, docId: string) => {
  const storedSlug = readRecordString(data, 'slug')
  if (storedSlug) return storedSlug
  return docId
}

export default defineEventHandler(async () => {
  const snap = await getRuntimeFirestore()
    .collection('menus')
    .limit(100)
    .get()

  const menus: UploadedMenuSummary[] = snap.docs.map((doc) => {
    const data = doc.data()
    const slug = menuSlug(data, doc.id)
    const encodedSlug = encodeURIComponent(slug)
    const docName = readRecordString(data, 'doc_name')
    const docType = readRecordString(data, 'doc_type')

    return {
      id: doc.id,
      slug,
      name: menuName(slug, readRecordString(data, 'name')),
      description: readRecordString(data, 'description'),
      kind: documentKindFromFile({
        fileName: docName,
        contentType: docType,
        storedKind: readRecordString(data, 'doc_kind'),
      }),
      path: `/menus/${encodedSlug}`,
      qr_path: `/menus/${encodedSlug}/qr`,
    }
  })

  return menus.sort((a, b) => a.name.localeCompare(b.name))
})
