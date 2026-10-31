<template>
  <p v-if="pending || dishesPending" class="fx-type-caption">Loading dishes…</p>
  <FireCopyError
    v-else-if="error || dishesError"
    :message="String(error || dishesError)"
  />
  <ul v-else-if="names.length" class="fx-type-caption">
    <li v-for="dish in names" :key="dish.id">
      <NuxtLink
        :to="{
          path: `/workspace/kitchen/food-and-drink/items/${dish.id}`,
          query: { menu: menuSlug, section: sectionId },
        }"
        class="menu-dish-link"
        >{{ dish.name }}</NuxtLink
      >
    </li>
  </ul>
  <p v-else class="fx-type-caption">No dishes selected</p>
</template>
<script setup lang="ts">
import { computed, toRef } from 'vue'
import { useKitchenMenuRecordContext } from '../../../../composables/workspace/menus/useKitchenMenuRecordContext'
import type { Dish } from '../../../../utils/dish'
import { useMenuSectionItemCollection } from '../../../../../menu/composables/useMenuSectionItemCollection'
const props = defineProps<{
  sectionId: string
  dishes: Dish[]
  dishesPending: boolean
  dishesError?: unknown
}>()
const { storageKitchenId, menuId, menuSlug, rootCollection, databaseId } =
  useKitchenMenuRecordContext()
const { items, pending, error } = useMenuSectionItemCollection(
  storageKitchenId,
  menuId,
  toRef(props, 'sectionId'),
  { kitchenCollectionPath: rootCollection, databaseId }
)
const names = computed(() =>
  items.value.map((item) => ({
    id: item.dish_id,
    name:
      props.dishes.find((dish) => dish.id === item.dish_id)?.name ||
      item.dish_id,
  }))
)
</script>

<style scoped>
.menu-dish-link {
  text-decoration: underline;
  text-underline-offset: 0.25em;
}
</style>
