import {
  computed,
  proxyRefs,
  ref,
  shallowRef,
  toValue,
  watch,
} from 'vue'
import { useStoredChoice } from 'fireux-core/runtime/composables/shared/useStoredChoice'
import { menuOrderBasketActionLabel } from '../../../../../../utils/menu-ordering-ui'
import { readWeekdayTimeOpenState } from '../../../../../../utils/weekday-time'
import type { MenuFoodItem } from '../../../../../../models/kitchen/menu/menu-food.model'
import type {
  MenuOrderingFunnelState,
  MenuOrderingIncoming,
  MenuOrderingProcessing,
  MenuOrderingSending,
  MenuOrderingSubmitPayload,
} from '../../../../../../models/kitchen/menu/menu-ordering.model'
import {
  orderSessionStorageKey,
  useOrderSessionConflict,
} from './useOrderSession'
import { useMenuChoiceState } from './useMenuChoiceState'
import { useOrderDraft } from './useOrderDraft'
import {
  customerFromDelivery,
  text,
} from './order-input'
import type {
  MenuDetailView,
  PanelState,
  UseKitchenOrderFunnelOptions,
} from './types'

export type {
  MenuChoiceOption,
  MenuChoiceValue,
  MenuDetailItem,
  MenuDetailOrderItem,
  MenuDetailView,
  MenuSurfaceOption,
} from './types'

const panelStates = ['closed', 'open'] as const satisfies readonly PanelState[]

