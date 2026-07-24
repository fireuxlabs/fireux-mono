<!-- Concurrent edit — 2026-07-22 12:20 CEST — Product Demo pass: delegate structured Browse rendering to the reusable Catalogue layer. -->
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
    :dir="translation.direction.value"
    :lang="translation.selectedLanguage.value || undefined"
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
      >
        <template
          v-if="sproochli"
          #utility
        >
          <div class="menu-browse__translation">
            <SproochliLanguageTrigger
              :language-options="sproochli.languageOptions"
              :selected-language="sproochli.selectedLanguage"
              :default-language="sproochli.defaultLanguage"
              :show-group-labels="true"
              :show-when-single-option="true"
            />

            <span
              v-if="translation.translating.value"
              class="menu-browse__translation-badge"
              role="status"
              title="Translating menu"
            >
              <UIcon
                name="i-lucide-loader-circle"
                class="size-3 animate-spin"
                aria-hidden="true"
              />
              <span class="sr-only">Translating menu…</span>
            </span>

            <span
              v-else-if="translation.translationError.value"
              class="menu-browse__translation-badge menu-browse__translation-badge--error"
              role="alert"
              title="Translation unavailable. Showing the original menu."
            >
              <UIcon
                name="i-lucide-triangle-alert"
                class="size-3"
                aria-hidden="true"
              />
              <span class="sr-only">
                Translation unavailable. Showing the original menu.
              </span>
            </span>
          </div>
        </template>
      </MenuIdentity>

      <MenuSurfaceSwitcher
        v-if="surfaceOptions.length"
        icon="i-lucide-book-open"
        :label="browseSurfaceCopy.browseLabel"
        :message="browseSurfaceCopy.browseDescription"
        open-by-default
        :options="surfaceOptions"
      />

      <aside
        class="menu-browse__notice"
        :aria-label="browseSurfaceCopy.allergyAriaLabel"
      >
        <strong>{{ browseSurfaceCopy.allergyTitle }}</strong>
        <span>
          {{ browseSurfaceCopy.allergyBody }}
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

      <MenuBrowseCatalogue
        v-else-if="renderKind === 'structured' && activeDetailMenu"
        :currency-code="currencyCode"
        :currency-format="currencyFormat"
        :sections="activeDetailMenu.content.sections"
        :show-currency="showCurrency"
      />
    </template>

    <p v-else class="menu-browse__state" role="alert">
      Menu unavailable.
    </p>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { setResponseStatus, useRoute, useSeoMeta } from '#imports'
import type { CurrencyDisplayFormat } from 'fireux-core/runtime/models/core/money.model'
import {
  normalizeSproochliLanguage,
} from 'fireux-sproochli/runtime/sproochli'
import SproochliLanguageTrigger from 'fireux-sproochli/runtime/components/Sproochli/LanguageTrigger.vue'
import { useMenu } from '../../../composables/fireux/menu/useMenu'
import { useSproochliMenuTranslation } from '../../../composables/fireux/menu/useSproochliMenuTranslation'
import { useMenuThemeSurface } from '../../../composables/fireux/menu/useMenuThemeSurface'
import {
  rootMenuRouteScope,
  type MenuRouteScope,
} from '../../../utils/kitchen-menu-route'
import { guestMenuSurfaceOptions } from '../../../utils/menu-context'

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

const route = useRoute()
const menuId = computed(() => String(props.menuId || '').trim())
const menuRouteScope = computed(() => props.menuRouteScope)
const requestedSproochliLanguage = computed(() =>
  normalizeSproochliLanguage(route.query.sproochli)
)
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
} = useMenu(menuId, {
  routeScope: menuRouteScope,
  sproochliLanguage: requestedSproochliLanguage,
})
const translation = useSproochliMenuTranslation({ menu: detailMenu })
const browseSurfaceCopy = translation.surfaceCopy

if (props.propagateResponseStatus) {
  await ready
  if (import.meta.server && failure.value) {
    setResponseStatus(failure.value.statusCode)
  }
}

const hasMenu = computed(() => renderKind.value !== 'unavailable')
const activeDetailMenu = computed(() =>
  translation.menu.value || detailMenu.value
)
const menuName = computed(() =>
  activeDetailMenu.value?.content.name || documentMenu.value?.name || 'Menu'
)
const menuDescription = computed(() =>
  activeDetailMenu.value?.content.description ||
  documentMenu.value?.description ||
  ''
)
const menuPresentation = computed(() =>
  activeDetailMenu.value?.presentation || documentMenu.value || null
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
const sproochli = computed(() => {
  const state = detailMenu.value?.sproochli
  if (!state) return null

  return {
    ...state,
    selectedLanguage: translation.selectedLanguage.value,
    languageOptions: translation.languageOptions.value,
  }
})
const preserveSproochliQuery = (to: string) => {
  const language = sproochli.value?.selectedLanguage
  if (!language) return to

  const [pathAndQuery, hash = ''] = String(to || '').split('#', 2)
  const [path, query = ''] = pathAndQuery.split('?', 2)
  const params = new URLSearchParams(query)
  params.set('sproochli', language)
  const nextQuery = params.toString()

  return `${path}${nextQuery ? `?${nextQuery}` : ''}${hash ? `#${hash}` : ''}`
}
const surfaceOptions = computed(() =>
  guestMenuSurfaceOptions({
    behaviour: detailMenu.value?.behaviour,
    menuId: menuId.value,
    routeScope: menuRouteScope.value,
    activeContext: 'generic',
  }).map((option) => ({
    ...option,
    to: preserveSproochliQuery(option.to),
  }))
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

.menu-browse__translation {
  position: relative;
  display: inline-grid;
}

.menu-browse__translation-badge {
  position: absolute;
  right: -0.2rem;
  bottom: -0.2rem;
  display: grid;
  width: 1.2rem;
  height: 1.2rem;
  place-items: center;
  border: 1px solid color-mix(in srgb, var(--menu-text) 20%, transparent);
  border-radius: 9999px;
  background: var(--menu-bg);
  color: var(--menu-secondary);
}

.menu-browse__translation-badge--error {
  color: var(--ui-color-error-500);
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

</style>
