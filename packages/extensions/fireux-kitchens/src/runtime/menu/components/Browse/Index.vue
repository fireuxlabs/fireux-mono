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
    :aria-labelledby="
      hasMenu
        ? 'menu-browse-title'
        : failure
          ? 'menu-browse-unavailable-title'
          : undefined
    "
  >
    <p v-if="pending" class="menu-browse__state" role="status">Loading menu…</p>

    <MenuBrowseUnavailable v-else-if="failure" :failure="failure" />

    <template v-else-if="hasMenu">
      <MenuDetailHeader
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
        <template v-if="kitchenLogoUrl && !logoFailed" #brand>
          <img
            :src="kitchenLogoUrl"
            :alt="`${kitchenName} logo`"
            class="menu-browse__logo"
            :style="logoStyle"
            @error="logoFailed = true"
          />
        </template>
        <template v-if="sproochli" #utility>
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
      </MenuDetailHeader>

      <KitchenDetailOfferingTimes
        v-if="detailMenu?.source?.kitchenId || documentMenu?.offerings"
        :offerings="
          detailMenu?.behaviour.offerings || documentMenu?.offerings || []
        "
        empty-message="Serving times have not been published."
      />

      <MenuBrowseServices
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
        <MenuBrowseDocumentViewer
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

      <DiagnosticsDebugPanel
        title="Menu"
        scope="runtime"
        object-origin="fetched"
        :objects="{ menu: activeDetailMenu }"
        :derived="menuDebug"
        launcher
      />
    </template>

    <p v-else class="menu-browse__state" role="alert">Menu unavailable.</p>
  </article>
</template>

<script setup lang="ts">
import { setResponseStatus } from '#imports'
import { rootMenuRouteScope, type MenuRouteScope } from '../../utils/menu-route'
import { useMenuBrowse } from '../../composables/useMenuBrowse'
const props = withDefaults(
  defineProps<{
    menuId: string
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

const {
  ready,
  sproochli,
  detailMenu,
  pending,
  menuIndexPath,
  menuPath,
  renderKind,
  documentMenu,
  failure,
  browseSurfaceCopy,
  hasMenu,
  activeDetailMenu,
  menuName,
  menuDescription,
  kitchenName,
  logoFailed,
  kitchenLogoUrl,
  logoStyle,
  currencyCode,
  currencyFormat,
  showCurrency,
  sproochliLanguageOptions,
  menuLanguage,
  menuDirection,
  menuDebug,
  orderingSurfaceOptions,
  documentUrl,
  themeClassName,
  themeStyleVars,
} = useMenuBrowse(props)
if (props.propagateResponseStatus) {
  await ready
  if (import.meta.server && failure.value) setResponseStatus(failure.value.statusCode)
}
</script>

<style scoped>
.menu-browse {
  align-content: start;
  --menu-section-nav-top: calc(
    var(--ui-header-height, 4rem) + var(--spacing) * 3
  );
}

.menu-browse__logo {
  width: calc(var(--spacing) * 12);
  height: calc(var(--spacing) * 12);
  padding: var(--spacing);
  border-radius: var(--menu-radius-control);
  object-fit: contain;
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
  width: 100%;
  margin: 0 auto;
  padding: calc(var(--spacing) * 3) calc(var(--spacing) * 4);
  border: 0;
  border-inline-start: 2px solid var(--menu-secondary);
  border-radius: var(--menu-radius-control);
  background: transparent;
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
