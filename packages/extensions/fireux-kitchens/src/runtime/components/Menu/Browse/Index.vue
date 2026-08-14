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
    :dir="menuDirection"
    :lang="menuLanguage || undefined"
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
        :back-to-menus-label="browseSurfaceCopy.backToMenusLabel"
        :close-menu-label="browseSurfaceCopy.closeMenuLabel"
        :show-currency="showCurrency"
        :description="menuDescription"
        heading-id="menu-browse-title"
        :identity-kind="documentMenu ? 'menu' : 'kitchen-menu'"
        :kitchen-name="kitchenName"
        :menu-name="menuName"
        presentation="open"
        :prices-label="browseSurfaceCopy.pricesLabel"
      >
        <template
          v-if="sproochli"
          #utility
        >
          <ClientOnly>
            <div class="menu-browse__translation">
              <SproochliLanguageTrigger
                :language-options="sproochliLanguageOptions"
                :selected-language="sproochli.language"
                :default-language="sproochli.defaultLanguage"
                :show-group-labels="true"
                :show-when-single-option="true"
              />

              <span
                v-if="sproochli.state === 'unavailable'"
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
          </ClientOnly>
        </template>
      </MenuIdentity>

      <MenuSurfaceRail
        v-if="orderingSurfaceOptions.length"
        :options="orderingSurfaceOptions"
      />

      <aside
        v-else
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
        :copy="browseSurfaceCopy"
        :sections="activeDetailMenu.content.sections"
        :show-currency="showCurrency"
      />

      <MenuBrowseSpecials
        v-if="activeDetailMenu?.specials"
        :currency-code="currencyCode"
        :currency-format="currencyFormat"
        :copy="browseSurfaceCopy"
        :show-currency="showCurrency"
        :specials="activeDetailMenu.specials"
      />

      <DevDebugPanel
        title="Menu"
        scope="runtime"
      object-origin="fetched"
      :objects="{ menu: activeDetailMenu }"
      :derived="menuDebug"
        :default-open="true"
      />
    </template>

    <p v-else class="menu-browse__state" role="alert">
      Menu unavailable.
    </p>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { setResponseStatus, useRoute } from '#imports'
import type { CurrencyDisplayFormat } from '../../../models/shared/currency-display.model'
import { useSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import {
  isSproochliRtlLanguage,
  normalizeSproochliLanguage,
  resolveSproochliLanguageState,
} from 'fireux-sproochli/runtime/sproochli'
import SproochliLanguageTrigger from 'fireux-sproochli/runtime/components/Sproochli/LanguageTrigger.vue'
import { useMenu } from '../../../composables/fireux/menu/useMenu'
import { useMenuThemeSurface } from '../../../composables/fireux/menu/useMenuThemeSurface'
import { resolveMenuBrowseSurfaceCopy } from '../../../content/menu-surface-copy'
import {
  menuCanonicalPath,
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
const browseSurfaceCopy = computed(() =>
  detailMenu.value?.sproochli?.surfaceCopy ??
  resolveMenuBrowseSurfaceCopy()
)

if (props.propagateResponseStatus) {
  await ready
  if (import.meta.server && failure.value) {
    setResponseStatus(failure.value.statusCode)
  }
}

const hasMenu = computed(() => renderKind.value !== 'unavailable')
const activeDetailMenu = computed(() => detailMenu.value)
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
const pageStyle = computed(() =>
  menuPresentation.value?.pageStyle || null
)
const canonicalPath = computed(() =>
  menuCanonicalPath({
    scope: menuRouteScope.value,
    menuId: menuId.value,
    sourceKitchenSlug: detailMenu.value?.source.kitchenSlug,
    sourceMenuId: detailMenu.value?.source.menuId,
  })
)
const sproochli = computed(() => {
  return detailMenu.value?.sproochli ?? null
})
const sproochliLanguageOptions = computed(() =>
  resolveSproochliLanguageState({
    enabled: true,
    defaultLanguage: sproochli.value?.defaultLanguage,
    cachedLanguages: sproochli.value?.readyLanguages ?? [],
  }).options
)
const menuLanguage = computed(() =>
  sproochli.value?.state === 'translated'
    ? sproochli.value.language
    : ''
)
const menuDirection = computed(() =>
  sproochli.value?.state === 'translated' &&
  isSproochliRtlLanguage(sproochli.value.language)
    ? 'rtl'
    : 'ltr'
)
const menuDebug = computed(() => ({
  menu_id: menuId.value,
  route_scope: menuRouteScope.value,
  render_kind: renderKind.value,
  source: activeDetailMenu.value?.source ?? null,
  specials: activeDetailMenu.value?.specials
    ? {
        name: activeDetailMenu.value.specials.name,
        section_count: activeDetailMenu.value.specials.sections.length,
      }
    : null,
  sproochli: {
    state: sproochli.value?.state ?? 'off',
    language: sproochli.value?.language || 'Default',
    default_language: sproochli.value?.defaultLanguage ?? null,
    ready_languages: sproochli.value?.readyLanguages ?? null,
  },
}))
const preserveSproochliQuery = (to: string) => {
  const language = sproochli.value?.language
  if (!language) return to

  const [pathAndQuery, hash = ''] = String(to || '').split('#', 2)
  const [path, query = ''] = pathAndQuery.split('?', 2)
  const params = new URLSearchParams(query)
  params.set('sproochli', language)
  const nextQuery = params.toString()

  return `${path}${nextQuery ? `?${nextQuery}` : ''}${hash ? `#${hash}` : ''}`
}
const orderingSurfaceOptions = computed(() =>
  guestMenuSurfaceOptions({
    behaviour: detailMenu.value?.behaviour,
    menuId: menuId.value,
    routeScope: menuRouteScope.value,
    activeContext: 'generic',
  })
    .filter(option => option.value !== 'generic')
    .map((option) => ({
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

useSeo({
  title: () => failure.value?.title || menuName.value,
  description: () => failure.value?.description ||
    menuDescription.value || `Browse ${menuName.value}.`,
  path: canonicalPath,
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
  padding: calc(var(--spacing) * 4);
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

@media (max-width: 35rem) {
  .menu-browse {
    gap: calc(var(--spacing) * 4);
    padding-right: max(calc(var(--spacing) * 4), env(safe-area-inset-right));
    padding-left: max(calc(var(--spacing) * 4), env(safe-area-inset-left));
  }
}

</style>
