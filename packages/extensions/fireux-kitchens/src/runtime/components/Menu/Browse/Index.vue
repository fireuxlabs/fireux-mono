<template>
  <article
    class="fireux-menu-detail menu-browse"
    data-menu-projection="browse"
    :data-menu-id="hasMenu ? menuId : undefined"
    :data-menu-render-kind="hasMenu ? renderKind : undefined"
    :data-menu-index-path="menuIndexPath || undefined"
    :data-menu-path="hasMenu ? menuPath : undefined"
    :class="themeClassName"
    :style="themeStyleVars"
    :aria-labelledby="hasMenu
      ? 'menu-browse-title'
      : failure
        ? 'menu-browse-unavailable-title'
        : undefined"
  >
    <p v-if="pending" class="menu-browse__state" role="status">
      Loading menu…
    </p>

    <MenuBrowseUnavailable
      v-else-if="failure"
      :failure="failure"
    />

    <template v-else-if="hasMenu">
      <MenuIdentity
        :currency-code="currencyCode"
        :show-currency="showCurrency"
        :description="menuDescription"
        heading-id="menu-browse-title"
        :identity-kind="documentMenu ? 'menu' : 'kitchen-menu'"
        :image-shade="kitchenImageShade"
        :image-url="kitchenImageUrl"
        :kitchen-name="kitchenName"
        :logo-image-url="kitchenLogoImageUrl"
        :menu-name="menuName"
        :wordmark-image-url="kitchenWordmarkImageUrl"
      />

      <MenuSurfaceSwitcher
        v-if="surfaceOptions.length"
        icon="i-lucide-book-open"
        label="Browse"
        message="View the menu or choose how you would like to order."
        open-by-default
        :options="surfaceOptions"
      />

      <aside class="menu-browse__notice" aria-label="Allergy information">
        <strong>Allergies or intolerances?</strong>
        <span>
          Please ask the kitchen about allergies or dietary requirements.
        </span>
      </aside>

      <template v-if="renderKind === 'document' && documentMenu">
        <MenuDetailDocumentViewer
          v-if="documentUrl"
          :menu="documentMenu"
          :menu-id="documentMenu.id"
          :document-url="documentUrl"
          :file-url="documentUrl"
        />

        <p v-else class="menu-browse__state" role="alert">
          Menu document unavailable.
        </p>
      </template>

      <div
        v-else-if="renderKind === 'structured' && detailMenu"
        class="menu-browse__body"
      >
        <MenuSectionNav
          v-if="browseSections.length > 1"
          :sections="browseSections"
        />

        <div
          v-if="browseSections.length"
          class="menu-browse__sections menu-catalogue-sections"
        >
          <section
            v-for="section in browseSections"
            :id="section.anchor"
            :key="section.anchor"
            :aria-labelledby="section.headingId"
            class="menu-browse__section menu-catalogue-section"
          >
            <h2
              :id="section.headingId"
              class="menu-catalogue-section__heading"
              tabindex="-1"
            >
              {{ section.label }}
            </h2>

            <div class="menu-browse__items">
              <MenuBrowseItem
                v-for="(item, itemIndex) in section.items"
                :key="item.id"
                :accessibility-id="`${section.anchor}-item-${itemIndex + 1}`"
                :currency-code="currencyCode"
                :currency-format="currencyFormat"
                :item="item"
                :show-currency="showCurrency"
              />
            </div>
          </section>
        </div>

        <p v-else class="menu-browse__state" role="status">
          No menu items are published yet.
        </p>
      </div>
    </template>

    <p v-else class="menu-browse__state" role="alert">
      Menu unavailable.
    </p>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { setResponseStatus, useSeoMeta } from '#imports'
import type { CurrencyDisplayFormat } from 'fireux-core/runtime/models/core/money.model'
import { useMenu } from '../../../composables/fireux/menu/useMenu'
import { useMenuThemeSurface } from '../../../composables/fireux/menu/useMenuThemeSurface'
import {
  rootMenuRouteScope,
  type MenuRouteScope,
} from '../../../utils/kitchen-menu-route'
import { guestMenuSurfaceOptions } from '../../../utils/menu-context'
import { menuSectionLinks } from '../../../utils/menu-section-links'

