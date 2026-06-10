import { doc, type DocumentSnapshot } from 'firebase/firestore'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { attachDevCollectionMeta } from 'fireux-core/runtime/composables/dev/useDevCollectionJson'
import {
  useDocument,
  useFirestoreResolver,
} from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { computed, unref, type Ref } from 'vue'
import { MenuStorage, type Menu } from '../../../../../models/menu.model'
import { resolveKitchenChildCollectionPath } from '../../../console/kitchen/Operations/Collections/useKitchenChildCollection'

export function useMenuFetch(
  menuId: string | Ref<string | null | undefined>,
  options: {
    kitchenCollectionPath?: string | Ref<string | null | undefined>
    kitchenId?: string | Ref<string | null | undefined>
    databaseId?: string | Ref<string | null | undefined>
  } = {}
) {
  const resolveDb = useFirestoreResolver(options.databaseId)
  const { appId } = useFireUXConfig()
  const clean = (value: unknown) => String(value ?? '').trim()
  const resolvedMenuId = computed(() => clean(unref(menuId)))
  const kitchenId = computed(() => clean(unref(options.kitchenId)))
  const collectionPath = computed(() =>
    resolveKitchenChildCollectionPath({
      kitchenCollectionPath: clean(unref(options.kitchenCollectionPath)),
      kitchenId: kitchenId.value,
      collectionName: MenuStorage.collection,
      appId,
    })
  )
  const docRef = computed(() => {
    if (!collectionPath.value || !resolvedMenuId.value) return null
    return doc(resolveDb(), collectionPath.value, resolvedMenuId.value)
  })
  const menu = import.meta.server
    ? computed<Menu | undefined>(() => undefined)
    : (useDocument<Menu>(docRef, {
        ssrKey: computed(() =>
          collectionPath.value && resolvedMenuId.value
            ? `${collectionPath.value}-${resolvedMenuId.value}`
            : 'menu-empty'
        ),
        transform: (docSnap: DocumentSnapshot<Menu>) => {
          const raw = docSnap.data()
          if (!raw) return undefined
          const value = { ...(raw as Menu), id: docSnap.id }
          return attachDevCollectionMeta(
            value,
            collectionPath.value,
            docSnap.id
          ) as Menu
        },
      } as any) as any).data as Ref<Menu | undefined>
  const exists = computed(() => Boolean(menu.value))

  return {
    menuId: resolvedMenuId,
    collectionPath,
    menu,
    exists,
  }
}

export type MenuFetchRefs = ReturnType<typeof useMenuFetch>
