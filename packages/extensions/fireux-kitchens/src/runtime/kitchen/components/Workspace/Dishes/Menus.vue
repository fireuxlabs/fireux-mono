<template>
  <div class="grid gap-4">
    <h2 class="text-xl font-semibold">Menu placements</h2>
    <MoleculesStateCard
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
      to="/workspace/kitchen/menus"
      label="Open menus"
      variant="outline"
      color="neutral"
      class="justify-self-start"
    />
  </div>
</template>
<script setup lang="ts">
import DishMenu from './Menu.vue'
import { useKitchenWorkspaceDish } from '../../../composables/workspace/dishes/useKitchenWorkspaceDish'
import { useKitchenMenuCollection } from '../../../../menu/composables/useKitchenMenuCollection'
const { kitchenId, rootCollection, databaseId } = useKitchenWorkspaceDish()
const { activeMenus, pending, error } = useKitchenMenuCollection(kitchenId, {
  kitchenCollectionPath: rootCollection,
  databaseId,
})
</script>
