import {
  computed,
  proxyRefs,
  toValue,
  watch,
  type MaybeRefOrGetter,
} from 'vue'
import { useStoredChoice } from 'fireux-core/runtime/composables/shared/useStoredChoice'
import { useKitchenOrderFunnelDraft } from './useKitchenOrderFunnelDraft'
import {
  useMenuViewMode,
  type MenuChoiceOption,
  type MenuChoiceValue,
} from '../../../menu/useMenuViewMode'
import { menuOrderBasketActionLabel } from '../../../../../utils/menu-ordering-ui'
import type { MenuManifest } from '../../../menu/useMenuManifest'
import type { MenuFoodOrderItem } from '../../../../../models/menu/menu-food.model'
import type {
  MenuOrderingFunnelState,
  MenuOrderingSubmitPayload,
} from '../../../../../models/menu/menu-ordering.model'

export type { MenuChoiceValue }
export type MenuDetailOrderItem = MenuFoodOrderItem
export type MenuDetailView = {
  menu: MenuManifest
  choices: MenuChoiceOption[]
  selectedChoice: MenuChoiceValue
  orderMode: boolean
  quantities: Record<string, number>
  dimmed: boolean
}

type UseKitchenOrderFunnelOptions = {
  menu: MaybeRefOrGetter<MenuManifest | null>
  menuId: MaybeRefOrGetter<string>
  kitchenSlug?: MaybeRefOrGetter<string | null | undefined>
}
type PanelState = 'closed' | 'open'

const text = (value: unknown) => String(value ?? '').trim()
const panelStates = ['closed', 'open'] as const satisfies readonly PanelState[]

// Order funnel spine: Menu/Detail composes the menu layer; this seam owns order draft and funnel state.
export function useKitchenOrderFunnel(options: UseKitchenOrderFunnelOptions) {
  const menuStorageScope = computed(() => {
    const slug = text(toValue(options.kitchenSlug))
    const id = text(toValue(options.menuId))

    return slug ? `${slug}:${id}` : id
  })
  const behaviour = computed(() => toValue(options.menu)?.behaviour)
  const {
    choiceOptions,
    selectedChoice,
    selectedOrderType,
    selectedOrderTypeConfig,
    canOrder,
    isOrderMode,
  } = useMenuViewMode(
    behaviour,
    computed(() => `fireux:menu:${menuStorageScope.value}:view`)
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
  const draft = useKitchenOrderFunnelDraft(options.menuId, {
    kitchenSlug: options.kitchenSlug,
    canOrder,
    orderType: selectedOrderType,
    storageKey: computed(() => `fireux:menu:${menuStorageScope.value}:order`),
  })
  const detailView = computed<MenuDetailView | null>(() => {
    const menu = toValue(options.menu)
    if (!menu) return null

    return {
      menu,
      choices: choiceOptions.value,
      selectedChoice: selectedChoice.value,
      orderMode: isOrderMode.value,
      quantities: draft.quantities.value,
      dimmed: panelOpen.value,
    }
  })
  const funnelView = computed<MenuOrderingFunnelState>(() => {
    const policy = selectedOrderTypeConfig.value

    return {
      actionLabel: menuOrderBasketActionLabel(selectedOrderType.value),
      accepted: draft.acceptedOrder.value,
      awaitingAcceptance: draft.awaitingAcceptance.value,
      panelOpen: panelOpen.value,
      items: draft.items.value,
      message: draft.awaitingMessage.value || draft.message.value,
      menuId: text(toValue(options.menuId)),
      kitchenSlug: text(toValue(options.kitchenSlug)),
      orderType: selectedOrderType.value,
      pending: draft.creatingItemId.value === 'order',
      ...(policy ? { policy } : {}),
      quantity: draft.quantity.value,
      selection: {
        items: draft.items.value,
        quantity: draft.quantity.value,
      },
      sentOrder: draft.sentOrder.value,
    }
  })
  const showFunnel = computed(() =>
    isOrderMode.value &&
      draft.quantity.value > 0
  )

  function setSelectedChoice(value: MenuChoiceValue) {
    selectedChoice.value = value
  }

  function openPanel() {
    panelOpen.value = true
  }

  function closePanel() {
    panelOpen.value = false
  }

  function submit(payload: MenuOrderingSubmitPayload) {
    draft.place(payload)
  }

  watch(draft.quantity, (quantity: number) => {
    if (!quantity) closePanel()
  })

  return {
    detail: proxyRefs({
      view: detailView,
      add: draft.add,
      remove: draft.remove,
      select: setSelectedChoice,
    }),
    funnel: proxyRefs({
      show: showFunnel,
      order: funnelView,
      clear: draft.clear,
      close: closePanel,
      open: openPanel,
      submit,
    }),
  }
}