// Order funnel spine: keep this file as the small public controller assembly.
export function useFunnel(options: UseKitchenOrderFunnelOptions) {
  const choice = useMenuChoiceState(options)
  const orderChoiceActive = computed(() =>
    choice.canOrder.value &&
    Boolean(choice.selectedChoiceOption.value.orderType)
  )
  const sessionGuard = useOrderSessionConflict({
    enabled: orderChoiceActive,
    kitchenSlug: choice.sessionKitchenSlug,
    context: choice.menuContext,
    menuId: choice.menuId,
    menuRouteMode: choice.menuRouteMode,
    orderType: choice.selectedOrderType,
  })
  const immediateServiceAvailable = computed(() => {
    if (['collection', 'pre_order'].includes(choice.selectedOrderType.value)) return true

    const state = readWeekdayTimeOpenState(
      choice.behaviour.value?.ordering.service_hours?.operation_hours
    )

    return !state.known || state.open
  })
  const canAddToSession = computed(() =>
    choice.canOrder.value &&
    immediateServiceAvailable.value &&
    !sessionGuard.hasConflict.value
  )
  const isOrderMode = computed(() =>
    canAddToSession.value &&
    Boolean(choice.selectedChoiceOption.value.orderType)
  )
  const { selected: panelState } = useStoredChoice<PanelState>({
    key: computed(() =>
      [
        'fireux:menu',
        choice.menuStorageScope.value,
        'funnel',
        choice.selectedOrderType.value,
      ].filter(Boolean).join(':')
    ),
    choices: panelStates,
    fallback: 'closed',
  })
  const panelOpen = computed({
    get: () => panelState.value === 'open',
    set: (open: boolean) => {
      panelState.value = open ? 'open' : 'closed'
    },
  })
  const selectedItemId = ref('')
  const draft = useOrderDraft(options.menuId, {
    kitchenSlug: options.kitchenSlug,
    menuContext: choice.menuContext,
    menuRouteMode: choice.menuRouteMode,
    canOrder: canAddToSession,
    orderType: choice.selectedOrderType,
    sourceMenuId: choice.sourceMenuId,
    storageKey: computed(() =>
      orderSessionStorageKey({
        kitchenSlug: choice.sessionKitchenSlug.value,
        menuId: choice.menuId.value,
        orderType: choice.selectedOrderType.value,
      })
    ),
  })
  const collectedIncoming = shallowRef<Partial<MenuOrderingIncoming>>({})
  const deliveryCustomer = computed(() =>
    choice.selectedOrderType.value === 'delivery'
      ? customerFromDelivery(collectedIncoming.value.delivery)
      : {}
  )
  const orderEndpoint = computed(() => {
    if (!choice.menuId.value) return ''

    const query = new URLSearchParams()
    if (choice.kitchenSlug.value) query.set('kitchenSlug', choice.kitchenSlug.value)
    if (choice.menuContext.value !== 'generic') query.set('context', choice.menuContext.value)
    query.set('menuRouteMode', choice.menuRouteMode.value)

    const qs = query.toString()
    return `/api/menus/${encodeURIComponent(choice.menuId.value)}/orders${qs ? `?${qs}` : ''}`
  })
  const detailView = computed<MenuDetailView | null>(() => {
    const menu = toValue(options.menu)
    if (!menu) return null

    return {
      menu,
      choices: choice.choiceOptions.value,
      surfaceOptions: choice.surfaceOptions.value,
      surfaceLabel: choice.surfaceLabel.value,
      selectedChoice: choice.selectedChoice.value,
      selectedItemId: selectedItemId.value,
      orderMode: isOrderMode.value,
      dimmed: panelOpen.value,
    }
  })
  const incoming = computed<MenuOrderingIncoming>(() => ({
    order_type: choice.selectedOrderType.value,
    basket: draft.items.value.map((item) => ({
      item_id: item.id,
      ...(item.menuId ? { menu_id: item.menuId } : {}),
      ...(item.lineId && item.lineId !== item.id ? { line_id: item.lineId } : {}),
      name: item.name,
      quantity: item.quantity,
      ...(item.unitPrice ? { unit_price_chf: item.unitPrice } : {}),
    })),
    ...collectedIncoming.value,
  }))
  const processing = computed<MenuOrderingProcessing>(() => {
    const order = draft.sentOrder.value
    const total = draft.items.value.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    )

    return {
      exists: Boolean(order),
      order_id: order?.id || '',
      order_number: order?.order_number || '',
      status: draft.trackedStatus.value?.status || order?.status || '',
      items: order?.receipt?.items || draft.items.value,
      total_chf: order?.receipt?.total_chf || total,
      estimated_ready_minutes: draft.trackedStatus.value?.estimated_ready_minutes || 0,
      estimated_ready_at: draft.trackedStatus.value?.estimated_ready_at || '',
      driver_watching_count: draft.trackedStatus.value?.driver_watching_count || 0,
      order: order || null,
    }
  })
  const sending = computed<MenuOrderingSending>(() => ({
    endpoint: orderEndpoint.value,
    body: {
      channel: choice.orderChannel.value,
      order_type: choice.selectedOrderType.value,
      items: draft.items.value.map((item) => ({
        item_id: item.id,
        ...(item.menuId ? { menu_id: item.menuId } : {}),
        quantity: item.quantity,
        ...(item.addOns?.length
          ? {
              add_ons: item.addOns.map((addOn) => ({
                id: addOn.id,
                label: addOn.label,
                ...(addOn.price ? { price: addOn.price } : {}),
                ...(addOn.priceLabel ? { price_label: addOn.priceLabel } : {}),
              })),
            }
          : {}),
        ...(item.variant
          ? {
              variant: {
                id: item.variant.id,
                label: item.variant.label,
                ...(item.variant.price ? { price: item.variant.price } : {}),
                ...(item.variant.priceLabel
                  ? { price_label: item.variant.priceLabel }
                  : {}),
              },
            }
          : {}),
      })),
      ...(collectedIncoming.value.collection ? { collection: collectedIncoming.value.collection } : {}),
      ...(collectedIncoming.value.payment_method ? { payment_method: collectedIncoming.value.payment_method } : {}),
      ...(Object.keys(deliveryCustomer.value).length ? { customer: deliveryCustomer.value } : {}),
      ...(collectedIncoming.value.table ? { table: collectedIncoming.value.table } : {}),
      ...(collectedIncoming.value.room_service ? { room_service: collectedIncoming.value.room_service } : {}),
    },
    pending: draft.creatingItemId.value === 'order',
    ...(draft.message.value ? { message: draft.message.value } : {}),
    ...(draft.error.value ? { error: draft.error.value } : {}),
    ...(draft.sentOrder.value ? { sent_order: draft.sentOrder.value } : {}),
  }))
  const funnelView = computed<MenuOrderingFunnelState>(() => {
    const serviceHours = choice.behaviour.value?.ordering.service_hours
    const currencyCode = text(toValue(options.menu)?.presentation.currencyCode)

    return {
      actionLabel: menuOrderBasketActionLabel(choice.selectedOrderType.value),
      accepted: draft.acceptedOrder.value,
      awaitingAcceptance: draft.awaitingAcceptance.value,
      currencyCode,
      channel: choice.orderChannel.value,
      panelOpen: panelOpen.value,
      items: draft.items.value,
      message: draft.error.value || draft.awaitingMessage.value || draft.message.value,
      menuId: choice.menuId.value,
      kitchenSlug: choice.kitchenSlug.value,
      orderType: choice.selectedOrderType.value,
      pending: draft.creatingItemId.value === 'order',
      ...(choice.selectedOrderTypeConfig.value ? { policy: choice.selectedOrderTypeConfig.value } : {}),
      quantity: draft.quantity.value,
      ...(serviceHours ? { serviceHours } : {}),
      selection: {
        items: draft.items.value,
        quantity: draft.quantity.value,
      },
      sentOrder: draft.sentOrder.value,
    }
  })
  const showFunnel = computed(() =>
    isOrderMode.value &&
    (draft.quantity.value > 0 || Boolean(draft.sentOrder.value))
  )

  function selectItem(item: MenuFoodItem) {
    const id = text(item.id)
    if (id) selectedItemId.value = selectedItemId.value === id ? '' : id
  }

  function openPanel() {
    panelOpen.value = true
  }

  function openSession() {
    const conflict = sessionGuard.conflict.value
    if (!conflict || !choice.selectOrderType(conflict.orderType)) return
    panelOpen.value = true
  }

  function closePanel() {
    panelOpen.value = false
  }

  function submit(payload: MenuOrderingSubmitPayload) {
    const customer = {
      ...deliveryCustomer.value,
      ...(payload.customer || {}),
    }

    return draft.place({
      ...payload,
      channel: choice.orderChannel.value,
      ...(Object.keys(customer).length ? { customer } : {}),
    })
  }

  function collect(payload: Partial<MenuOrderingIncoming>) {
    collectedIncoming.value = {
      ...collectedIncoming.value,
      ...payload,
    }
  }

  watch(draft.quantity, (quantity: number) => {
    if (!quantity && !draft.sentOrder.value) closePanel()
    if (!quantity) collectedIncoming.value = {}
  })

  watch(choice.selectedOrderType, () => {
    collectedIncoming.value = {}
    selectedItemId.value = ''
  })

  return {
    detail: proxyRefs({
      add: draft.add,
      select: choice.setSelectedChoice,
      selectItem,
      selectOrderType: choice.selectOrderType,
      view: detailView,
    }),
    funnel: proxyRefs({
      clear: draft.clear,
      close: closePanel,
      collect,
      incoming,
      open: openPanel,
      openSession,
      order: funnelView,
      pay: draft.pay,
      payment: draft.payment,
      processing,
      restartSession: sessionGuard.restart,
      sending,
      sessionConflict: sessionGuard.conflict,
      show: showFunnel,
      submit,
    }),
  }
}
