import {
  collection,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  writeBatch,
  type Firestore,
} from 'firebase/firestore'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import { MenuSourceUploadStorage } from '../../../utils/menu-source-upload.ts'
import { resolveKitchenCollectionBasePath } from '../../../../kitchen/utils/kitchen-collection-path'
import { menuItemsPath, menuSectionsPath } from '../utils/paths'

const withoutId = <T extends Record<string, unknown>>(
  data: T,
  extraKeys: string[] = []
) => {
  const next = { ...data }
  for (const key of ['id', ...extraKeys]) delete next[key]
  return next
}

export async function renameKitchenMenuDocuments({
  appId,
  db,
  kitchenCollectionPath,
  kitchenId,
  menuCollectionPath,
  menuId,
  nextMenuId,
}: {
  appId: string
  db: Firestore
  kitchenCollectionPath: string
  kitchenId: string
  menuCollectionPath: string
  menuId: string
  nextMenuId: string
}) {
  const user = await useRequireUser()
  const oldMenuRef = doc(db, menuCollectionPath, menuId)
  const nextMenuRef = doc(db, menuCollectionPath, nextMenuId)
  const [oldMenuSnap, nextMenuSnap] = await Promise.all([
    getDoc(oldMenuRef),
    getDoc(nextMenuRef),
  ])

  if (!oldMenuSnap.exists()) throw new Error(`Menu not found: ${menuId}`)
  if (nextMenuSnap.exists()) {
    throw new Error(`Menu already exists: ${nextMenuId}`)
  }

  const sectionsPath = menuSectionsPath({
    kitchenCollectionPath,
    kitchenId,
    menuId,
    appId,
  })
  const sectionsSnap = await getDocs(collection(db, sectionsPath))
  const sectionsWithItems = await Promise.all(
    sectionsSnap.docs.map(async (sectionSnap) => {
      const itemsPath = menuItemsPath({
        kitchenCollectionPath,
        kitchenId,
        menuId,
        sectionId: sectionSnap.id,
        appId,
      })
      const itemsSnap = await getDocs(collection(db, itemsPath))

      return {
        section: sectionSnap,
        items: itemsSnap.docs,
      }
    })
  )

  const uploadPath = `${resolveKitchenCollectionBasePath(
    kitchenCollectionPath,
    appId
  )}/${kitchenId.trim()}/${MenuSourceUploadStorage.collection}`
  const oldUploadRef = doc(db, uploadPath, menuId)
  const nextUploadRef = doc(db, uploadPath, nextMenuId)
  const [oldUploadSnap, nextUploadSnap] = await Promise.all([
    getDoc(oldUploadRef),
    getDoc(nextUploadRef),
  ])
  const batch = writeBatch(db)
  let batchOps = 0
  const updated = {
    at: serverTimestamp(),
    by: user.uid,
  }

  const nextBatchOp = () => {
    batchOps += 1
    if (batchOps > 450) {
      throw new Error('Menu is too large to rename in one operation.')
    }

    return batch
  }

  nextBatchOp().set(nextMenuRef, {
    ...withoutId(oldMenuSnap.data() as Record<string, unknown>),
    updated,
  })

  for (const { section, items } of sectionsWithItems) {
    const nextSectionRef = doc(
      db,
      menuSectionsPath({
        kitchenCollectionPath,
        kitchenId,
        menuId: nextMenuId,
        appId,
      }),
      section.id
    )
    nextBatchOp().set(nextSectionRef, {
      ...withoutId(section.data() as Record<string, unknown>),
      menu_id: nextMenuId,
      updated,
    })

    for (const item of items) {
      const nextItemRef = doc(
        db,
        menuItemsPath({
          kitchenCollectionPath,
          kitchenId,
          menuId: nextMenuId,
          sectionId: section.id,
          appId,
        }),
        item.id
      )
      nextBatchOp().set(nextItemRef, {
        ...withoutId(item.data() as Record<string, unknown>),
        menu_id: nextMenuId,
        updated,
      })
    }
  }

  if (oldUploadSnap.exists() && !nextUploadSnap.exists()) {
    nextBatchOp().set(nextUploadRef, {
      ...withoutId(oldUploadSnap.data() as Record<string, unknown>),
      updated,
    })
  }

  if (oldUploadSnap.exists() && !nextUploadSnap.exists()) {
    nextBatchOp().delete(oldUploadRef)
  }

  for (const { section, items } of sectionsWithItems) {
    for (const item of items) {
      nextBatchOp().delete(item.ref)
    }
    nextBatchOp().delete(section.ref)
  }
  nextBatchOp().delete(oldMenuRef)

  await batch.commit()

  return { id: nextMenuId, changed: true }
}
