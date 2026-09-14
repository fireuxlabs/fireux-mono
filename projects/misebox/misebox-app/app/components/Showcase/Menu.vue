<!-- Concurrent edit — 2026-07-22 12:41 CEST — Product Demo app pass: render adapter-projected Demo World through the canonical Menu presentation. -->
<template>
  <article
    class="fireux-menu-detail showcase-menu"
    data-misebox-showcase="menu"
    data-showcase-data-source="demo-world"
    :class="themeClassName"
    :style="themeStyleVars"
  >
    <MenuIdentity
      :currency-code="manifest.presentation.currencyCode"
      :description="manifest.content.description"
      heading-id="showcase-menu-title"
      :image-shade="manifest.presentation.kitchenImageShade"
      :image-url="manifest.presentation.kitchenImageUrl"
      :kitchen-name="manifest.presentation.kitchenName"
      :logo-image-url="manifest.presentation.kitchenLogoImageUrl"
      :menu-name="manifest.content.name"
      :show-currency="manifest.presentation.showCurrency !== false"
      :show-exit="false"
      :wordmark-image-url="manifest.presentation.kitchenWordmarkImageUrl"
    />

    <aside class="showcase-menu__notice" aria-label="Allergy information">
      <strong>Allergies or intolerances?</strong>
      <span
        >Please ask the Kitchen about allergens and dietary requirements.</span
      >
    </aside>

    <MenuBrowseCatalogue
      :currency-code="manifest.presentation.currencyCode"
      :currency-format="manifest.presentation.currencyFormat"
      :copy="browseSurfaceCopy"
      :sections="manifest.content.sections"
      :show-currency="manifest.presentation.showCurrency !== false"
    />
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useMenuThemeSurface } from 'fireux-kitchens/runtime/menu/composables/useMenuThemeSurface'
import { resolveMenuBrowseSurfaceCopy } from 'fireux-kitchens/runtime/menu/utils/menu-surface-copy'
import type { MenuManifest } from 'fireux-kitchens/runtime/menu/models/menu-detail.model'

const props = defineProps<{
  manifest: MenuManifest
}>()

const browseSurfaceCopy = computed(
  () => props.manifest.sproochli?.surfaceCopy ?? resolveMenuBrowseSurfaceCopy()
)

const { className: themeClassName, styleVars: themeStyleVars } =
  useMenuThemeSurface({
    theme: computed(() => props.manifest.presentation.theme),
  })
</script>

<style scoped>
.showcase-menu {
  min-height: auto;
  border: 1px solid color-mix(in srgb, var(--menu-text) 14%, transparent);
  box-shadow: 0 2rem 6rem rgb(23 32 25 / 14%);
}

.showcase-menu__notice {
  display: grid;
  width: min(100%, 48rem);
  margin: 0 auto;
  padding: calc(var(--spacing) * 3.6) calc(var(--spacing) * 4);
  border: 1px solid color-mix(in srgb, var(--menu-secondary) 30%, transparent);
  border-radius: var(--menu-radius-control);
  background: color-mix(in srgb, var(--menu-secondary) 7%, transparent);
  color: var(--menu-muted);
  font-size: 0.84rem;
  line-height: var(--leading-normal);
  text-align: left;
}

.showcase-menu__notice strong {
  color: var(--menu-text);
}

@media (min-width: 76rem) {
  .showcase-menu {
    border-radius: calc(var(--ui-radius) * 4);
  }
}
</style>
