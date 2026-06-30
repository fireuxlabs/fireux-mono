import { collection, deleteField, getDocs, query, where } from 'firebase/firestore'
import { useFirestoreUpdate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreUpdate'
import { useFirestore } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { validatePublicSlug as validateSlug } from 'fireux-core/runtime/utils/slug/validatePublicSlug'
import { computed, unref, type Ref } from 'vue'
import { KitchenStorage, type Kitchen, type KitchenUpdateInput } from '../../../../../models/kitchen.model'
import { MenuStorage } from '../../../../../models/kitchen/menu/menu.model'

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

const hasOwn = (source: Record<string, unknown>, key: string) =>
  Object.prototype.hasOwnProperty.call(source, key)

function readPatchValue(source: Record<string, unknown>, dotted: string) {
  if (hasOwn(source, dotted)) return source[dotted]

  return dotted.split('.').reduce<unknown>((value, key) => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined
    return (value as Record<string, unknown>)[key]
  }, source)
}

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

    await syncRootMenuDoorways(id, prunedPatch)
  }

  const syncRootMenuDoorways = async (
    kitchenId: string,
    patch: Partial<Kitchen>
  ) => {
    if (collectionPath.value !== KitchenStorage.rootCollection) return

    const source = patch as Record<string, unknown>
    const menuPatch: Record<string, unknown> = {}
    const displayName =
      readPatchValue(source, 'identity.display_name') ??
      readPatchValue(source, 'display_name') ??
      readPatchValue(source, 'name')
    const slug = readPatchValue(source, 'slug')
    const imageUrl =
      readPatchValue(source, 'identity.image_url') ??
      readPatchValue(source, 'display_image_url') ??
      readPatchValue(source, 'image_url')
    const imageShade =
      readPatchValue(source, 'identity.image_shade') ??
      readPatchValue(source, 'image_shade')

    if (displayName !== undefined) {
      menuPatch['source.kitchen_name'] = clean(displayName)
    }
    if (slug !== undefined) menuPatch['source.kitchen_slug'] = clean(slug)
    if (imageUrl !== undefined) menuPatch.image_url = clean(imageUrl)
    if (imageShade !== undefined) menuPatch.image_shade = clean(imageShade)

    if (!Object.keys(menuPatch).length) return

    const menuQuery = query(
      collection(db, MenuStorage.collection),
      where('source.kitchen_id', '==', kitchenId)
    )
    const menuSnapshot = await getDocs(menuQuery)

    await Promise.all(
      menuSnapshot.docs.map((docSnap) =>
        updateDocument<Record<string, unknown>>(
          MenuStorage.collection,
          docSnap.id,
          menuPatch
        )
      )
    )
  }

  return { updateKitchen }
}
