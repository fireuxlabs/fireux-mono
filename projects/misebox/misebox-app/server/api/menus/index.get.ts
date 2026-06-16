import { defineEventHandler } from 'h3'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'

type UploadedMenuSummary = {
  id: string
  slug: string
  name: string
  description: string
  kind: string
  migrated: boolean
  kitchen_menu: KitchenMenuTarget | null
  path: string
  qr_path: string
}

type KitchenMenuTarget = {
  app_id: string
  kitchen_id: string
  menu_id: string
}

const readString = (data: Record<string, unknown>, key: string) => {
  const value = data[key]
  return typeof value === 'string' ? value.trim() : ''
}

const readKitchenMenuTarget = (data: Record<string, unknown>): KitchenMenuTarget | null => {
  const target = data.kitchen_menu
  if (!target || typeof target !== 'object' || Array.isArray(target)) return null

  const record = target as Record<string, unknown>
  const appId = readString(record, 'app_id')
  const kitchenId = readString(record, 'kitchen_id')
  const menuId = readString(record, 'menu_id')

  return appId && kitchenId && menuId
    ? {
        app_id: appId,
        kitchen_id: kitchenId,
        menu_id: menuId,
      }
    : null
}

const documentKind = (input: {
  fileName: string
  fileType: string
  storedKind: string
}) => {
  if (['photo', 'pdf', 'document'].includes(input.storedKind)) {
    return input.storedKind
  }

  const extension = input.fileName.toLowerCase().match(/\.[a-z0-9]+$/)?.[0] || ''
  const fileType = input.fileType.toLowerCase()
  if (fileType.startsWith('image/') || ['.jpg', '.jpeg', '.png', '.webp'].includes(extension)) {
    return 'photo'
  }
  if (fileType === 'application/pdf' || extension === '.pdf') return 'pdf'
  return 'document'
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
    .limit(100)
    .get()

  const menus: UploadedMenuSummary[] = snap.docs.map((doc) => {
    const data = doc.data()
    const slug = menuSlug(data, doc.id)
    const encodedSlug = encodeURIComponent(slug)
    const docName = readString(data, 'doc_name')
    const docType = readString(data, 'doc_type')

    return {
      id: doc.id,
      slug,
      name: menuName(slug, readString(data, 'name')),
      description: readString(data, 'description'),
      kind: documentKind({
        fileName: docName,
        fileType: docType,
        storedKind: readString(data, 'doc_kind'),
      }),
      migrated: data.migrated === true,
      kitchen_menu: readKitchenMenuTarget(data),
      path: `/menus/${encodedSlug}`,
      qr_path: `/menus/${encodedSlug}/qr`,
    }
  })

  return menus.sort((a, b) => a.name.localeCompare(b.name))
})
