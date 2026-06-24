import {
  computed,
  ref,
  toValue,
  watch,
  type MaybeRefOrGetter,
} from 'vue'
import type { KitchenOrderType } from '../../../../models/order.model'
import { useMenuOrderCreate } from './useMenuOrderCreate'

type MenuOrderItem = {
  id: string
  name: string
}

type MenuOrderDraftItem = MenuOrderItem & {
  quantity: number
}

type MenuOrderDraftOptions = {
  kitchenSlug?: MaybeRefOrGetter<string | null | undefined>
  canOrder?: MaybeRefOrGetter<boolean>
  orderType?: MaybeRefOrGetter<KitchenOrderType>
  storageKey?: MaybeRefOrGetter<string | null | undefined>
}

const text = (value: unknown) => String(value ?? '').trim()
const isDraftItem = (value: unknown): value is MenuOrderDraftItem => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false

  const item = value as Partial<MenuOrderDraftItem>
  return Boolean(text(item.id) && text(item.name) && Number(item.quantity) > 0)
}

export function useMenuOrderDraft(
  menuId: MaybeRefOrGetter<string>,
  options: MenuOrderDraftOptions = {}
) {
  const key = computed(() => text(toValue(options.storageKey)))
  const canOrder = computed(() => toValue(options.canOrder) === true)
  const orderType = computed<KitchenOrderType>(() =>
    toValue(options.orderType) || 'dine_in'
  )
  const draft = ref<Record<string, MenuOrderDraftItem>>({})
  const items = computed<MenuOrderDraftItem[]>(() =>
    Object.values(draft.value)
  )
  const quantity = computed(() =>
    items.value.reduce((total, item) => total + item.quantity, 0)
  )
  const quantities = computed(() =>
    items.value.reduce<Record<string, number>>((map, item) => {
      map[item.id] = item.quantity
      return map
    }, {})
  )
  const {
    creatingItemId,
    message,
    error,
    createOrder,
  } = useMenuOrderCreate(menuId, {
    kitchenSlug: options.kitchenSlug,
  })

  watch(
    key,
    (nextKey: string) => {
      if (!import.meta.client || !nextKey) return

      try {
        const parsed = JSON.parse(window.localStorage.getItem(nextKey) || '{}')
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return

        draft.value = Object.values(parsed)
          .filter(isDraftItem)
          .reduce<Record<string, MenuOrderDraftItem>>((map, item) => {
            map[item.id] = {
              id: text(item.id),
              name: text(item.name),
              quantity: Number(item.quantity),
            }
            return map
          }, {})
      } catch {
        draft.value = {}
      }
    },
    { immediate: true }
  )

  watch(draft, (nextDraft: Record<string, MenuOrderDraftItem>) => {
    if (!import.meta.client || !key.value) return

    if (!Object.keys(nextDraft).length) {
      window.localStorage.removeItem(key.value)
      return
    }

    window.localStorage.setItem(key.value, JSON.stringify(nextDraft))
  }, { deep: true })

  watch(orderType, () => {
    clear()
  })

  function add(item: MenuOrderItem) {
    if (!canOrder.value) return

    const id = text(item.id)
    if (!id) return

    const current = draft.value[id]
    draft.value = {
      ...draft.value,
      [id]: {
        id,
        name: text(item.name),
        quantity: (current?.quantity || 0) + 1,
      },
    }
  }

  function remove(item: MenuOrderItem) {
    const id = text(item.id)
    const current = draft.value[id]
    if (!id || !current) return

    const next = { ...draft.value }
    if (current.quantity <= 1) {
      delete next[id]
    } else {
      next[id] = {
        ...current,
        quantity: current.quantity - 1,
      }
    }
    draft.value = next
  }

  function clear() {
    draft.value = {}
  }

  async function place() {
    if (!canOrder.value || !items.value.length) return

    const created = await createOrder({
      items: items.value.map((item) => ({
        itemId: item.id,
        quantity: item.quantity,
      })),
      order_type: orderType.value,
    })
    if (created) clear()
  }

  return {
    items,
    quantity,
    quantities,
    creatingItemId,
    message,
    error,
    add,
    remove,
    clear,
    place,
  }
}
