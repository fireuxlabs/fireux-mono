import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { useCollectionById } from 'fireux-core/runtime/composables/shared/useCollectionById'
import type { Ref, ShallowRef } from 'vue'
import { computed, shallowRef, unref, watch } from 'vue'
import { resolveKitchenChildCollectionBasePath } from '../../collections/useKitchenChildCollection'
import type { KitchenOrder } from '../../../../../../models/order.model'

type UseKitchenOrderFetchOptions = {
	kitchenCollectionPath?: string | Ref<string | null | undefined>
  databaseId?: string | Ref<string | null | undefined>
}

const resolveKitchenOrdersPath = (basePath: string, kitchenId: string) =>
	`${basePath}/${kitchenId}/orders`

export function useKitchenOrderFetch(
	kitchenId: Ref<string> | string,
	options: UseKitchenOrderFetchOptions = {}
) {
	const { firestoreFetchCollection } = useFirestoreRead({
    databaseId: options.databaseId,
  })
  const { appId } = useFireUXConfig()

	const resolvedKitchenId = computed(() =>
		String(typeof kitchenId === 'string' ? kitchenId : kitchenId.value || '').trim()
	)

	const kitchenCollectionPath = computed(() =>
		resolveKitchenChildCollectionBasePath({
      kitchenCollectionPath: unref(options.kitchenCollectionPath),
      collectionName: 'orders',
      appId,
    })
	)

	const ordersPath = computed(() =>
		resolvedKitchenId.value
			? resolveKitchenOrdersPath(kitchenCollectionPath.value, resolvedKitchenId.value)
			: ''
	)
  const databaseIdKey = computed(() => String(unref(options.databaseId) || '').trim())

	const ordersRef = shallowRef(null) as ShallowRef<Ref<KitchenOrder[] | undefined> | null>

	watch(
		[ordersPath, databaseIdKey],
		([nextPath]) => {
			ordersRef.value = nextPath ? firestoreFetchCollection<KitchenOrder>(nextPath) : null
		},
		{ immediate: true }
	)

	const orders = computed<KitchenOrder[]>(() => ordersRef.value?.value ?? [])
  const pending = computed(
    () => Boolean(ordersPath.value) && ordersRef.value?.value === undefined
  )
  const { byId: order } = useCollectionById(orders)

	return {
		kitchenId: resolvedKitchenId,
		kitchenCollectionPath,
		ordersPath,
		orders,
    order,
    pending,
	}
}
