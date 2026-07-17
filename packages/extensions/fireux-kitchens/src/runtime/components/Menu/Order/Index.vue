<template>
  <article
    class="fireux-menu-detail menu-order"
    data-menu-projection="order"
    :data-menu-context="menuContext"
    :data-menu-id="orderAvailable ? menuId : undefined"
    :data-menu-index-path="menuIndexPath || undefined"
    :data-menu-order-type="menuContext"
    :data-menu-ordering-enabled="String(orderAvailable)"
    :data-menu-path="orderAvailable ? orderPath : undefined"
    :data-menu-render-kind="orderAvailable ? 'structured' : undefined"
    :data-menu-state="orderState"
    :class="themeClassName"
    :style="themeStyleVars"
    :aria-labelledby="pending
      ? undefined
      : orderAvailable
        ? 'menu-order-title'
        : 'menu-order-unavailable-title'"
  >
    <p v-if="pending" class="menu-order__state" role="status">
      Loading collection menu…
    </p>

    <MenuOrderUnavailable
      v-else-if="!orderAvailable"
      :failure="unavailableFailure"
    />

    <div v-else class="menu-order__shell">
      <MenuOrderIntro
        :context-icon="contextProfile.icon"
        :context-label="contextProfile.label"
        :currency-code="currencyCode"
        :description="menuDescription"
        :kitchen-name="kitchenName"
        :menu-name="menuName"
        :message="collectionMessage"
      />

      <MenuOrderCatalogue
        :key="basketScopeKey"
        :currency-code="currencyCode"
        :sections="menuSections"
        @add="basket.add"
      />

      <MenuOrderBasketSummary
        :currency-code="basket.currencyCode.value"
        :quantity="basket.quantity.value"
        :total="basket.total.value"
        :total-label="basket.totalLabel.value"
        @review="openBasket"
      />

      <MenuOrderBasketDialog
        v-model:open="basketOpen"
        :currency-code="basket.currencyCode.value"
        :lines="basket.lines.value"
        :total-label="basket.totalLabel.value"
        @quantity="basket.setQuantity"
        @remove="basket.remove"
        @after-leave="finishBasketDialog"
      />
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, shallowRef, watch } from 'vue'
import { setResponseStatus, useSeoMeta } from '#imports'
import { useMenu } from '../../../composables/fireux/menu/useMenu'
import { useMenuOrderBasket } from '../../../composables/fireux/menu/order/useMenuOrderBasket'
import { useMenuThemeSurface } from '../../../composables/fireux/menu/useMenuThemeSurface'
import {
  menuRoutePath,
  rootMenuRouteScope,
  type MenuRouteScope,
} from '../../../utils/kitchen-menu-route'
import { menuContextProfile } from '../../../utils/menu-context'

const props = withDefaults(defineProps<{
  menuId: string
  menuContext: 'collection'
  menuRouteScope?: MenuRouteScope
  pageCanvas?: boolean
  propagateResponseStatus?: boolean
}>(), {
  menuRouteScope: rootMenuRouteScope,
  pageCanvas: false,
  propagateResponseStatus: false,
})

