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
    :data-menu-surface-theme="orderAvailable ? 'menu' : 'app'"
    :class="themeClassName"
    :style="themeStyleVars"
    :aria-labelledby="pending
      ? undefined
      : orderAvailable
        ? 'menu-order-title'
        : 'menu-order-unavailable-title'"
  >
    <p v-if="pending" class="menu-order__state" role="status">
      Loading {{ contextProfile.label.toLowerCase() }} menu…
    </p>

    <MenuOrderUnavailable
      v-else-if="!orderAvailable"
      :browse-path="unavailableBrowsePath"
      :failure="unavailableFailure"
      :kitchen-name="kitchenName"
      :kitchen-path="unavailableKitchenPath"
    />

    <div v-else class="menu-order__shell">
      <MenuOrderIntro
        :context-icon="contextProfile.icon"
        :context-label="contextProfile.label"
        :currency-code="currencyCode"
        :description="menuDescription"
        :image-shade="kitchenImageShade"
        :image-url="kitchenImageUrl"
        :kitchen-name="kitchenName"
        :logo-image-url="kitchenLogoImageUrl"
        :menu-name="menuName"
        :message="contextMessage"
        :show-currency="showCurrency"
        :surface-options="surfaceOptions"
        :status-color="contextStatusColor"
        :status-label="contextStatusLabel"
        :wordmark-image-url="kitchenWordmarkImageUrl"
      />

      <MenuOrderPaused
        v-if="menuContext === 'collection' && collectionPaused"
        :browse-path="unavailableBrowsePath"
        :message="collectionPauseMessage"
      />

      <MenuOrderCollectionFlow
        v-else-if="menuContext === 'collection'"
        :config="contextConfig"
        :currency-code="currencyCode"
        :hours="collectionHours"
        :kitchen-id="resolvedSource?.kitchenId || ''"
        :kitchen-slug="orderKitchenSlug"
        :menu-id="menuId"
        :scope-key="basketScopeKey"
        :sections="menuSections"
        :source-menu-id="sourceMenuId"
      />

      <template v-else>
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
          @remove="basket.remove"
          @after-leave="finishBasketDialog"
        />
      </template>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, shallowRef, watch } from 'vue'
import { setResponseStatus, useSeoMeta } from '#imports'
import { useMenu } from '../../../composables/fireux/menu/useMenu'
import { useMenuOrderBasket } from '../../../composables/fireux/menu/order/useMenuOrderBasket'
import { useMenuThemeSurface } from '../../../composables/fireux/menu/useMenuThemeSurface'
import { useMenuServiceComputed } from '../../../composables/fireux/firestore/menu/useMenu'
import {
  menuRoutePath,
  rootMenuRouteScope,
  type MenuRouteScope,
} from '../../../utils/kitchen-menu-route'
import {
  guestMenuSurfaceOptions,
  menuContextProfile,
  menuManifestSupportsContext,
} from '../../../utils/menu-context'

