<template>
  <ItemPlacement
    v-if="menuSlug && kitchenSlug"
    :key="`${kitchenSlug}/${menuSlug}/${item.id}`"
    :dish-id="item.id"
    :menu-slug="menuSlug"
    :kitchen-slug="kitchenSlug"
  />
  <p v-else-if="lookingUpMenu" role="status">Loading menu…</p>
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
import type { Item } from '../../kitchen/models/item.model'
import type { MenuDirectoryPage } from '../models/menu-directory.response'
import ItemPlacement from './ItemPlacement.vue'

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
</script>

<style scoped>
.menu-item-detail {
  max-inline-size: 48rem;
  --menu-item-title-size: clamp(1.5rem, 4vw, 2.25rem);
  --menu-item-description-size: var(--text-base);
  --menu-item-padding: 0;
  --menu-item-divider: 0;
}
</style>
