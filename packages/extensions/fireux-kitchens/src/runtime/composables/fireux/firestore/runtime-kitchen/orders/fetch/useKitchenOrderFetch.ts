import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { useCollectionById } from 'fireux-core/runtime/composables/shared/useCollectionById'
import type { Ref, ShallowRef } from 'vue'
import { computed, shallowRef, unref, watch } from 'vue'
import { resolveKitchenConsoleCollectionPath } from '../../../../app/kitchen-runtime/shared'
import type { KitchenOrder } from '../../../../../../models/order.model'

type UseKitchenOrderFetchOptions = {
	kitchenCollectionPath?: string | Ref<string | null | undefined>
}

const resolveKitchenOrdersPath = (basePath: string, kitchenId: string) =>
	`${basePath}/${kitchenId}/orders`

export function useKitchenOrderFetch(
	kitchenId: Ref<string> | string,
	options: UseKitchenOrderFetchOptions = {}
) {
	const { firestoreFetchCollection } = useFirestoreRead()
  const { appId } = useFireUXConfig()

	const resolvedKitchenId = computed(() =>
		String(typeof kitchenId === 'string' ? kitchenId : kitchenId.value || '').trim()
	)

	const kitchenCollectionPath = computed(() =>
		String(unref(options.kitchenCollectionPath) || '').trim() ||
    resolveKitchenConsoleCollectionPath(appId)
	)

	const ordersPath = computed(() =>
		resolvedKitchenId.value
			? resolveKitchenOrdersPath(kitchenCollectionPath.value, resolvedKitchenId.value)
			: ''
	)

	const ordersRef = shallowRef(null) as ShallowRef<Ref<KitchenOrder[] | undefined> | null>

	watch(
		ordersPath,
		(nextPath) => {
			ordersRef.value = nextPath ? firestoreFetchCollection<KitchenOrder>(nextPath) : null
		},
		{ immediate: true }
	)

	const orders = computed<KitchenOrder[]>(() => ordersRef.value?.value ?? [])
  const { byId: order } = useCollectionById(orders)

	return {
		kitchenId: resolvedKitchenId,
		kitchenCollectionPath,
		ordersPath,
		orders,
    order,
	}
}