const props = withDefaults(defineProps<{
  menuId: string
  menuContext: 'delivery' | 'collection' | 'pre_order'
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
const contextConfig = computed(() =>
  detailMenu.value?.behaviour.ordering.order_types.find(
    ({ type }) => type === menuContext.value
  ) || null
)
const orderAvailable = computed(() => {
  const behaviour = detailMenu.value?.behaviour

  return Boolean(
    renderKind.value === 'structured' &&
    menuManifestSupportsContext(behaviour, menuContext.value)
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
const showCurrency = computed(() =>
  menuPresentation.value?.showCurrency !== false
)
const kitchenImageShade = computed(() =>
  menuPresentation.value?.kitchenImageShade || 'none'
)
const kitchenImageUrl = computed(() =>
  String(menuPresentation.value?.kitchenImageUrl || '').trim()
)
const kitchenLogoImageUrl = computed(() =>
  String(menuPresentation.value?.kitchenLogoImageUrl || '').trim()
)
const kitchenWordmarkImageUrl = computed(() =>
  String(menuPresentation.value?.kitchenWordmarkImageUrl || '').trim()
)
const contextMessage = computed(() =>
  String(contextConfig.value?.message || '').trim() ||
  `This menu is available for ${contextProfile.value.label.toLowerCase()}.`
)
const collectionHours = computed(() =>
  contextConfig.value?.service_hours?.operation_hours
)
const { menuServiceChip: contextServiceChip } = useMenuServiceComputed(
  collectionHours
)
const contextStatusLabel = computed(() => {
  if (menuContext.value !== 'collection') return ''

  if (collectionPaused.value) return 'Collection paused'

  return contextServiceChip.value.known
    ? contextServiceChip.value.label
    : 'Collection hours unavailable'
})
const collectionPaused = computed(() =>
  contextConfig.value?.availability?.paused === true
)
const collectionPauseMessage = computed(() =>
  String(contextConfig.value?.availability?.message || '').trim() ||
  'Collection is temporarily paused. Please try again later.'
)
const contextStatusColor = computed(() =>
  collectionPaused.value ? 'error' as const : contextServiceChip.value.color
)
const surfaceOptions = computed(() => guestMenuSurfaceOptions({
  behaviour: detailMenu.value?.behaviour,
  menuId: menuId.value,
  routeScope: menuRouteScope.value,
  activeContext: menuContext.value,
}))
const contextOrderNoun = computed(() => menuContext.value === 'pre_order'
  ? 'pre-orders'
  : `${contextProfile.value.label.toLowerCase()} orders`
)
const resolvedSource = computed(() => detailMenu.value?.source || null)
const sourceMenuId = computed(() => resolvedSource.value?.menuId || '')
const orderKitchenSlug = computed(() =>
  menuRouteScope.value.kind === 'directory'
    ? menuRouteScope.value.kitchenSlug
    : ''
)
const basketScopeKey = computed(() => JSON.stringify([
  resolvedSource.value?.appId || '',
  resolvedSource.value?.kitchenId || '',
  sourceMenuId.value,
  menuContext.value,
]))
const unavailableFailure = computed(() => failure.value || {
  statusCode: 404,
  title: `${contextProfile.value.label} unavailable`,
  description:
    `This kitchen is not accepting ${contextOrderNoun.value} from this menu right now.`,
})
const hasResolvedMenu = computed(() => Boolean(
  detailMenu.value || documentMenu.value
))
const unavailableBrowsePath = computed(() => hasResolvedMenu.value
  ? menuRoutePath({
      scope: menuRouteScope.value,
      menuId: menuId.value,
    })
  : ''
)
const unavailableKitchenPath = computed(() => {
  const kitchenSlug = String(resolvedSource.value?.kitchenSlug || '').trim()

  return hasResolvedMenu.value && kitchenSlug
    ? `/kitchens/${encodeURIComponent(kitchenSlug)}`
    : ''
})
const pageStyle = computed(() =>
  menuPresentation.value?.pageStyle || documentMenu.value?.pageStyle || null
)
const appPageStyle = {
  background_color_light: 'var(--ui-bg)',
  background_color_dark: 'var(--ui-bg)',
  font_color_light: 'var(--ui-text)',
  font_color_dark: 'var(--ui-text)',
  title_color_light: 'var(--ui-text-highlighted)',
  title_color_dark: 'var(--ui-text-highlighted)',
  primary_color: 'var(--ui-primary)',
  secondary_color: 'var(--ui-text-muted)',
} as const
const surfacePageStyle = computed(() =>
  orderAvailable.value ? pageStyle.value : appPageStyle
)
const surfaceColorMode = computed(() =>
  orderAvailable.value ? null : 'light' as const
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
  pageStyle: surfacePageStyle,
  colorMode: surfaceColorMode,
  pageCanvas: computed(() => props.pageCanvas),
})

watch(
  () => basket.quantity.value,
  (quantity: number) => {
    if (quantity) return

    basketOpen.value = false
  }
)

watch(basketScopeKey, () => {
  basketOpen.value = false
})

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
      .querySelector<HTMLButtonElement>(
        ':is([data-menu-action="add-item"], [data-menu-action="configure-item"]):not(:disabled)'
      )
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
    (orderAvailable.value
      ? `${menuName.value} · ${contextProfile.value.label}`
      : `${contextProfile.value.label} unavailable`),
  description: () => failure.value?.description ||
    (orderAvailable.value
      ? contextMessage.value
      : unavailableFailure.value.description),
  ogTitle: () => failure.value?.title ||
    (orderAvailable.value
      ? `${menuName.value} · ${contextProfile.value.label}`
      : `${contextProfile.value.label} unavailable`),
  ogDescription: () => failure.value?.description ||
    (orderAvailable.value
      ? contextMessage.value
      : unavailableFailure.value.description),
  robots: 'noindex, nofollow',
})
</script>

<style scoped src="../../../assets/styles/menu-order.css"></style>
