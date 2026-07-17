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

    <section
      v-else-if="!orderAvailable"
      class="menu-order__unavailable"
      aria-labelledby="menu-order-unavailable-title"
      role="alert"
    >
      <p class="menu-order__status">
        Error {{ unavailableFailure.statusCode }}
      </p>
      <h1 id="menu-order-unavailable-title">
        {{ unavailableFailure.title }}
      </h1>
      <p class="menu-order__description">
        {{ unavailableFailure.description }}
      </p>
    </section>

    <div v-else class="menu-order__shell">
      <header class="menu-order__identity">
        <p v-if="kitchenName" class="menu-order__kitchen">
          {{ kitchenName }}
        </p>

        <h1 id="menu-order-title">
          {{ menuName }}
        </h1>

        <p v-if="menuDescription" class="menu-order__description">
          {{ menuDescription }}
        </p>

        <p v-if="currencyCode" class="menu-order__currency">
          Prices in {{ currencyCode }}
        </p>
      </header>

      <section class="menu-order__mode" aria-labelledby="menu-order-mode-title">
        <span class="menu-order__mode-icon" aria-hidden="true">
          <UIcon :name="contextProfile.icon" />
        </span>

        <div class="menu-order__mode-copy">
          <p class="menu-order__eyebrow">
            {{ contextProfile.label }}
          </p>
          <h2 id="menu-order-mode-title">
            Collection ordering
          </h2>
          <p>
            {{ collectionMessage }}
          </p>
        </div>
      </section>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { setResponseStatus, useSeoMeta } from '#imports'
import { useMenu } from '../../../composables/fireux/menu/useMenu'
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
const kitchenName = computed(() => menuPresentation.value?.kitchenName || '')
const currencyCode = computed(() =>
  String(menuPresentation.value?.currencyCode || '').trim().toUpperCase()
)
const collectionMessage = computed(() =>
  String(collectionConfig.value?.message || '').trim() ||
  'This menu is available for collection.'
)
const unavailableFailure = computed(() => failure.value || {
  statusCode: 404,
  title: 'Collection unavailable',
  description: 'This menu is not currently accepting collection orders.',
})
const pageStyle = computed(() =>
  menuPresentation.value?.pageStyle || documentMenu.value?.pageStyle || null
)
const {
  className: themeClassName,
  styleVars: themeStyleVars,
} = useMenuThemeSurface({
  pageStyle,
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

.menu-order__unavailable {
  display: grid;
  min-height: min(34rem, 72vh);
  place-content: center;
  justify-items: center;
  gap: 1rem;
  width: min(100%, 38rem);
  margin: auto;
  text-align: center;
}

.menu-order__unavailable p,
.menu-order__unavailable h1,
.menu-order__identity p,
.menu-order__identity h1,
.menu-order__mode p,
.menu-order__mode h2 {
  margin: 0;
}

.menu-order__status,
.menu-order__kitchen,
.menu-order__currency,
.menu-order__eyebrow {
  color: var(--menu-muted);
  font-size: 0.75rem;
  font-weight: 900;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.menu-order__unavailable h1,
.menu-order__identity h1 {
  color: var(--menu-title);
  font-family: var(--menu-title-font);
  letter-spacing: -0.04em;
  line-height: 1;
}

.menu-order__unavailable h1 {
  font-size: clamp(2.2rem, 8vw, 4.5rem);
}

.menu-order__description {
  max-width: 42rem;
  color: var(--menu-muted);
  line-height: 1.6;
  white-space: pre-line;
}

.menu-order__shell {
  display: grid;
  align-content: start;
  gap: clamp(2rem, 6vw, 4rem);
  width: min(100%, 48rem);
  margin: 0 auto;
  padding-block: clamp(1rem, 4vw, 3rem);
}

.menu-order__identity {
  display: grid;
  justify-items: center;
  gap: 0.85rem;
  min-width: 0;
  text-align: center;
}

.menu-order__identity h1 {
  font-size: clamp(2.35rem, 8vw, 5rem);
  overflow-wrap: anywhere;
}

.menu-order__kitchen {
  max-width: 100%;
  overflow-wrap: anywhere;
}

.menu-order__currency {
  letter-spacing: 0.06em;
}

.menu-order__mode {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 1rem;
  width: min(100%, 40rem);
  margin: 0 auto;
  padding: clamp(1rem, 3vw, 1.5rem);
  border: 1px solid color-mix(in srgb, var(--menu-secondary) 30%, transparent);
  border-radius: var(--menu-radius);
  background: color-mix(in srgb, var(--menu-secondary) 7%, var(--menu-bg));
  text-align: left;
}

.menu-order__mode-icon {
  display: grid;
  width: 2.75rem;
  height: 2.75rem;
  place-items: center;
  border-radius: 999px;
  background: color-mix(in srgb, var(--menu-primary) 16%, var(--menu-bg));
  color: var(--menu-primary);
}

.menu-order__mode-icon :deep(.iconify) {
  width: 1.35rem;
  height: 1.35rem;
}

.menu-order__mode-copy {
  display: grid;
  gap: 0.35rem;
  min-width: 0;
}

.menu-order__mode h2 {
  color: var(--menu-title);
  font-family: var(--menu-title-font);
  font-size: clamp(1.35rem, 3vw, 1.75rem);
  line-height: 1.15;
}

.menu-order__mode-copy > p:last-child {
  color: var(--menu-muted);
  line-height: 1.55;
}

@media (max-width: 35rem) {
  .menu-order__shell {
    padding-block-start: var(--menu-browse-identity-top-offset, 0rem);
  }

  .menu-order__mode {
    grid-template-columns: 1fr;
  }
}
</style>