const props = withDefaults(defineProps<{
  menuId: string
  menuRouteScope?: MenuRouteScope
  pageCanvas?: boolean
  propagateResponseStatus?: boolean
}>(), {
  menuRouteScope: rootMenuRouteScope,
  pageCanvas: false,
  propagateResponseStatus: false,
})

const menuId = computed(() => String(props.menuId || '').trim())
const menuRouteScope = computed(() => props.menuRouteScope)
const {
  pending,
  kitchenSlug,
  indexPath: menuIndexPath,
  menuPath,
  renderKind,
  document: documentMenu,
  manifest: detailMenu,
  failure,
  ready,
} = useMenu(menuId, { routeScope: menuRouteScope })

if (props.propagateResponseStatus) {
  await ready
  if (import.meta.server && failure.value) {
    setResponseStatus(failure.value.statusCode)
  }
}

const hasMenu = computed(() => renderKind.value !== 'unavailable')
const menuName = computed(() =>
  detailMenu.value?.content.name || documentMenu.value?.name || 'Menu'
)
const menuDescription = computed(() =>
  detailMenu.value?.content.description || documentMenu.value?.description || ''
)
const menuPresentation = computed(() =>
  detailMenu.value?.presentation || documentMenu.value || null
)
const kitchenName = computed(() =>
  menuPresentation.value?.kitchenName || ''
)
const currencyCode = computed(() =>
  String(menuPresentation.value?.currencyCode || '').trim().toUpperCase()
)
const currencyFormat = computed<CurrencyDisplayFormat>(() => {
  const format = menuPresentation.value?.currencyFormat

  return format === 'symbol' || format === 'code' ? format : 'dash'
})
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
const pageStyle = computed(() =>
  menuPresentation.value?.pageStyle || null
)
const surfaceOptions = computed(() => guestMenuSurfaceOptions({
  behaviour: detailMenu.value?.behaviour,
  menuId: menuId.value,
  routeScope: menuRouteScope.value,
  activeContext: 'generic',
}))
const browseSections = computed(() =>
  menuSectionLinks(detailMenu.value?.content.sections ?? [])
)
const documentUrl = computed(() => {
  const file = documentMenu.value?.file
  if (!file?.storage_path || !menuId.value) return file?.url || ''

  const query = new URLSearchParams()
  if (kitchenSlug.value) query.set('kitchenSlug', kitchenSlug.value)
  const qs = query.toString()

  return `/api/menus/${encodeURIComponent(menuId.value)}/file${qs ? `?${qs}` : ''}`
})
const {
  className: themeClassName,
  styleVars: themeStyleVars,
} = useMenuThemeSurface({
  pageStyle,
  pageCanvas: computed(() => props.pageCanvas),
})

useSeoMeta({
  title: () => failure.value?.title || menuName.value,
  description: () => failure.value?.description ||
    menuDescription.value || `Browse ${menuName.value}.`,
  ogTitle: () => failure.value?.title || menuName.value,
  ogDescription: () => failure.value?.description ||
    menuDescription.value || `Browse ${menuName.value}.`,
  robots: () => failure.value ? 'noindex, nofollow' : undefined,
})

</script>

<style scoped>
.menu-browse {
  align-content: start;
}

.menu-browse__state {
  margin: auto;
  color: var(--menu-muted);
  font-size: 0.95rem;
  font-weight: var(--font-weight-bold);
  text-align: center;
}

.menu-browse__notice {
  display: grid;
  width: min(100%, 48rem);
  margin: 0 auto;
  padding: 0.9rem calc(var(--spacing) * 4);
  border: 1px solid color-mix(in srgb, var(--menu-secondary) 30%, transparent);
  border-radius: var(--menu-radius-control);
  background: color-mix(in srgb, var(--menu-secondary) 7%, transparent);
  color: var(--menu-muted);
  font-size: 0.84rem;
  line-height: var(--leading-normal);
  text-align: left;
}

.menu-browse__notice strong {
  color: var(--menu-text);
}

.menu-browse__body {
  display: grid;
  gap: clamp(calc(var(--spacing) * 8), 5vw, calc(var(--spacing) * 16));
  width: min(100%, 68rem);
  margin: 0 auto;
  text-align: left;
}

.menu-browse__items {
  display: grid;
}

.menu-browse__items {
  border-top: 1px solid color-mix(in srgb, var(--menu-text) 16%, transparent);
}
</style>
