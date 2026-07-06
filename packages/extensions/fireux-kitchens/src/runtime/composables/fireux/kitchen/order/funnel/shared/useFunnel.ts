import {
  computed,
  onBeforeUnmount,
  onMounted,
  proxyRefs,
  ref,
  shallowRef,
  toValue,
  watch,
  type MaybeRefOrGetter,
} from 'vue'
import { useStoredChoice } from 'fireux-core/runtime/composables/shared/useStoredChoice'
import {
  menuOrderBasketActionLabel,
  menuOrderTypeLabel,
} from '../../../../../../utils/menu-ordering-ui'
import {
  menuContextProfile,
  normalizeMenuRouteContext,
} from '../../../../../../utils/menu-context'
import type {
  KitchenOrderCustomer,
  KitchenOrderPaymentMethod,
  KitchenOrderType,
} from '../../../../../../models/kitchen/order.model'
import type { MenuRouteContext } from '../../../../../../models/kitchen/menu/menu-context.model'
import type { MenuManifest } from '../../../../../../models/kitchen/menu/menu-detail.model'
import type {
  MenuFoodItem,
  MenuFoodOrderItem,
} from '../../../../../../models/kitchen/menu/menu-food.model'
import type {
  MenuOrderTypeConfig,
  MenuChoice,
} from '../../../../../../models/kitchen/menu/menu.model'
import type {
  CreatedMenuOrder,
  MenuOrderingCollectionState,
  MenuOrderingDeliveryState,
  MenuOrderingIncoming,
  MenuOrderingProcessing,
  MenuOrderingSending,
  MenuOrderingFunnelState,
  MenuOrderingSubmitPayload,
} from '../../../../../../models/kitchen/menu/menu-ordering.model'

export type MenuChoiceValue = string
export type MenuChoiceOption = {
  value: MenuChoiceValue
  label: string
  menuId?: string
  to?: string
  orderType?: KitchenOrderType
  message?: string
}
export type MenuSurfaceOption = {
  value: MenuRouteContext
  label: string
  to: string
  active: boolean
}
export type MenuDetailItem = MenuFoodItem
export type MenuDetailOrderItem = MenuFoodOrderItem
export type MenuDetailView = {
  menu: MenuManifest
  choices: MenuChoiceOption[]
  surfaceOptions: MenuSurfaceOption[]
  surfaceLabel: string
  selectedChoice: MenuChoiceValue
  selectedItemId: string
  orderMode: boolean
  dimmed: boolean
}

type UseKitchenOrderFunnelOptions = {
  menu: MaybeRefOrGetter<MenuManifest | null>
  menuId: MaybeRefOrGetter<string>
  menuContext?: MaybeRefOrGetter<MenuRouteContext | string | null | undefined>
  kitchenSlug?: MaybeRefOrGetter<string | null | undefined>
}
type PanelState = 'closed' | 'open'

const text = (value: unknown) => String(value ?? '').trim()
const panelStates = ['closed', 'open'] as const satisfies readonly PanelState[]
const supportedOrderTypes = [
  'dine_in',
  'eat_in',
  'takeaway',
  'collection',
  'delivery',
  'pre_order',
  'room_service',
] as const satisfies readonly KitchenOrderType[]
const defaultMenuChoice = (): MenuChoiceOption => ({
  value: 'menu',
  label: 'Menu',
})
const surfaceContexts = [
  {
    context: 'home',
    label: 'Home',
    orderTypes: ['delivery', 'collection'],
  },
  {
    context: 'dine_in',
    label: 'Dine in',
    orderTypes: ['dine_in'],
  },
  {
    context: 'kiosk',
    label: 'Kiosk',
    orderTypes: ['eat_in', 'takeaway'],
  },
  {
    context: 'pre_order',
    label: 'Pre-order',
    orderTypes: ['pre_order'],
  },
  {
    context: 'room_service',
    label: 'Room service',
    orderTypes: ['room_service'],
  },
] as const satisfies readonly {
  context: MenuRouteContext
  label: string
  orderTypes: readonly KitchenOrderType[]
}[]
const contextLabels = {
  generic: '',
  home: 'Home',
  table: 'Table',
  kiosk: 'Kiosk',
  dine_in: 'Dine in',
  eat_in: 'Eat in',
  takeaway: 'Takeaway',
  pre_order: 'Pre-order',
  room_service: 'Room service',
} as const satisfies Record<MenuRouteContext, string>
const orderChoiceValue = (type: KitchenOrderType): MenuChoiceValue =>
  `order:${type}`
