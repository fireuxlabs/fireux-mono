import {
  computed,
  proxyRefs,
  ref,
  toValue,
  watch,
  type MaybeRefOrGetter,
} from 'vue'
import { useMenuOrderDraft } from '../../../../composables/fireux/public/menu/useMenuOrderDraft'
import { useMenuViewMode } from '../../../../composables/fireux/public/menu/useMenuViewMode'
import { menuOrderBasketActionLabel } from '../../../../utils/menu-ordering-ui'
import type { MenuManifest } from '../../../../composables/fireux/public/menu/useMenuManifest'
import type {
  MenuChoiceValue,
  MenuStructuredBaseLayerView,
} from '../Structured/types'
import type {
  MenuOrderingLayerState,
  MenuOrderingSubmitPayload,
} from './types'

type UseMenuOrderingOptions = {
  menu: MaybeRefOrGetter<MenuManifest | null>
  menuId: MaybeRefOrGetter<string>
  kitchenSlug?: MaybeRefOrGetter<string | null | undefined>
}

const text = (value: unknown) => String(value ?? '').trim()

// Menu ordering spine: keep ordering state beside the Ordering components,
// while Menu/Detail/Index only composes the base menu layer and checkout layer.
export function useMenuOrdering(options: UseMenuOrderingOptions) {
  const showOrderPanel = ref(false)
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
    orderNotice,
  } = useMenuViewMode(
    behaviour,
    computed(() => `fireux:menu:${menuStorageScope.value}:view`)
  )
  const draft = useMenuOrderDraft(options.menuId, {
    kitchenSlug: options.kitchenSlug,
    canOrder,
    orderType: selectedOrderType,
    storageKey: computed(() => `fireux:menu:${menuStorageScope.value}:order`),
  })
  const structuredView = computed<MenuStructuredBaseLayerView | null>(() => {
    const menu = toValue(options.menu)
    if (!menu) return null

    return {
      menu,
      choices: choiceOptions.value,
      selectedChoice: selectedChoice.value,
      orderMode: isOrderMode.value,
      orderNotice: orderNotice.value,
      quantities: draft.quantities.value,
      dimmed: showOrderPanel.value,
    }
  })
  const orderingView = computed<MenuOrderingLayerState>(() => {
    const policy = selectedOrderTypeConfig.value

    return {
      actionLabel: menuOrderBasketActionLabel(selectedOrderType.value),
      accepted: draft.acceptedOrder.value,
      awaitingAcceptance: draft.awaitingAcceptance.value,
      funnelOpen: showOrderPanel.value,
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
  const showOrderingLayer = computed(() =>
    isOrderMode.value &&
      Boolean(
        draft.quantity.value ||
          draft.awaitingAcceptance.value ||
          draft.sentOrder.value
      )
  )

  function setSelectedChoice(value: MenuChoiceValue) {
    selectedChoice.value = value
  }

  function openFunnel() {
    showOrderPanel.value = true
  }

  function closeFunnel() {
    showOrderPanel.value = false
  }

  function submit(payload: MenuOrderingSubmitPayload) {
    draft.place(payload)
  }

  watch([selectedOrderType, draft.quantity], closeFunnel)

  return {
    structured: proxyRefs({
      view: structuredView,
      add: draft.add,
      remove: draft.remove,
      select: setSelectedChoice,
    }),
    layer: proxyRefs({
      show: showOrderingLayer,
      order: orderingView,
      clear: draft.clear,
      close: closeFunnel,
      open: openFunnel,
      submit,
    }),
    status: proxyRefs({
      message: draft.message,
      error: draft.error,
    }),
  }
}
