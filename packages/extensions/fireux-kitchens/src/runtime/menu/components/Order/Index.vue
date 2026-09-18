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
    :class="[
      themeClassName,
      {
        'menu-order--kiosk': orderAvailable && menuContext === 'kiosk',
        'menu-kiosk-skin--default': orderAvailable && menuContext === 'kiosk',
      },
    ]"
    :style="themeStyleVars"
    :aria-label="
      orderAvailable && menuContext === 'kiosk'
        ? `${menuName} kiosk`
        : undefined
    "
    :aria-labelledby="
      pending
        ? undefined
        : orderAvailable
          ? menuContext === 'kiosk'
            ? undefined
            : 'menu-order-title'
          : 'menu-order-unavailable-title'
    "
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

    <div v-else-if="menuContext === 'kiosk'" class="menu-order__kiosk">
      <div v-if="surfacePaused" class="menu-order__kiosk-paused">
        <MenuOrderPaused
          :browse-path="unavailableBrowsePath"
          :message="surfacePauseMessage"
          :surface-label="contextProfile.label"
        />
      </div>

      <MenuOrderKioskFlow
        v-else
        :configs="contextConfigs"
        :currency-code="currencyCode"
        :kitchen-id="resolvedSource?.kitchenId || ''"
        :backdrop-image-url="kitchenImageUrl"
        :kitchen-name="kitchenName"
        :kitchen-tagline="kitchenTagline"
        :kitchen-slug="orderKitchenSlug"
        :logo-image-url="kioskLogoImageUrl"
        :menu-id="menuId"
        :menu-name="menuName"
        :scope-key="basketScopeKey"
        :sections="menuSections"
        :source-menu-id="sourceMenuId"
        :kitchen-service-id="serviceId"
        :wordmark-image-url="kioskWordmarkImageUrl"
      />
    </div>

    <div v-else class="menu-order__shell">
      <MenuOrderIntro
        :context-icon="contextProfile.icon"
        :context-label="contextProfile.label"
        :currency-code="currencyCode"
        :description="menuDescription"
        :kitchen-name="kitchenName"
        :menu-name="menuName"
        :message="contextMessage"
        :show-currency="showCurrency"
        :surface-options="surfaceOptions"
        :status-color="contextStatusColor"
        :status-label="contextStatusLabel"
      />

      <MenuOrderPaused
        v-if="surfacePaused"
        :browse-path="unavailableBrowsePath"
        :message="surfacePauseMessage"
        :surface-label="contextProfile.label"
      />

      <MenuOrderCollectionFlow
        v-else-if="menuContext === 'collection'"
        :config="contextConfig"
        :currency-code="currencyCode"
        :hours="surfaceHours"
        :kitchen-id="resolvedSource?.kitchenId || ''"
        :kitchen-slug="orderKitchenSlug"
        :menu-id="menuId"
        :scope-key="basketScopeKey"
        :sections="menuSections"
        :source-menu-id="sourceMenuId"
        :kitchen-service-id="serviceId"
      />

      <MenuOrderDeliveryFlow
        v-else-if="menuContext === 'delivery'"
        :config="contextConfig"
        :currency-code="currencyCode"
        :hours="surfaceHours"
        :kitchen-id="resolvedSource?.kitchenId || ''"
        :kitchen-slug="orderKitchenSlug"
        :menu-id="menuId"
        :scope-key="basketScopeKey"
        :sections="menuSections"
        :source-menu-id="sourceMenuId"
        :kitchen-service-id="serviceId"
      />

      <MenuOrderPreOrderFlow
        v-else-if="menuContext === 'pre_order'"
        :config="contextConfig"
        :currency-code="currencyCode"
        :hours="surfaceHours"
        :kitchen-id="resolvedSource?.kitchenId || ''"
        :kitchen-slug="orderKitchenSlug"
        :menu-id="menuId"
        :scope-key="basketScopeKey"
        :sections="menuSections"
        :source-menu-id="sourceMenuId"
        :kitchen-service-id="serviceId"
      />
    </div>
  </article>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { setResponseStatus, useSeoMeta } from '#imports'
import { useMenu } from '../../composables/useMenu'
import {
  useMenuThemeSurface,
  menuAppTheme,
} from '../../composables/useMenuThemeSurface'
import { useMenuServiceComputed } from '../../composables/useMenuServiceComputed'
import {
  menuRoutePath,
  rootMenuRouteScope,
  type MenuRouteScope,
} from '../../../kitchen/utils/kitchen-menu-route'
import {
  guestMenuSurfaceOptions,
  menuContextProfile,
  menuManifestSupportsContext,
} from '../../utils/menu-context'

const props = withDefaults(
  defineProps<{
    menuId: string
    menuContext: 'delivery' | 'collection' | 'pre_order' | 'kiosk'
    menuRouteScope?: MenuRouteScope
    pageCanvas?: boolean
    propagateResponseStatus?: boolean
  }>(),
  {
    menuRouteScope: rootMenuRouteScope,
    pageCanvas: false,
    propagateResponseStatus: false,
  }
)