const orderType = (value: unknown): KitchenOrderType | undefined =>
  supportedOrderTypes.includes(value as KitchenOrderType)
    ? value as KitchenOrderType
    : undefined
const orderTypeIndex = (
  visibleOrderTypes: KitchenOrderType[],
  option: MenuChoiceOption
) => option.orderType ? visibleOrderTypes.indexOf(option.orderType) : -1

const menuChoiceOption = (choice: MenuChoice): MenuChoiceOption | null => {
  const type = orderType(choice.order_type)

  if (
    !choice.value ||
    !choice.label
  ) {
    return null
  }

  return {
    value: choice.value,
    label: choice.label,
    ...(choice.menu_id ? { menuId: choice.menu_id } : {}),
    ...(choice.to ? { to: choice.to } : {}),
    ...(type ? { orderType: type } : {}),
    ...(choice.message ? { message: choice.message } : {}),
  }
}
const contextualMenuPath = (
  menuId: string,
  kitchenSlug: string,
  context: MenuRouteContext
) => {
  const contextualMenuId = context === 'generic'
    ? menuId
    : `${menuId}.${context}`

  return kitchenSlug
    ? `/kitchens/${encodeURIComponent(kitchenSlug)}/menus/${encodeURIComponent(contextualMenuId)}`
    : `/menus/${encodeURIComponent(contextualMenuId)}`
}