const menuId = computed(() => String(props.menuId || '').trim())
const menuContext = computed(() => props.menuContext)
const menuRouteScope = computed(() => props.menuRouteScope)
const contextProfile = computed(() => menuContextProfile(menuContext.value))
const {
  pending,
  indexPath: menuIndexPath,
  renderKind,
  document: documentMenu,
  manifest: detailMenu,
  failure,
  ready,
} = useMenu(menuId, {
  routeScope: menuRouteScope,
  menuContext,
})
const orderPath = computed(() => menuRoutePath({
  scope: menuRouteScope.value,
  menuId: menuId.value,
  context: menuContext.value,
}))
const collectionConfig = computed(() =>
  detailMenu.value?.behaviour.ordering.order_types.find(
    ({ type }) => type === 'collection'
  ) || null
)
const orderAvailable = computed(() => {
  const behaviour = detailMenu.value?.behaviour

  return Boolean(
    renderKind.value === 'structured' &&
    behaviour?.context === 'collection' &&
    behaviour.surface === 'collection' &&
    behaviour.ordering.enabled &&
    behaviour.orderingEnabled &&
    behaviour.orderTypes.includes('collection') &&
    collectionConfig.value
  )
})
const orderState = computed(() => {
  if (pending.value) return 'loading'

  return orderAvailable.value ? 'ready' : 'unavailable'
})
const menuPresentation = computed(() => detailMenu.value?.presentation || null)
const menuName = computed(() => detailMenu.value?.content.name || 'Menu')
const menuDescription = computed(() => detailMenu.value?.content.description || '')
const menuSections = computed(() => detailMenu.value?.content.sections || [])
const kitchenName = computed(() => menuPresentation.value?.kitchenName || '')
const currencyCode = computed(() =>
  String(menuPresentation.value?.currencyCode || '').trim().toUpperCase()
)
const collectionMessage = computed(() =>
  String(collectionConfig.value?.message || '').trim() ||
  'This menu is available for collection.'
)
const resolvedSource = computed(() => detailMenu.value?.source || null)
const sourceMenuId = computed(() => resolvedSource.value?.menuId || '')
const basketScopeKey = computed(() => JSON.stringify([
  orderPath.value,
  resolvedSource.value?.appId || '',
  resolvedSource.value?.kitchenId || '',
  sourceMenuId.value,
]))
const unavailableFailure = computed(() => failure.value || {
  statusCode: 404,
  title: 'Collection unavailable',
  description: 'This menu is not currently accepting collection orders.',
})
const pageStyle = computed(() =>
  menuPresentation.value?.pageStyle || documentMenu.value?.pageStyle || null
)
const basket = useMenuOrderBasket({
  currencyCode,
  scopeKey: basketScopeKey,
  sourceMenuId,
})
const basketOpen = ref(false)
const basketTrigger = shallowRef<HTMLButtonElement | null>(null)
const {
  className: themeClassName,
  styleVars: themeStyleVars,
} = useMenuThemeSurface({
  pageStyle,
  pageCanvas: computed(() => props.pageCanvas),
})

watch(
  () => basket.quantity.value,
  quantity => {
    if (!quantity) basketOpen.value = false
  }
)

function openBasket(trigger: HTMLButtonElement) {
  if (!basket.quantity.value) return

  basketTrigger.value = trigger
  basketOpen.value = true
}

function finishBasketDialog() {
  const trigger = basketTrigger.value
  basketTrigger.value = null

  void nextTick(() => {
    if (basket.quantity.value && trigger) {
      trigger.focus()
      return
    }

    document
      .querySelector<HTMLButtonElement>('[data-menu-action="configure-item"]:not(:disabled)')
      ?.focus()
  })
}

if (props.propagateResponseStatus) {
  await ready
  if (import.meta.server) {
    if (failure.value) {
      setResponseStatus(failure.value.statusCode)
    } else if (!orderAvailable.value) {
      setResponseStatus(404)
    }
  }
}

useSeoMeta({
  title: () => failure.value?.title ||
    (orderAvailable.value ? `${menuName.value} · Collection` : 'Collection unavailable'),
  description: () => failure.value?.description ||
    (orderAvailable.value
      ? collectionMessage.value
      : unavailableFailure.value.description),
  ogTitle: () => failure.value?.title ||
    (orderAvailable.value ? `${menuName.value} · Collection` : 'Collection unavailable'),
  ogDescription: () => failure.value?.description ||
    (orderAvailable.value
      ? collectionMessage.value
      : unavailableFailure.value.description),
  robots: 'noindex, nofollow',
})
</script>

<style scoped>
.menu-order {
  align-content: start;
}

.menu-order__state {
  margin: auto;
  color: var(--menu-muted);
  font-size: 0.95rem;
  font-weight: 700;
}

.menu-order__shell {
  display: grid;
  align-content: start;
  gap: clamp(2rem, 6vw, 4rem);
  width: min(100%, 54rem);
  margin: 0 auto;
  padding-block: clamp(1rem, 4vw, 3rem);
}

@media (max-width: 35rem) {
  .menu-order__shell {
    padding-block-start: var(--menu-browse-identity-top-offset, 0rem);
  }
}
</style>
