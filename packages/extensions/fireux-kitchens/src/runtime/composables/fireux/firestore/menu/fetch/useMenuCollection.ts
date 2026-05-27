import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { computed, shallowRef, unref, watch, type Ref, type ShallowRef } from 'vue'
import type { Menu } from '../../../../../models/menu.model'
import { resolveKitchenChildCollectionBasePath } from '../../../console/kitchen/operations/collections/useKitchenChildCollection'

type UseMenuCollectionOptions = {
  kitchenCollectionPath?: string | Ref<string | null | undefined>
  databaseId?: string | Ref<string | null | undefined>
}

const clean = (value: unknown) => String(value ?? '').trim()

const sortMenus = (menus: Menu[]) =>
  [...menus].sort(
    (a, b) =>
      Number(a.sort_order || 0) - Number(b.sort_order || 0) ||
      String(a.name).localeCompare(String(b.name))
  )

export function useMenuCollection(
  kitchenId?: string | Ref<string | null | undefined>,
  options: UseMenuCollectionOptions = {}
) {
  const { firestoreFetchCollection } = useFirestoreRead({
    databaseId: options.databaseId,
  })
  const { appId } = useFireUXConfig()

  const resolvedKitchenId = computed(() => clean(unref(kitchenId)))
  const kitchenCollectionPath = computed(() =>
    resolveKitchenChildCollectionBasePath({
      kitchenCollectionPath: unref(options.kitchenCollectionPath),
      collectionName: 'menus',
      appId,
    })
  )
  const collectionPath = computed(() =>
    resolvedKitchenId.value
      ? `${kitchenCollectionPath.value}/${resolvedKitchenId.value}/menus`
      : ''
  )
  const databaseIdKey = computed(() => clean(unref(options.databaseId)))

  const collectionRef = shallowRef(null) as ShallowRef<
    Ref<Record<string, unknown>[] | undefined> | null
  >

  watch(
    [collectionPath, databaseIdKey],
    ([nextPath]) => {
      collectionRef.value = nextPath
        ? firestoreFetchCollection<Record<string, unknown>>(nextPath)
        : null
    },
    { immediate: true }
  )

  const menus = computed<Menu[]>(() =>
    sortMenus((collectionRef.value?.value ?? []) as Menu[]).filter(
      (menu) => menu.status !== 'archived'
    )
  )
  const publishedMenus = computed(() =>
    menus.value.filter((menu) => menu.status === 'published')
  )

  return {
    kitchenId: resolvedKitchenId,
    kitchenCollectionPath,
    collectionPath,
    menus,
    publishedMenus,
    count: computed(() => menus.value.length),
    pending: computed(
      () => Boolean(collectionPath.value) && collectionRef.value?.value === undefined
    ),
  }
}