// Order funnel spine: Menu/Detail composes the menu layer; this seam owns order draft and funnel state.
export function useFunnel(options: UseKitchenOrderFunnelOptions) {
  const behaviour = computed(() => toValue(options.menu)?.behaviour)
  const menuContext = computed(() =>
    normalizeMenuRouteContext(toValue(options.menuContext) || behaviour.value?.context)
  )
  const contextProfile = computed(() => menuContextProfile(menuContext.value))
  const visibleOrderTypes = computed(() => contextProfile.value.visibleOrderTypes)
  const menuStorageScope = computed(() => {
    const slug = text(toValue(options.kitchenSlug))
    const id = text(toValue(options.menuId))
    const scope = slug ? `${slug}:${id}` : id

    return [scope, menuContext.value].filter(Boolean).join(':')
  })
  const orderTypes = computed<KitchenOrderType[]>(() =>
    Array.isArray(behaviour.value?.orderTypes) ? behaviour.value.orderTypes : []
  )
  const availableOrderTypes = computed<KitchenOrderType[]>(() =>
    visibleOrderTypes.value.filter((type) => orderTypes.value.includes(type))
  )
  const defaultOrderType = computed<KitchenOrderType>(() => {
    const preferred = contextProfile.value.defaultOrderType
    if (preferred && orderTypes.value.includes(preferred)) return preferred

    return availableOrderTypes.value[0] || orderTypes.value[0] || 'dine_in'
  })
  const orderTypeConfigs = computed<MenuOrderTypeConfig[]>(() => {
    const rows = behaviour.value?.ordering?.order_types

    return Array.isArray(rows) ? rows : []
  })
  const canOrder = computed(() =>
    Boolean(behaviour.value?.orderingEnabled && availableOrderTypes.value.length)
  )
  const isVisibleChoice = (option: MenuChoiceOption) =>
    option.orderType
      ? availableOrderTypes.value.includes(option.orderType)
      : menuContext.value === 'generic'
  const sortChoiceOptions = (options: MenuChoiceOption[]) =>
    [...options].sort((left, right) =>
      orderTypeIndex(visibleOrderTypes.value, left) -
        orderTypeIndex(visibleOrderTypes.value, right)
    )
  const generatedChoiceOptions = computed<MenuChoiceOption[]>(() => {
    if (!canOrder.value) return [defaultMenuChoice()]

    const choices = availableOrderTypes.value
      .map((type) => {
        const config = orderTypeConfigs.value.find((row) => row.type === type)

        return {
          value: orderChoiceValue(type),
          label: menuOrderTypeLabel(type),
          orderType: type,
          ...(config?.message ? { message: config.message } : {}),
        }
      })

    return choices.length ? choices : [defaultMenuChoice()]
  })
  const menuChoiceOptions = computed<MenuChoiceOption[]>(() => {
    const choices = Array.isArray(behaviour.value?.choices)
      ? behaviour.value.choices
          .map(menuChoiceOption)
          .filter((choice): choice is MenuChoiceOption => Boolean(choice))
      : []

    const visibleChoices = sortChoiceOptions(choices.filter(isVisibleChoice))

    return visibleChoices.length > 1 && visibleChoices.some((choice) => !choice.to)
      ? visibleChoices
      : []
  })
  const choiceOptions = computed<MenuChoiceOption[]>(() => {
    const choices = sortChoiceOptions((menuChoiceOptions.value.length
      ? menuChoiceOptions.value
      : generatedChoiceOptions.value).filter(isVisibleChoice))

    return choices.length ? choices : [defaultMenuChoice()]
  })
  const localChoiceOptions = computed<MenuChoiceOption[]>(() => {
    const local = sortChoiceOptions(
      choiceOptions.value.filter((option) => !option.to && isVisibleChoice(option))
    )
    const generated = sortChoiceOptions(
      generatedChoiceOptions.value.filter(isVisibleChoice)
    )

    return local.length ? local : generated.length ? generated : [defaultMenuChoice()]
  })
  const choiceValues = computed<MenuChoiceValue[]>(() =>
    localChoiceOptions.value.map((option) => option.value)
  )
  const preferredChoice = computed<MenuChoiceValue>(() => {
    const preferred = contextProfile.value.defaultOrderType
      ? localChoiceOptions.value.find((option) =>
          option.orderType === contextProfile.value.defaultOrderType
        )
      : undefined

    return preferred?.value || choiceValues.value[0] || defaultMenuChoice().value
  })
  const { selected: selectedChoice } = useStoredChoice<MenuChoiceValue>({
    key: computed(() => `fireux:menu:${menuStorageScope.value}:choice`),
    choices: choiceValues,
    fallback: preferredChoice,
  })
  const selectedChoiceOption = computed<MenuChoiceOption>(() =>
    localChoiceOptions.value.find((option) =>
      option.value === selectedChoice.value
    ) ||
    localChoiceOptions.value[0] ||
    defaultMenuChoice()
  )
  const selectedOrderType = computed<KitchenOrderType>(() =>
    selectedChoiceOption.value.orderType || 'dine_in'
  )
  const selectedOrderTypeConfig = computed(() =>
    orderTypeConfigs.value.find((type) => type.type === selectedOrderType.value) ||
    orderTypeConfigs.value.find((type) => type.type === defaultOrderType.value) ||
    orderTypeConfigs.value[0]
  )
  const isOrderMode = computed(() =>
    canOrder.value &&
      Boolean(selectedChoiceOption.value.orderType)
  )
  const { selected: panelState } = useStoredChoice<PanelState>({
    key: computed(() =>
      [
        'fireux:menu',
        menuStorageScope.value,
        'funnel',
        selectedOrderType.value,
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
  const draft = useDraft(options.menuId, {
    kitchenSlug: options.kitchenSlug,
    canOrder,
    orderType: selectedOrderType,
    storageKey: computed(() => `fireux:menu:${menuStorageScope.value}:order`),
  })
  const collectedIncoming = shallowRef<Partial<MenuOrderingIncoming>>({})
  const deliveryCustomer = computed(() =>
    selectedOrderType.value === 'delivery'
      ? customerFromDelivery(collectedIncoming.value.delivery)
      : {}
  )
  const selectedItemId = ref('')
  const menuId = computed(() => text(toValue(options.menuId)))
  const kitchenSlug = computed(() => text(toValue(options.kitchenSlug)))
  const surfaceOptions = computed<MenuSurfaceOption[]>(() => {
    if (!menuId.value || !orderTypes.value.length) return []

    const surfaces = surfaceContexts.filter((surface) =>
      surface.orderTypes.some((type) => orderTypes.value.includes(type))
    )

    return surfaces.map((surface) => ({
      value: surface.context,
      label: surface.label,
      to: contextualMenuPath(menuId.value, kitchenSlug.value, surface.context),
      active: menuContext.value === surface.context,
    }))
  })
  const surfaceLabel = computed(() => contextLabels[menuContext.value])
  const orderEndpoint = computed(() => {
    if (!menuId.value) return ''

    const query = new URLSearchParams()
    if (kitchenSlug.value) query.set('kitchenSlug', kitchenSlug.value)

    const qs = query.toString()
    return `/api/menus/${encodeURIComponent(menuId.value)}/orders${qs ? `?${qs}` : ''}`
  })
  const detailView = computed<MenuDetailView | null>(() => {
    const menu = toValue(options.menu)
    if (!menu) return null

    return {
      menu,
      choices: choiceOptions.value,
      surfaceOptions: surfaceOptions.value,
      surfaceLabel: surfaceLabel.value,
      selectedChoice: selectedChoice.value,
      selectedItemId: selectedItemId.value,
      orderMode: isOrderMode.value,
      dimmed: panelOpen.value,
    }
  })
  const incoming = computed<MenuOrderingIncoming>(() => {
    return {
      order_type: selectedOrderType.value,
      basket: draft.items.value.map((item) => ({
        item_id: item.id,
        ...(item.lineId && item.lineId !== item.id ? { line_id: item.lineId } : {}),
        name: item.name,
        quantity: item.quantity,
        ...(item.unitPrice ? { unit_price_chf: item.unitPrice } : {}),
      })),
      ...collectedIncoming.value,
    }
  })
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
      status: order?.status || '',
      fire_state: order?.fire_state || '',
      items: order?.receipt?.items || draft.items.value,
      total_chf: order?.receipt?.total_chf || total,
      estimated_ready_minutes: 0,
      estimated_ready_at: '',
      order: order || null,
    }
  })
  const sending = computed<MenuOrderingSending>(() => ({
    endpoint: orderEndpoint.value,
    body: {
      order_type: selectedOrderType.value,
      items: draft.items.value.map((item) => ({
        itemId: item.id,
        quantity: item.quantity,
        ...(item.addOns?.length ? { addOns: item.addOns } : {}),
        ...(item.variant ? { variant: item.variant } : {}),
      })),
      ...(collectedIncoming.value.collection
        ? { collection: collectedIncoming.value.collection }
        : {}),
      ...(Object.keys(deliveryCustomer.value).length
        ? { customer: deliveryCustomer.value }
        : {}),
    },
    pending: draft.creatingItemId.value === 'order',
    expected_result: {
      status: ['collection', 'delivery'].includes(selectedOrderType.value)
        ? 'pending_acceptance'
        : 'open',
    },
    ...(draft.message.value ? { message: draft.message.value } : {}),
    ...(draft.error.value ? { error: draft.error.value } : {}),
    ...(draft.sentOrder.value ? { sent_order: draft.sentOrder.value } : {}),
  }))
  const funnelView = computed<MenuOrderingFunnelState>(() => {
    const policy = selectedOrderTypeConfig.value
    const serviceHours = behaviour.value?.ordering.service_hours

    return {
      actionLabel: menuOrderBasketActionLabel(selectedOrderType.value),
      accepted: draft.acceptedOrder.value,
      awaitingAcceptance: draft.awaitingAcceptance.value,
      panelOpen: panelOpen.value,
      items: draft.items.value,
      message: draft.error.value || draft.awaitingMessage.value || draft.message.value,
      menuId: menuId.value,
      kitchenSlug: kitchenSlug.value,
      orderType: selectedOrderType.value,
      pending: draft.creatingItemId.value === 'order',
      ...(policy ? { policy } : {}),
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
      (
        draft.quantity.value > 0 ||
        Boolean(draft.sentOrder.value)
      )
  )

  function setSelectedChoice(value: MenuChoiceValue) {
    selectedChoice.value = value
  }

  function selectItem(item: MenuFoodItem) {
    const id = text(item.id)
    if (!id) return

    selectedItemId.value = selectedItemId.value === id ? '' : id
  }

  function openPanel() {
    panelOpen.value = true
  }

  function closePanel() {
    panelOpen.value = false
  }

  function submit(payload: MenuOrderingSubmitPayload) {
    const fallbackCustomer = deliveryCustomer.value
    const customer = {
      ...fallbackCustomer,
      ...(payload.customer || {}),
    }

    return draft.place({
      ...payload,
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
  })

  watch(draft.quantity, (quantity: number) => {
    if (quantity) return

    collectedIncoming.value = {}
  })

  watch(selectedOrderType, () => {
    collectedIncoming.value = {}
    selectedItemId.value = ''
  })

  return {
    detail: proxyRefs({
      view: detailView,
      add: draft.add,
      select: setSelectedChoice,
      selectItem,
    }),
    funnel: proxyRefs({
      show: showFunnel,
      order: funnelView,
      clear: draft.clear,
      collect,
      close: closePanel,
      incoming,
      open: openPanel,
      processing,
      sending,
      submit,
    }),
  }
}

type MenuOrderItem = {
  id: string
  name: string
  addOns?: MenuOrderAddOn[]
  lineId?: string
  price?: number
  variant?: MenuOrderVariant
}

type MenuOrderAddOn = {
  id: string
  label: string
  price?: number
  priceLabel?: string
}

type MenuOrderVariant = {
  id: string
  label: string
  price?: number
  priceLabel?: string
}

type MenuOrderDraftItem = MenuOrderItem & {
  lineId: string
  quantity: number
  unitPrice: number
}

type MenuOrderDraftOptions = {
  kitchenSlug?: MaybeRefOrGetter<string | null | undefined>
  canOrder?: MaybeRefOrGetter<boolean>
  orderType?: MaybeRefOrGetter<KitchenOrderType>
  storageKey?: MaybeRefOrGetter<string | null | undefined>
}

type MenuOrderLineInput = {
  itemId: string
  quantity: number
  addOns?: MenuOrderVariantInput[]
  variant?: MenuOrderVariantInput
}

type MenuOrderVariantInput = {
  id?: string
  label?: string
  price?: number
  priceLabel?: string
}

type CreateMenuOrderInput = {
  items: MenuOrderLineInput[]
  order_type?: KitchenOrderType
  collection?: MenuOrderingCollectionState
  payment_method?: KitchenOrderPaymentMethod
  requested_for?: string
  customer?: KitchenOrderCustomer
}

type UseMenuOrderCreateOptions = {
  kitchenSlug?: MaybeRefOrGetter<string | null | undefined>
}

type KitchenOrderFunnelStatus = {
  id: string
  order_number: string
  status: string
  order_type: string
  fire_state: string
  estimated_ready_minutes: number
  estimated_ready_at: string
}

type UseMenuOrderStatusOptions = {
  kitchenSlug?: MaybeRefOrGetter<string | null | undefined>
  enabled?: MaybeRefOrGetter<boolean>
}

const numberValue = (value: unknown) => {
  const number = Number(value)

  return Number.isFinite(number) ? number : 0
}
const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
const normalizeVariant = (value: unknown): MenuOrderVariant | undefined => {
  const source = record(value)
  const id = text(source.id)
  const label = text(source.label)
  const price = numberValue(source.price)
  const priceLabel = text(source.priceLabel || source.price_label)
  if (!id && !label) return undefined

  return {
    id,
    label,
    ...(price ? { price } : {}),
    ...(priceLabel ? { priceLabel } : {}),
  }
}
const normalizeAddOns = (value: unknown): MenuOrderAddOn[] => {
  if (!Array.isArray(value)) return []

  return value
    .map(normalizeVariant)
    .filter((addOn): addOn is MenuOrderAddOn => Boolean(addOn))
}
const isDraftItem = (value: unknown): value is MenuOrderDraftItem => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false

  const item = value as Partial<MenuOrderDraftItem>
  return Boolean(
    text(item.id) &&
    text(item.name) &&
    text(item.lineId || item.id) &&
    Number(item.quantity) > 0
  )
}
const cleanVariant = (variant: MenuOrderVariantInput | undefined) => {
  const id = text(variant?.id)
  const label = text(variant?.label)
  const price = numberValue(variant?.price)
  const priceLabel = text(variant?.priceLabel)
  if (!id && !label) return undefined

  return {
    id,
    label,
    ...(price ? { price } : {}),
    ...(priceLabel ? { priceLabel } : {}),
  }
}
const cleanAddOns = (addOns: MenuOrderVariantInput[] | undefined) =>
  Array.isArray(addOns)
    ? addOns.map(cleanVariant).filter((addOn): addOn is NonNullable<ReturnType<typeof cleanVariant>> => Boolean(addOn))
    : []
const cleanCustomer = (customer: KitchenOrderCustomer | undefined) => {
  const clean = {
    name: text(customer?.name),
    phone: text(customer?.phone),
    address: text(customer?.address),
    address_place_id: text(customer?.address_place_id),
    allergy_note: text(customer?.allergy_note),
    notes: text(customer?.notes),
    party_size: Math.max(0, Math.floor(numberValue(customer?.party_size))),
  }

  return Object.fromEntries(
    Object.entries(clean).filter(([, value]) => value)
  )
}
const customerFromDelivery = (
  delivery: MenuOrderingDeliveryState | undefined
): KitchenOrderCustomer => {
  const address = delivery?.address

  return cleanCustomer({
    address: text(address?.formatted || address?.input),
    address_place_id: text(address?.place_id),
  })
}
const isClearedOrderStatus = (status: unknown) =>
  ['trashed', 'deleted', 'cancelled', 'canceled'].includes(text(status))

function useDraft(
  menuId: MaybeRefOrGetter<string>,
  options: MenuOrderDraftOptions = {}
) {
  const key = computed(() => text(toValue(options.storageKey)))
  const canOrder = computed(() => toValue(options.canOrder) === true)
  const orderType = computed<KitchenOrderType>(() =>
    toValue(options.orderType) || 'dine_in'
  )
  const draft = ref<Record<string, MenuOrderDraftItem>>({})
  const hasMounted = ref(false)
  const awaitingAcceptance = ref(false)
  const acceptedOrder = ref(false)
  const trackedOrder = ref<CreatedMenuOrder | null>(null)
  const items = computed<MenuOrderDraftItem[]>(() =>
    Object.values(draft.value)
  )
  const quantity = computed(() =>
    items.value.reduce((total, item) => total + item.quantity, 0)
  )
  const {
    creatingItemId,
    message,
    error,
    createOrder,
  } = useCreate(menuId, {
    kitchenSlug: options.kitchenSlug,
  })
  const {
    status: trackedOrderStatus,
  } = useStatus(
    menuId,
    computed(() => trackedOrder.value?.id || ''),
    {
      kitchenSlug: options.kitchenSlug,
      enabled: computed(() => awaitingAcceptance.value),
    }
  )
  const awaitingMessage = computed(() => {
    const status = trackedOrderStatus.value
    if (message.value) return message.value
    if (!trackedOrder.value) return ''

    if (!acceptedOrder.value) {
      return ''
    }

    const minutes = Number(status?.estimated_ready_minutes || 0)
    if (minutes > 0) {
      return `Accepted. Estimated ready in ${minutes} minutes.`
    }

    return 'Accepted. The kitchen is preparing your order.'
  })

  function restoreDraft(nextKey: string) {
    if (!import.meta.client || !nextKey) return

    try {
      const parsed = JSON.parse(window.localStorage.getItem(nextKey) || '{}')
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return

      draft.value = Object.values(parsed)
        .filter(isDraftItem)
        .reduce<Record<string, MenuOrderDraftItem>>((map, item) => {
          const lineId = text(item.lineId || item.id)
          const variant = normalizeVariant(item.variant)
          const addOns = normalizeAddOns(item.addOns)

          map[lineId] = {
            id: text(item.id),
            lineId,
            name: text(item.name),
            quantity: Number(item.quantity),
            unitPrice: numberValue(item.unitPrice),
            ...(addOns.length ? { addOns } : {}),
            ...(variant ? { variant } : {}),
          }
          return map
        }, {})
    } catch {
      draft.value = {}
    }
  }

  onMounted(() => {
    hasMounted.value = true
    restoreDraft(key.value)
  })

  watch(key, (nextKey: string) => {
    if (!hasMounted.value) return
    restoreDraft(nextKey)
  })

  watch(draft, (nextDraft: Record<string, MenuOrderDraftItem>) => {
    if (!import.meta.client || !key.value) return

    if (!Object.keys(nextDraft).length) {
      window.localStorage.removeItem(key.value)
      return
    }

    window.localStorage.setItem(key.value, JSON.stringify(nextDraft))
  }, { deep: true })

  function add(item: MenuOrderItem) {
    if (!canOrder.value) return
    awaitingAcceptance.value = false
    acceptedOrder.value = false
    trackedOrder.value = null

    const id = text(item.id)
    const lineId = text(item.lineId) || id
    if (!id) return

    const variant = normalizeVariant(item.variant)
    const addOns = normalizeAddOns(item.addOns)
    const current = draft.value[lineId]
    const addOnsPrice = addOns.reduce(
      (total, addOn) => total + numberValue(addOn.price),
      0
    )
    const basePrice = numberValue(variant?.price) || numberValue(item.price)
    const unitPrice = basePrice + addOnsPrice
    const suffix = [
      variant?.label,
      addOns.length
        ? `+ ${addOns.map((addOn) => addOn.label).join(', ')}`
        : '',
    ].filter(Boolean).join(' · ')
    draft.value = {
      ...draft.value,
      [lineId]: {
        id,
        lineId,
        name: suffix ? `${text(item.name)} · ${suffix}` : text(item.name),
        unitPrice,
        ...(addOns.length ? { addOns } : {}),
        ...(variant ? { variant } : {}),
        quantity: (current?.quantity || 0) + 1,
      },
    }
  }

  function remove(item: MenuOrderItem) {
    const lineId = text(item.lineId) || text(item.id)
    const current = draft.value[lineId]
    if (!lineId || !current) return

    const next = { ...draft.value }
    if (current.quantity <= 1) {
      delete next[lineId]
    } else {
      next[lineId] = {
        ...current,
        quantity: current.quantity - 1,
      }
    }
    draft.value = next
  }

  function clear() {
    draft.value = {}
    awaitingAcceptance.value = false
    acceptedOrder.value = false
    trackedOrder.value = null
  }

  async function place(input?: MenuOrderingSubmitPayload) {
    if (!canOrder.value || !items.value.length) return null

    const created = await createOrder({
      items: items.value.map((item) => ({
        itemId: item.id,
        quantity: item.quantity,
        ...(item.addOns?.length ? { addOns: item.addOns } : {}),
        ...(item.variant ? { variant: item.variant } : {}),
      })),
      order_type: orderType.value,
      collection: input?.collection,
      payment_method: input?.payment_method,
      requested_for: input?.requested_for,
      customer: input?.customer,
    })
    if (!created) return null

    const isWaitingForAcceptance = created.status === 'pending_acceptance'
    const nextAwaitingAcceptance =
      isWaitingForAcceptance &&
        ['collection', 'delivery'].includes(orderType.value)
    trackedOrder.value = created
    acceptedOrder.value = false
    awaitingAcceptance.value = nextAwaitingAcceptance

    return created
  }

  watch(trackedOrderStatus, (status: KitchenOrderFunnelStatus | null) => {
    if (!status || !awaitingAcceptance.value) return
    if (isClearedOrderStatus(status.status)) {
      trackedOrder.value = null
      awaitingAcceptance.value = false
      acceptedOrder.value = false
      message.value = ''
      return
    }
    if (status.status === 'pending_acceptance') return

    acceptedOrder.value = true
  })

  return {
    awaitingAcceptance,
    acceptedOrder,
    sentOrder: trackedOrder,
    awaitingMessage,
    items,
    quantity,
    creatingItemId,
    message,
    error,
    add,
    remove,
    clear,
    place,
  }
}

function useCreate(
  menuId: MaybeRefOrGetter<string>,
  options: UseMenuOrderCreateOptions = {}
) {
  const id = computed(() => text(toValue(menuId)))
  const kitchenSlug = computed(() => text(toValue(options.kitchenSlug)))
  const endpoint = computed(() => {
    if (!id.value) return ''

    const query = new URLSearchParams()
    if (kitchenSlug.value) query.set('kitchenSlug', kitchenSlug.value)

    const qs = query.toString()
    return `/api/menus/${encodeURIComponent(id.value)}/orders${qs ? `?${qs}` : ''}`
  })
  const creatingItemId = ref('')
  const message = ref('')
  const error = ref('')

  const createOrder = async (input: CreateMenuOrderInput) => {
    const items = input.items
      .map((item) => {
        const addOns = cleanAddOns(item.addOns)
        const variant = cleanVariant(item.variant)

        return {
          itemId: text(item.itemId),
          quantity: Math.max(1, Number(item.quantity || 1) || 1),
          ...(addOns.length ? { addOns } : {}),
          ...(variant ? { variant } : {}),
        }
      })
      .filter((item) => item.itemId)
    if (!endpoint.value || !items.length) return null

    creatingItemId.value = 'order'
    message.value = ''
    error.value = ''

    try {
      const created = await $fetch<CreatedMenuOrder>(endpoint.value, {
        method: 'POST',
        body: {
          items,
          order_type: input.order_type,
          collection: input.collection,
          payment_method: input.payment_method,
          ...(input.requested_for ? { requested_for: input.requested_for } : {}),
          customer: cleanCustomer(input.customer),
        },
      })

      if (created.payment?.required && created.payment.status !== 'paid') {
        message.value = 'Starting secure payment...'
        await createCheckoutSession(created.id)
        return created
      }

      if (created.status === 'pending_acceptance') {
        message.value = created.order_number
          ? `Order ${created.order_number} sent. Waiting for kitchen acceptance.`
          : 'Order sent. Waiting for kitchen acceptance.'
        return created
      }

      message.value = created.order_number
        ? `Order ${created.order_number} sent to the kitchen.`
        : 'Order sent to the kitchen.'

      return created
    } catch (err) {
      const statusMessage = err && typeof err === 'object' && 'statusMessage' in err
        ? text((err as { statusMessage?: unknown }).statusMessage)
        : ''
      error.value = statusMessage || 'Order could not be sent.'

      return null
    } finally {
      creatingItemId.value = ''
    }
  }

  const createCheckoutSession = async (orderId: string) => {
    const orderPath = text(orderId)
    if (!id.value || !orderPath) return

    const query = new URLSearchParams()
    if (kitchenSlug.value) query.set('kitchenSlug', kitchenSlug.value)
    const qs = query.toString()
    const response = await $fetch<{ url?: string }>(
      `/api/menus/${encodeURIComponent(id.value)}/orders/${encodeURIComponent(orderPath)}/checkout-session${qs ? `?${qs}` : ''}`,
      {
        method: 'POST',
      }
    )
    const checkoutUrl = text(response?.url)
    if (!checkoutUrl) {
      throw new Error('Payment checkout could not be started.')
    }

    if (import.meta.client) {
      window.location.href = checkoutUrl
    }
  }

  return {
    creatingItemId,
    message,
    error,
    createOrder,
  }
}

function useStatus(
  menuId: MaybeRefOrGetter<string>,
  orderId: MaybeRefOrGetter<string | null | undefined>,
  options: UseMenuOrderStatusOptions = {}
) {
  const status = ref<KitchenOrderFunnelStatus | null>(null)
  const pending = ref(false)
  const error = ref('')
  let timer: number | null = null

  const endpoint = computed(() => {
    const id = text(toValue(menuId))
    const order = text(toValue(orderId))
    if (!id || !order) return ''

    const query = new URLSearchParams()
    const kitchenSlug = text(toValue(options.kitchenSlug))
    if (kitchenSlug) query.set('kitchenSlug', kitchenSlug)

    const qs = query.toString()
    return `/api/menus/${encodeURIComponent(id)}/orders/${encodeURIComponent(order)}${qs ? `?${qs}` : ''}`
  })
  const enabled = computed(() =>
    toValue(options.enabled) !== false && Boolean(endpoint.value)
  )

  async function refresh() {
    if (!enabled.value) return null

    pending.value = true
    error.value = ''
    try {
      const nextStatus = await $fetch<KitchenOrderFunnelStatus>(endpoint.value)
      status.value = nextStatus
      return nextStatus
    } catch (err) {
      const statusCode = err && typeof err === 'object' && 'statusCode' in err
        ? Number((err as { statusCode?: unknown }).statusCode)
        : 0
      if (statusCode === 404) {
        status.value = {
          id: text(toValue(orderId)),
          order_number: '',
          status: 'deleted',
          order_type: '',
          fire_state: '',
          estimated_ready_minutes: 0,
          estimated_ready_at: '',
        }
        return status.value
      }

      error.value = err && typeof err === 'object' && 'statusMessage' in err
        ? text((err as { statusMessage?: unknown }).statusMessage)
        : 'Order status could not be checked.'
      return null
    } finally {
      pending.value = false
    }
  }

  function stop() {
    if (!timer) return
    window.clearTimeout(timer)
    timer = null
  }

  function schedule() {
    stop()
    if (!import.meta.client || !enabled.value) return
    timer = window.setTimeout(async () => {
      await refresh()
      schedule()
    }, 2500)
  }

  watch(enabled, (isEnabled: boolean) => {
    if (!isEnabled) {
      stop()
      status.value = null
      return
    }

    refresh()
    schedule()
  }, { immediate: true })

  onBeforeUnmount(stop)

  return {
    status,
    pending,
    error,
    refresh,
    stop,
  }
}
