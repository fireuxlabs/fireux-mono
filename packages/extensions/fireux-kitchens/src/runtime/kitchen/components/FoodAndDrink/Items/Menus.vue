<template>
  <div class="grid gap-4">
    <h2 class="text-xl font-semibold">Menu placements</h2>
    <FireStateCard
      v-if="error"
      state="error"
      title="Menus unavailable"
      :description="String(error)"
    />
    <p v-else-if="pending" role="status">Loading menus…</p>
    <template v-else>
      <DishMenu
        v-for="menu in activeMenus"
        :key="`${kitchenId}:${menu.id}`"
        :menu="menu"
      />
      <p v-if="!activeMenus.length" class="text-muted">
        No menus in this kitchen.
      </p>
    </template>
    <UButton
      to="/workspace/kitchen/food-and-drink/menus"
      label="Open menus"
      variant="outline"
      color="neutral"
      class="justify-self-start"
    />
  </div>
</template>
<script setup lang="ts">
import { useKitchenWorkspace } from '../../../composables/workspace/useKitchenWorkspace'
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
const workspace = useKitchenWorkspace()
import DishMenu from './Menu.vue'
import { useKitchenDishDetail } from '../../../composables/dish/useKitchenDishDetail'
import { useKitchenMenuCollection } from '../../../../menu/composables/useKitchenMenuCollection'
const { kitchenId, storageKitchenId, rootCollection, databaseId } =
  useKitchenDishDetail(
    () => (workspace.outcome.value === 'ready' ? workspace.id.value : ''),
    useRouteParam('dishId')
  )
const { activeMenus, pending, error } = useKitchenMenuCollection(
  storageKitchenId,
  {
    kitchenCollectionPath: rootCollection,
    databaseId,
  }
)
</script>
