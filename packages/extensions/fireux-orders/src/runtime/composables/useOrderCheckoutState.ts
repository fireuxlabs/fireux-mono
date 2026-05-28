import { useRoute } from '#imports'
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify'
import { computed, ref, watch } from 'vue'
import type { OrderScopeType, OrderServiceMode } from '../models/order.model'
import { useBasket } from './useBasket'
import { useOrderCreate } from './useOrderCreate'

type QueryServiceMode = '' | OrderServiceMode

const parseModeFromQuery = (value: unknown): QueryServiceMode => {
  const raw = String(value || '').trim().toLowerCase()
  if (raw === 'dine-in' || raw === 'dine_in') return 'dine_in'
  if (raw === 'collection') return 'collection'
  if (raw === 'delivery') return 'delivery'
  return ''
}

export function useOrderCheckoutState() {
  const route = useRoute()
  const toast = useToastify()
  const { createOrder } = useOrderCreate()

  const {
    scopeType,
    scopeId,
    kitchenId,
    items,
    asOrderLines,
    subtotalMinor,
    currencyCode,
    isEmpty,
    incrementAt,
    decrementAt,
    removeAt,
    reset,
  } = useBasket()

  const modeFromQuery = computed<QueryServiceMode>(() => parseModeFromQuery(route.query.mode))
  const tableFromQuery = computed(() => String(route.query.table || '').trim())
  const kitchenIdFromQuery = computed(() => String(route.query.kitchen || '').trim())
  const scopeTypeFromQuery = computed(() =>
    String(route.query.scopeType || route.query.scope_type || (kitchenIdFromQuery.value ? 'kitchen' : '')).trim()
  )
  const scopeIdFromQuery = computed(() =>
    String(route.query.scopeId || route.query.scope_id || kitchenIdFromQuery.value || '').trim()
  )
  const kitchenNameFromQuery = computed(() =>
    String(route.query.kitchenName || route.query.kitchen_name || '').trim()
  )

  const checkoutKitchenId = computed(() =>
    String(kitchenId.value || kitchenIdFromQuery.value).trim()
  )
  const checkoutScopeType = computed<OrderScopeType>(
    () => (String(scopeType.value || scopeTypeFromQuery.value || '').trim() || 'kitchen') as OrderScopeType
  )
  const checkoutScopeId = computed(() =>
    String(scopeId.value || scopeIdFromQuery.value || checkoutKitchenId.value || '').trim()
  )
  const serviceModeLocked = computed(() => Boolean(modeFromQuery.value))

  const serviceMode = ref<OrderServiceMode>((modeFromQuery.value || 'dine_in') as OrderServiceMode)
  const tableLabel = ref(tableFromQuery.value)
  const tableLocked = computed(
    () => serviceModeLocked.value && serviceMode.value === 'dine_in' && Boolean(tableFromQuery.value)
  )
  const notes = ref('')
  const submitting = ref(false)
  const confirmedOrderId = ref('')

  watch(
    modeFromQuery,
    (nextMode: OrderServiceMode | '') => {
      if (!nextMode) return
      serviceMode.value = nextMode
    },
    { immediate: true }
  )

  watch(
    tableFromQuery,
    (nextTable: string) => {
      if (!nextTable) return
      tableLabel.value = nextTable
    },
    { immediate: true }
  )

  const kitchenDisplayPill = computed(
    () =>
      kitchenNameFromQuery.value ||
      checkoutKitchenId.value ||
      'Checkout'
  )

  const backToMenu = computed(() => {
    const returnTo = String(route.query.returnTo || '').trim()
    if (returnTo.startsWith('/')) return returnTo
    return '/'
  })

  const checkoutDescription = computed(() => 'Review basket and submit your order.')

  const submitCheckout = async () => {
    if (submitting.value) return

    const resolvedScopeType = String(checkoutScopeType.value || '').trim()
    const resolvedScopeId = String(checkoutScopeId.value || '').trim()
    if (!resolvedScopeType || !resolvedScopeId) {
      toast.error('Order context is missing')
      return
    }

    if (!asOrderLines.value.length) {
      toast.error('Basket is empty')
      return
    }

    submitting.value = true

    try {
      const orderId = await createOrder({
        scope: {
          type: resolvedScopeType,
          id: resolvedScopeId,
        },
        channel: 'menu',
        service: {
          mode: serviceMode.value,
          table_label:
            serviceMode.value === 'dine_in'
              ? (tableLocked.value ? tableFromQuery.value : tableLabel.value)
              : '',
          notes: notes.value,
        },
        lines: asOrderLines.value,
      })

      confirmedOrderId.value = orderId
      reset()
      toast.success('Order submitted')
    } catch (error: any) {
      toast.error(String(error?.message || 'Failed to submit order'))
    } finally {
      submitting.value = false
    }
  }

  return {
    items,
    subtotalMinor,
    currencyCode,
    isEmpty,
    incrementAt,
    decrementAt,
    removeAt,
    reset,
    checkoutKitchenId,
    kitchenDisplayPill,
    backToMenu,
    checkoutDescription,
    serviceMode,
    serviceModeLocked,
    tableLabel,
    tableLocked,
    notes,
    submitting,
    confirmedOrderId,
    submitCheckout,
  }
}
