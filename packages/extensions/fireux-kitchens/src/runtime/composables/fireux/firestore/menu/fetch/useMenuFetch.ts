import { doc } from 'firebase/firestore'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import {
  useDocument,
  useFirestore,
} from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { computed, isRef, type Ref } from 'vue'
import type { Menu } from '../../../../../models/menu.model'
import { useKitchenSelection } from '../../../console/kitchen/useKitchenSelection'
import { resolveKitchenConsoleCollectionPath } from '../../../console/kitchen/operations/collections/useKitchenChildCollection'

type UseMenuFetchOptions = {
  kitchenCollectionPath?: string | Ref<string | null | undefined>
  kitchenId?: string | Ref<string | null | undefined>
}

const clean = (value: unknown) => String(value ?? '').trim()
const readRef = (value: string | Ref<string | null | undefined> | null | undefined) =>
  isRef(value) ? value.value : value

export function useMenuFetch(
  menuId: string | Ref<string | null | undefined> | null | undefined,
  options: UseMenuFetchOptions = {}
) {
  const db = useFirestore()
  const { appId } = useFireUXConfig()
  const { selectedId } = useKitchenSelection()

  const resolvedMenuId = computed(() => clean(readRef(menuId)))
  const resolvedKitchenId = computed(() =>
    clean(readRef(options.kitchenId) || selectedId.value)
  )
  const kitchenCollectionPath = computed(() =>
    clean(readRef(options.kitchenCollectionPath)) ||
    resolveKitchenConsoleCollectionPath(appId)
  )
  const collectionPath = computed(() =>
    resolvedKitchenId.value
      ? `${kitchenCollectionPath.value}/${resolvedKitchenId.value}/menus`
      : ''
  )

  const docRef = computed(() =>
    collectionPath.value && resolvedMenuId.value
      ? (doc(db, collectionPath.value, resolvedMenuId.value) as any)
      : null
  )

  const { data, pending, error } = useDocument<Menu | undefined>(docRef as any, {
    ssrKey: computed(() =>
      docRef.value ? `${collectionPath.value}-${resolvedMenuId.value}` : undefined
    ),
    transform: (docSnap: any) => {
      if (!docSnap?.exists?.()) return undefined
      return { id: docSnap.id, ...(docSnap.data() ?? {}) } as Menu
    },
  } as any)

  const menu = computed<Menu | null>(() => data.value ?? null)

  return {
    kitchenId: resolvedKitchenId,
    collectionPath,
    menu,
    pending: computed(() => Boolean(pending.value)),
    error,
  }
}

export type MenuFetchRefs = ReturnType<typeof useMenuFetch>
