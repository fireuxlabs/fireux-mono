import { createError, defineEventHandler, getRequestURL, getRouterParam } from 'h3'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'

type KitchenMenuTarget = {
  app_id: string
  kitchen_id: string
  menu_id: string
}

const readString = (data: Record<string, unknown>, key: string) => {
  const value = data[key]
  return typeof value === 'string' ? value.trim() : ''
}

const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}

const origin = (value: unknown) => String(value || '').trim().replace(/\/+$/, '')

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

const readKitchenMenuTarget = (data: Record<string, unknown>): KitchenMenuTarget | null => {
  const target = record(data.kitchen_menu)
  const appId = readString(target, 'app_id')
  const kitchenId = readString(target, 'kitchen_id')
  const menuId = readString(target, 'menu_id')

  return appId && kitchenId && menuId
    ? {
        app_id: appId,
        kitchen_id: kitchenId,
        menu_id: menuId,
      }
    : null
}

const publicMenuPath = async (
  db: ReturnType<typeof getRuntimeFirestore>,
  target: KitchenMenuTarget
) => {
  const encodedMenuId = encodeURIComponent(target.menu_id)
  const appKitchenSnap = await db
    .collection(`apps/${target.app_id}/kitchens`)
    .limit(2)
    .get()

  if (appKitchenSnap.size === 1) return `/menus/${encodedMenuId}`

  const kitchenSnap = await db.collection('kitchens').doc(target.kitchen_id).get()
  const kitchenSlug = readString(kitchenSnap.data() || {}, 'slug')

  return kitchenSlug
    ? `/kitchens/${encodeURIComponent(kitchenSlug)}/menus/${encodedMenuId}`
    : ''
}

const publicAppOrigin = async (
  db: ReturnType<typeof getRuntimeFirestore>,
  appId: string,
  requestOrigin: string
) => {
  const appSnap = await db.collection('apps').doc(appId).get()
  const app = appSnap.data() || {}
  const socialLinks = record(app.social_links)
  const configuredOrigin =
    origin(socialLinks.website) ||
    origin(app.source_url)

  return /^https?:\/\//i.test(configuredOrigin)
    ? configuredOrigin
    : requestOrigin
}

async function migratedKitchenMenu(
  db: ReturnType<typeof getRuntimeFirestore>,
  target: KitchenMenuTarget,
  requestOrigin: string
) {
  const menuSnap = await db
    .doc(`apps/${target.app_id}/kitchens/${target.kitchen_id}/menus/${target.menu_id}`)
    .get()

  if (!menuSnap.exists) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Kitchen menu not found.',
    })
  }

  const menu = menuSnap.data() || {}
  if (readString(menu, 'status') !== 'published') {
    throw createError({
      statusCode: 404,
      statusMessage: 'Kitchen menu is not published.',
    })
  }

  const path = await publicMenuPath(db, target)
  const appOrigin = await publicAppOrigin(db, target.app_id, requestOrigin)
  const docName = readString(menu, 'doc_name')
  const docType = readString(menu, 'doc_type')

  return {
    id: target.menu_id,
    slug: target.menu_id,
    name: readString(menu, 'name') || target.menu_id,
    description: readString(menu, 'description'),
    migrated: true,
    kitchen_menu: target,
    canonical_path: path,
    canonical_url: path && appOrigin ? new URL(path, appOrigin).toString() : '',
    doc_url: readString(menu, 'doc_url'),
    doc_name: docName,
    doc_type: docType,
    kind: documentKind({
      fileName: docName,
      fileType: docType,
      storedKind: '',
    }),
    doc_storage_path: readString(menu, 'doc_storage_path'),
  }
}

export default defineEventHandler(async (event) => {
  const slug = String(getRouterParam(event, 'slug') || '').trim()
  if (!slug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Menu path is required.',
    })
  }

  const db = getRuntimeFirestore()
  const snap = await db
    .collection('menus')
    .doc(slug)
    .get()

  if (!snap.exists) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Menu not found.',
    })
  }

  const data = snap.data() || {}
  if (data.migrated === true) {
    const target = readKitchenMenuTarget(data)
    if (!target) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Migrated menu target is missing.',
      })
    }

    return migratedKitchenMenu(db, target, getRequestURL(event).origin)
  }

  const docName = String(data.doc_name || '')
  const docType = String(data.doc_type || '')

  return {
    id: slug,
    slug,
    name: String(data.name || slug),
    description: String(data.description || ''),
    migrated: false,
    kitchen_menu: null,
    canonical_path: `/menus/${encodeURIComponent(slug)}`,
    canonical_url: new URL(`/menus/${encodeURIComponent(slug)}`, getRequestURL(event).origin).toString(),
    doc_url: String(data.doc_url || ''),
    doc_name: docName,
    doc_type: docType,
    kind: documentKind({
      fileName: docName,
      fileType: docType,
      storedKind: String(data.doc_kind || ''),
    }),
    doc_storage_path: String(data.doc_storage_path || ''),
  }
})
