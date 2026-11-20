<template>
  <div
    v-if="presentation && sections.length"
    class="fireux-menu-detail menu-item-placement"
    :class="className"
    :style="styleVars"
  >
    <MenuBrowseCatalogue
      :sections="sections"
      :copy="copy"
      :currency-code="presentation.currencyCode"
      :currency-format="presentation.currencyFormat"
      :show-currency="presentation.showCurrency"
      :show-item-images="presentation.showItemImages"
    />
  </div>
  <p v-else role="status">
    {{ pending ? 'Loading menu…' : 'Item unavailable on this menu.' }}
  </p>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useKitchenOfferingNow } from '../../kitchen/composables/useKitchenOfferingNow'
import { promotionPricedSections } from '../../kitchen/utils/promotions/pricing'
import { useMenu } from '../composables/useMenu'
import { useMenuThemeSurface } from '../composables/useMenuThemeSurface'
import { resolveMenuBrowseSurfaceCopy } from '../utils/catalogue/surface-copy'
import { directoryMenuRouteScope } from '../utils/navigation/route'

const props = defineProps<{
  dishId: string
  menuSlug: string
  kitchenSlug: string
}>()
const { manifest, pending } = useMenu(() => props.menuSlug, {
  routeScope: () => directoryMenuRouteScope(props.kitchenSlug),
})
const selectedMenu = computed(() => {
  const current = manifest.value
  if (
    current &&
    current.source.kitchenSlug === props.kitchenSlug &&
    (current.source.menuSlug === props.menuSlug ||
      current.source.menuId === props.menuSlug)
  )
    return current
  return null
})
const presentation = computed(() => selectedMenu.value?.presentation)
const copy = computed(
  () =>
    selectedMenu.value?.sproochli?.surfaceCopy ?? resolveMenuBrowseSurfaceCopy()
)
const { now } = useKitchenOfferingNow()
const sections = computed(() => {
  const content = selectedMenu.value?.content
  if (!content) return []
  return promotionPricedSections(
    content.sections
      .map((section) => ({
        ...section,
        items: section.items.filter((item) => item.dishId === props.dishId),
      }))
      .filter((section) => section.items.length),
    content.promotions,
    now.value
  )
})
const { className, styleVars } = useMenuThemeSurface({
  theme: () => presentation.value?.theme,
  themeSource: () => presentation.value?.themeSource,
})
</script>
<style scoped>
.menu-item-placement {
  max-inline-size: 48rem;
  min-height: 0;
  margin: 0;
  border-radius: calc(var(--ui-radius) * 2);
}
</style>
