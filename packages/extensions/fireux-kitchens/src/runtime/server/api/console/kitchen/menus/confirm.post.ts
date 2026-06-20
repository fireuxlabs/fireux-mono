import {
  createError,
  defineEventHandler,
  readBody,
  type H3Event,
} from 'h3'
import { DishStorage } from '../../../../../models/dish.model'
import { MenuStorage } from '../../../../../models/menu/menu.model'
import { MenuItemModel } from '../../../../../models/menu/menu-item.model'
import { MenuSectionModel } from '../../../../../models/menu/menu-section.model'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug.ts'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'
import { requirePathSegment } from 'fireux-core/runtime/server/utils/ids/path.ts'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps.ts'
import {
  assertKitchenMenuUploadAccess,
  kitchenMenuUploadKitchenPath,
  kitchenMenuUploadPath,
  requireKitchenMenuUploadUser,
} from '../../../../utils/kitchen-menu-uploads'
import {
  normalizeExtractedSections,
  type ExtractedMenuSection,
} from '../../../../utils/kitchen-menu-process'

type ConfirmMenuBody = {
  appId?: string
  kitchenId?: string
  menuId?: string
  uploadId?: string
  menuName?: string
  sections?: unknown[]
}

const text = (value: unknown) => String(value ?? '').trim()

const titleFromId = (value: string) =>
  value
    .split(/[-_\s]+/g)
    .map((part) => part ? `${part[0]?.toUpperCase()}${part.slice(1)}` : '')
    .filter(Boolean)
    .join(' ')

const uniqueSlug = (used: Set<string>, fallback: string, seed: unknown) => {
  const base = normalizeSlug(seed) || fallback
  let id = base
  let index = 2

  while (used.has(id)) {
    id = `${base}-${index}`
    index += 1
  }

  used.add(id)
  return id
}

const countItems = (sections: ExtractedMenuSection[]) =>
  sections.reduce((count, section) => count + section.items.length, 0)

export default defineEventHandler(async (event: H3Event) => {
  const uid = await requireKitchenMenuUploadUser(
    event,
    'Sign in before confirming a menu draft.'
  )
  const body = (await readBody(event)) as ConfirmMenuBody | null
  const appId = requirePathSegment(body?.appId, 'App id')
  const kitchenId = requirePathSegment(body?.kitchenId, 'Kitchen id')
  const menuId = requirePathSegment(body?.menuId, 'Menu id')
  const uploadId = requirePathSegment(body?.uploadId || menuId, 'Upload id')

  await assertKitchenMenuUploadAccess(appId, kitchenId, uid)

  const sections = normalizeExtractedSections({ sections: body?.sections })
  if (!sections.length || !countItems(sections)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Confirm needs at least one dish in the AI draft.',
    })
  }

  const db = getRuntimeFirestore()
  const kitchenPath = kitchenMenuUploadKitchenPath(appId, kitchenId)
  const uploadRef = db.doc(kitchenMenuUploadPath(appId, kitchenId, uploadId))
  const menuRef = db.doc(`${kitchenPath}/${MenuStorage.collection}/${menuId}`)
  const [uploadSnap, menuSnap] = await Promise.all([
    uploadRef.get(),
    menuRef.get(),
  ])

  if (!uploadSnap.exists) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Upload a source document before confirming this menu.',
    })
  }

  if (menuSnap.exists) {
    throw createError({
      statusCode: 409,
      statusMessage:
        'This menu already exists. Updating existing menus needs a separate review flow.',
    })
  }

  const batch = db.batch()
  const stamp = serverAuditStamp({ by: uid, appId })
  const sectionIds = new Set<string>()
  const dishIds = new Set<string>()
  let itemCount = 0

  batch.set(menuRef, {
    id: menuId,
    kitchen_id: kitchenId,
    name: text(body?.menuName) || titleFromId(menuId) || menuId,
    description: '',
    status: 'draft',
    sort_order: 0,
    created: stamp,
    updated: stamp,
  })

  sections.forEach((section, sectionIndex) => {
    const sectionId = uniqueSlug(
      sectionIds,
      `section-${sectionIndex + 1}`,
      section.label
    )
    const sectionRef = menuRef
      .collection('sections')
      .doc(sectionId)

    batch.set(sectionRef, {
      ...MenuSectionModel,
      id: sectionId,
      kitchen_id: kitchenId,
      menu_id: menuId,
      label: text(section.label) || `Section ${sectionIndex + 1}`,
      status: 'active',
      sort_order: sectionIndex,
      created: stamp,
      updated: stamp,
    })

    section.items.forEach((item, itemIndex) => {
      const dishId = uniqueSlug(
        dishIds,
        `dish-${sectionIndex + 1}-${itemIndex + 1}`,
        item.name
      )
      const dishRef = db.doc(`${kitchenPath}/${DishStorage.collection}/${dishId}`)
      const itemId = `${dishId}-${itemIndex + 1}`

      batch.set(
        dishRef,
        {
          id: dishId,
          name: text(item.name),
          slug: dishId,
          description: text(item.description),
          kitchen_id: kitchenId,
          created: stamp,
          updated: stamp,
        },
        { merge: true }
      )
      batch.set(sectionRef.collection('items').doc(itemId), {
        ...MenuItemModel,
        id: itemId,
        kitchen_id: kitchenId,
        menu_id: menuId,
        section_id: sectionId,
        dish_id: dishId,
        price: Math.max(0, Number(item.price || 0)),
        status: 'active',
        sort_order: itemIndex,
        created: stamp,
        updated: stamp,
      })

      itemCount += 1
    })
  })

  batch.set(
    uploadRef,
    {
      status: 'draft',
      menu_id: menuId,
      updated: serverAuditStamp({ by: uid }),
    },
    { merge: true }
  )

  await batch.commit()

  return {
    ok: true,
    menuId,
    uploadId,
    status: 'draft',
    sections_count: sections.length,
    items_count: itemCount,
    message: 'Menu draft confirmed. Dishes, sections, and menu items were created.',
  }
})
