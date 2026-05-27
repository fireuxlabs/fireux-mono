import { collection, doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useFirestore } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { resolveKitchenConsoleCollectionPath } from '../../collections/useKitchenChildCollection'
import type { KitchenOrder, KitchenOrderItem } from '../../../../../../../models/order.model'

type CreateKitchenOrderInput = {
	kitchenId: string
	dish_id: string
	label: string
	quantity?: number
	channel?: string
	kitchenCollectionPath?: string
	app_id?: string
	creator_id?: string
}

const makeOrderId = () => {
	const now = Date.now()
	const rand = Math.random().toString(16).slice(2)
	return `order-${now}-${rand}`
}

const makeOrderNumber = () => {
	const now = new Date()
	const y = String(now.getFullYear()).slice(-2)
	const m = String(now.getMonth() + 1).padStart(2, '0')
	const d = String(now.getDate()).padStart(2, '0')
	const hh = String(now.getHours()).padStart(2, '0')
	const mm = String(now.getMinutes()).padStart(2, '0')
	return `${y}${m}${d}-${hh}${mm}`
}

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useKitchenOrderCreate() {
	const db = useFirestore()
  const { appId } = useFireUXConfig()

	const createOrder = async (input: CreateKitchenOrderInput) => {
		const kitchenId = normalizeString(input.kitchenId)
		if (!kitchenId) throw new Error('Missing kitchenId')

		const kitchenCollectionPath =
			normalizeString(input.kitchenCollectionPath) || resolveKitchenConsoleCollectionPath(appId)

		const orderId = makeOrderId()

		const item: KitchenOrderItem = {
			id: `item-1`,
			dish_id: normalizeString(input.dish_id),
			label: normalizeString(input.label),
			quantity: Number(input.quantity || 1),
			checked: false,
		}

		const payload: KitchenOrder = {
			id: orderId,
			kitchen_id: kitchenId,

			order_number: makeOrderNumber(),
			status: 'open',
			channel: normalizeString(input.channel || 'menu'),

			items: [item],

			app_id: (input.app_id || appId || '') as any,
			creator_id: (input.creator_id || '') as any,
			created_at: serverTimestamp() as any,
			updated_at: serverTimestamp() as any,
			created: {
				at: serverTimestamp() as any,
				by: (input.creator_id || '') as any,
				app_id: (input.app_id || appId || '') as any,
			},
			updated: {
				at: serverTimestamp() as any,
				by: (input.creator_id || '') as any,
			},
		}

		const ordersCol = collection(db, `${kitchenCollectionPath}/${kitchenId}/orders`)
		const orderRef = doc(ordersCol, orderId)

		await setDoc(orderRef, payload, { merge: false })

		return orderId
	}

	return { createOrder }
}
