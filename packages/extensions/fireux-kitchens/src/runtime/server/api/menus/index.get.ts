import { defineEventHandler } from 'h3'
import { documentKindFromFile } from 'fireux-core/runtime/server/utils/files/document-kind.ts'
import { readRecordString } from 'fireux-core/runtime/server/utils/records/read.ts'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'

type WaitingMenuSummary = {
  id: string
  slug: string
  name: string
  description: string
  kind: string
  path: string
  qr_path: string
}

const menuSlug = (data: Record<string, unknown>, docId: string) =>
  readRecordString(data, 'slug') || docId

export default defineEventHandler(async () => {
  const snap = await getRuntimeFirestore()
    .collection('menus')
    .limit(100)
    .get()

  const menus: WaitingMenuSummary[] = snap.docs.map((doc) => {
    const data = doc.data()
    const slug = menuSlug(data, doc.id)
    const encodedSlug = encodeURIComponent(slug)
    const docName = readRecordString(data, 'doc_name')
    const docType = readRecordString(data, 'doc_type')

    return {
      id: doc.id,
      slug,
      name: readRecordString(data, 'name') || slug,
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
