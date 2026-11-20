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
  <p v-else-if="menu || menuSlug || lookingUpMenu" role="status">
    {{
      lookingUpMenu || pending
        ? 'Loading menu…'
        : 'Item unavailable on this menu.'
    }}
  </p>
  <MenuItemDisplay
    v-else
    class="menu-item-detail"
    heading-tag="h1"
    :name="item.name"
    :description="item.description"
    :image-url="item.image"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useApiRead } from 'fireux-core/runtime/composables/http/useApiRead'
import type { Item } from '../../kitchen/records/menus/items/item'
import type { MenuDirectoryPage } from '../models/menu-directory.response'
import { useKitchenOfferingNow } from '../../kitchen/composables/useKitchenOfferingNow'
import { promotionPricedSections } from '../../kitchen/utils/promotions/pricing'
import { useMenu } from '../composables/useMenu'
import { useMenuThemeSurface } from '../composables/useMenuThemeSurface'
import { resolveMenuBrowseSurfaceCopy } from '../utils/catalogue/surface-copy'
import { directoryMenuRouteScope } from '../utils/navigation/route'

const props = defineProps<{
  item: Pick<Item, 'id' | 'name' | 'description' | 'image'>
  menu?: string
  kitchenSlug?: string
}>()
const lookup = computed(() => {
  if (props.menu || !props.kitchenSlug || !props.item.id) return ''
  const query = new URLSearchParams({
    kitchenSlug: props.kitchenSlug,
    dishId: props.item.id,
    limit: '1',
  })
  return `/api/menus?${query}`
})
const directory = useApiRead(
  () => `item-menu-preview|${lookup.value}`,
  ({ fetch }) =>
    lookup.value
      ? fetch<MenuDirectoryPage>(lookup.value)
      : Promise.resolve(null)
)
const lookingUpMenu = computed(() =>
  Boolean(lookup.value && directory.pending.value)
)
const menuSlug = computed(() => {
  if (props.menu) return props.menu
  if (!lookup.value) return ''
  const result = directory.data.value
  const match = result?.items[0]
  return result?.scope.kind === 'directory' &&
    result.scope.kitchenSlug === props.kitchenSlug &&
    match?.matching_dishes?.some((dish) => dish.id === props.item.id)
    ? match.slug || match.id
    : ''
})
const { manifest, pending } = useMenu(
  () => (props.kitchenSlug ? menuSlug.value : ''),
  {
    routeScope: () => directoryMenuRouteScope(props.kitchenSlug),
  }
)
const selectedMenu = computed(() => {
  const current = manifest.value
  if (
    current &&
    current.source.kitchenSlug === props.kitchenSlug &&
    (current.source.menuSlug === menuSlug.value ||
      current.source.menuId === menuSlug.value)
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
        items: section.items.filter((item) => item.dishId === props.item.id),
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
.menu-item-placement,
.menu-item-detail {
  max-inline-size: 48rem;
}

.menu-item-placement {
  min-height: 0;
  margin: 0;
  border-radius: calc(var(--ui-radius) * 2);
}

.menu-item-detail {
  --menu-item-title-size: clamp(1.5rem, 4vw, 2.25rem);
  --menu-item-description-size: var(--text-base);
  --menu-item-padding: 0;
  --menu-item-divider: 0;
}
</style>
