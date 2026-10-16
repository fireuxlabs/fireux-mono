<template>
  <section class="entity-collection menu-collection">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <UInput
        v-model="query"
        placeholder="Search menus or Kitchens"
        aria-label="Search menus"
        icon="i-lucide-search"
        size="xl"
        class="directory-search"
        :ui="{ base: 'rounded-xl py-3 bg-elevated/40' }"
      />
      <span
        class="text-xs font-medium tracking-wide text-muted"
        aria-live="polite"
        >{{ visibleCount }} {{ visibleCount === 1 ? 'menu' : 'menus' }}</span
      >
    </div>
    <UAlert
      v-if="menus.length && query && !visibleCount"
      title="No menus found"
      description="Try another menu or Kitchen name."
      color="neutral"
      variant="soft"
      icon="i-lucide-search"
    />
    <UAlert
      v-if="kitchenOutcome === 'error'"
      title="Kitchens could not be loaded"
      description="Please try again to browse Kitchen menus."
      color="neutral"
      variant="soft"
    />
    <MenuCollectionList :kitchens="visibleKitchens" />
  </section>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useCollectionSearch } from 'fireux-core/runtime/composables/shared/useCollectionSearch'
import type { MenuDirectoryEntry } from '../../models/menu-directory.response'
import { useKitchenCollection } from '../../../kitchen/composables/useKitchenCollection'
const props = defineProps<{
  menus: MenuDirectoryEntry[]
}>()
const { collection: kitchens, outcome: kitchenOutcome } = useKitchenCollection()
const kitchenById = computed(
  () => new Map(kitchens.value.map((kitchen) => [kitchen.id, kitchen]))
)
const kitchenBySlug = computed(
  () =>
    new Map(kitchens.value.map((kitchen) => [kitchen.identity.slug, kitchen]))
)
const hasKitchen = (menu: MenuDirectoryEntry) =>
  Boolean(menu.source?.kitchen_id || menu.source?.kitchen_slug)
const kitchenForMenu = (menu: MenuDirectoryEntry) =>
  kitchenById.value.get(menu.source?.kitchen_id || '') ||
  kitchenBySlug.value.get(menu.source?.kitchen_slug || '')
const menus = computed(() =>
  props.menus.filter(
    (menu) => !hasKitchen(menu) || Boolean(kitchenForMenu(menu))
  )
)
const makeCard = (menu: MenuDirectoryEntry) => ({
  title: menu.name,
  subtitle: [
    kitchenForMenu(menu)?.place.name,
    menu.source?.kitchen_name,
    menu.kitchen?.name,
    menu.description,
  ]
    .filter(Boolean)
    .join(' '),
})
const { query, visibleItems, visibleCount } = useCollectionSearch({
  items: menus,
  makeCard,
  initialVariant: 'cell',
})
const visibleKitchens = computed(() => {
  const ids = new Set(
    visibleItems.value.map((menu) => kitchenForMenu(menu)?.id).filter(Boolean)
  )
  return kitchens.value.filter((kitchen) => ids.has(kitchen.id))
})
</script>

<style scoped>
.menu-collection {
  gap: calc(var(--spacing) * 6);
}
.directory-search {
  width: min(100%, 32rem);
}
</style>