const menuId = computed(() => String(props.menuId || '').trim())
const menuContext = computed(() => props.menuContext)
const menuRouteScope = computed(() => props.menuRouteScope)
const contextProfile = computed(() => menuContextProfile(menuContext.value))
const {
  pending,
  serviceId,
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
const orderPath = computed(() =>
  menuRoutePath({
    scope: menuRouteScope.value,
    menuId: menuId.value,
    context: menuContext.value,
    serviceId: serviceId.value,
  })
)
const contextConfigs = computed(() => {
  const visibleTypes = new Set(contextProfile.value.visibleOrderTypes)

  return (
    detailMenu.value?.behaviour.ordering.order_types.filter(({ type }) =>
      visibleTypes.has(type)
    ) || []
  )
})
const contextConfig = computed(
  () =>
    contextConfigs.value.find(({ type }) => type === menuContext.value) ||
    contextConfigs.value.find(
      ({ availability }) => availability?.paused !== true
    ) ||
    contextConfigs.value[0] ||
    null
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
const menuDescription = computed(
  () => detailMenu.value?.content.description || ''
)
const menuSections = computed(() => detailMenu.value?.content.sections || [])
const kitchenName = computed(() => menuPresentation.value?.kitchenName || '')
const kitchenTagline = computed(
  () => menuPresentation.value?.kitchenTagline || ''
)
const kitchenImageUrl = computed(() =>
  String(menuPresentation.value?.kitchenImageUrl || '').trim()
)
const currencyCode = computed(() =>
  String(menuPresentation.value?.currencyCode || '')
    .trim()
    .toUpperCase()
)
const showCurrency = computed(
  () => menuPresentation.value?.showCurrency !== false
)
const kitchenLogoImageUrl = computed(() =>
  String(menuPresentation.value?.kitchenLogoImageUrl || '').trim()
)
const kitchenWordmarkImageUrl = computed(() =>
  String(menuPresentation.value?.kitchenWordmarkImageUrl || '').trim()
)
const kioskLogoImageUrl = computed(
  () =>
    kitchenLogoImageUrl.value ||
    String(menuPresentation.value?.placeLogoImageUrl || '').trim()
)
const kioskWordmarkImageUrl = computed(
  () =>
    kitchenWordmarkImageUrl.value ||
    String(menuPresentation.value?.placeWordmarkImageUrl || '').trim()
)
const contextMessage = computed(
  () =>
    String(contextConfig.value?.message || '').trim() ||
    (menuContext.value === 'pre_order'
      ? 'Order ahead for a larger table, choose when you would like to dine, and the Kitchen will confirm your request.'
      : `This menu is available for ${contextProfile.value.label.toLowerCase()}.`)
)
const surfaceHours = computed(
  () => contextConfig.value?.service_hours?.operation_hours
)
const { menuServiceChip: contextServiceChip } =
  useMenuServiceComputed(surfaceHours)
const contextStatusLabel = computed(() => {
  if (surfacePaused.value) return `${contextProfile.value.label} paused`
  if (menuContext.value === 'pre_order') return 'Pre-order requests open'

  return contextServiceChip.value.known
    ? contextServiceChip.value.label
    : `${contextProfile.value.label} hours unavailable`
})
const surfacePaused = computed(
  () => contextConfig.value?.availability?.paused === true
)
const surfacePauseMessage = computed(
  () =>
    String(contextConfig.value?.availability?.message || '').trim() ||
    `${contextProfile.value.label} is temporarily paused. Please try again later.`
)
const contextStatusColor = computed(() =>
  surfacePaused.value
    ? ('error' as const)
    : menuContext.value === 'pre_order'
      ? ('success' as const)
      : contextServiceChip.value.color
)
const surfaceOptions = computed(() =>
  menuContext.value === 'kiosk'
    ? []
    : guestMenuSurfaceOptions({
        behaviour: detailMenu.value?.behaviour,
        menuId: menuId.value,
        routeScope: menuRouteScope.value,
        activeContext: menuContext.value,
        activeServiceId: serviceId.value,
      }).filter((option) => option.value !== 'generic')
)
const contextOrderNoun = computed(() =>
  menuContext.value === 'pre_order'
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
const basketScopeKey = computed(() =>
  JSON.stringify([
    resolvedSource.value?.appId || '',
    resolvedSource.value?.kitchenId || '',
    sourceMenuId.value,
    menuContext.value,
    serviceId.value,
  ])
)
const unavailableFailure = computed(
  () =>
    failure.value || {
      statusCode: 404,
      title: `${contextProfile.value.label} unavailable`,
      description: `This kitchen is not accepting ${contextOrderNoun.value} from this menu right now.`,
    }
)
const hasResolvedMenu = computed(() =>
  Boolean(detailMenu.value || documentMenu.value)
)
const unavailableBrowsePath = computed(() =>
  hasResolvedMenu.value
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
const theme = computed(
  () => menuPresentation.value?.theme || documentMenu.value?.theme || null
)
const surfaceTheme = computed(() =>
  orderAvailable.value ? theme.value : menuAppTheme
)
const { className: themeClassName, styleVars: themeStyleVars } =
  useMenuThemeSurface({
    theme: surfaceTheme,
    pageCanvas: computed(() => props.pageCanvas),
  })

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
  title: () =>
    failure.value?.title ||
    (orderAvailable.value
      ? `${menuName.value} · ${contextProfile.value.label}`
      : `${contextProfile.value.label} unavailable`),
  description: () =>
    failure.value?.description ||
    (orderAvailable.value
      ? contextMessage.value
      : unavailableFailure.value.description),
  ogTitle: () =>
    failure.value?.title ||
    (orderAvailable.value
      ? `${menuName.value} · ${contextProfile.value.label}`
      : `${contextProfile.value.label} unavailable`),
  ogDescription: () =>
    failure.value?.description ||
    (orderAvailable.value
      ? contextMessage.value
      : unavailableFailure.value.description),
  robots: 'noindex, nofollow',
})
</script>
<style src="../styles/menu-order.css"></style>
