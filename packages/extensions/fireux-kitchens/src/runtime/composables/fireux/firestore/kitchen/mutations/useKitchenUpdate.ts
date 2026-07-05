import { collection, deleteField, getDocs, query, where } from 'firebase/firestore'
import { useFirestoreUpdate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreUpdate'
import { useFirestore } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { validatePublicSlug as validateSlug } from 'fireux-core/runtime/utils/slug/validatePublicSlug'
import { computed, unref, type Ref } from 'vue'
import { KitchenStorage, type Kitchen, type KitchenUpdateInput } from '../../../../../models/kitchen.model'
import { MenuStorage } from '../../../../../models/kitchen/menu/menu.model'
import {
  menuRootEntryPatchFromKitchen,
  readMenuRootEntryDocs,
} from '../../menu/utils/root-entry'

type MaybeRef<T> = T | Ref<T>
type UseKitchenUpdateOptions = {
  collectionPath?: MaybeRef<string | null | undefined>
  databaseId?: MaybeRef<string | null | undefined>
}

const COLLECTION_PATH = KitchenStorage.rootCollection

const clean = (value: unknown) => String(value ?? '').trim()

const pruneUndefined = (payload: Partial<Kitchen>) =>
  Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined)
  ) as Partial<Kitchen>

export function useKitchenUpdate(options: UseKitchenUpdateOptions = {}) {
  const collectionPath = computed(() =>
    clean(unref(options.collectionPath)) || COLLECTION_PATH
  )
  const { updateDocument } = useFirestoreUpdate({
    databaseId: options.databaseId,
  })
  const db = useFirestore(options.databaseId)

  const resolveSlugUpdate = async (kitchenId: string, value: unknown) => {
    const validation = validateSlug(value, {
      label: 'Kitchen slug',
      namespace: KitchenStorage.rootCollection,
      reservedScope: 'root',
      maxLength: 80,
    })

    if (!validation.isValid) {
      throw new Error(validation.message || 'Kitchen slug is invalid.')
    }

    const slug = validation.slug
    const slugQuery = query(
      collection(db, COLLECTION_PATH),
      where('slug', '==', slug)
    )
    const snapshot = await getDocs(slugQuery)
    const conflict = snapshot.docs.find((docSnap) => docSnap.id !== kitchenId)

    if (conflict) {
      throw new Error(`Kitchen slug "${slug}" is already taken.`)
    }

    return slug
  }

  const updateKitchen = async (kitchenId: string, patch: KitchenUpdateInput) => {
    const id = clean(kitchenId)
    if (!id) throw new Error('Kitchen id is required')

    const nextPatch = { ...patch }
    const hasSlugPatch = Object.prototype.hasOwnProperty.call(patch, 'slug')

    if (hasSlugPatch) {
      nextPatch.slug = await resolveSlugUpdate(id, patch.slug)
      const aliasPrunePatch = nextPatch as Record<string, unknown>
      aliasPrunePatch.slug_aliases = deleteField()
      aliasPrunePatch.slugAliases = deleteField()
    }

    const prunedPatch = pruneUndefined(nextPatch)

    await updateDocument<Kitchen>(
      collectionPath.value,
      id,
      prunedPatch
    )

    await updateMenuRootEntries(id, prunedPatch)
  }

  const updateMenuRootEntries = async (
    kitchenId: string,
    patch: Partial<Kitchen>
  ) => {
    if (collectionPath.value !== KitchenStorage.rootCollection) return

    const menuPatch = menuRootEntryPatchFromKitchen(patch as Record<string, unknown>)
    if (!Object.keys(menuPatch).length) return

    const rootMenuDocs = await readMenuRootEntryDocs({
      db,
      kitchenId,
    })

    await Promise.all(
      rootMenuDocs.map((docSnap) =>
        updateDocument<Record<string, unknown>>(
          MenuStorage.rootCollection,
          docSnap.id,
          menuPatch
        )
      )
    )
  }

  return { updateKitchen }
}
