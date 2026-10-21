<template>
  <p v-if="pending" class="text-sm text-muted">Loading dishes…</p>
  <MoleculesCopyError v-else-if="error" :message="String(error)" />
  <ul
    v-else-if="names.length"
    class="mt-2 space-y-1 text-base text-highlighted"
  >
    <li v-for="dish in names" :key="dish.id">
      <NuxtLink
        :to="{
          path: `/workspace/kitchen/food-and-drink/items/${dish.id}`,
          query: { menu: menuSlug, section: sectionId },
        }"
        class="hover:text-primary underline decoration-default underline-offset-4"
        >{{ dish.name }}</NuxtLink
      >
    </li>
  </ul>
  <p v-else class="mt-2 text-sm text-muted">No dishes selected</p>
</template>
<script setup lang="ts">
import { computed, toRef } from 'vue'
import { useKitchenMenuRecordContext } from '../../../../composables/workspace/menus/useKitchenMenuRecordContext'
import { useKitchenWorkspaceDishes } from '../../../../composables/workspace/dishes/useKitchenWorkspaceDishes'
import { useMenuSectionItemCollection } from '../../../../../menu/composables/useMenuSectionItemCollection'
const props = defineProps<{ sectionId: string }>()
const { kitchenId, menuId, menuSlug, rootCollection, databaseId } =
  useKitchenMenuRecordContext()
const { dishes } = useKitchenWorkspaceDishes()
const { items, pending, error } = useMenuSectionItemCollection(
  kitchenId,
  menuId,
  toRef(props, 'sectionId'),
  { kitchenCollectionPath: rootCollection, databaseId }
)
const names = computed(() =>
  items.value.map((item) => ({
    id: item.dish_id,
    name:
      dishes.value.find((dish) => dish.id === item.dish_id)?.name ||
      item.dish_id,
  }))
)
</script>
