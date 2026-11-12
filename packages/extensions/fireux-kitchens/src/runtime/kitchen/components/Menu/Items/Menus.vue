<template>
  <div>
    <h2>Appears on</h2>
    <p>
      Open a section below to manage this Item’s placement. Item details are
      shared across these Menus.
    </p>
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
        :key="`${kitchenId}:${dishId}:${menu.id}`"
        :menu="menu"
        @result="results[menu.id] = $event"
      />
      <p v-if="relationshipsPending" role="status">Checking Menu placements…</p>
      <p v-else-if="relationshipsEmpty">
        This Item is not placed on any active Menu yet.
      </p>
    </template>
    <UButton
      to="/workspace/kitchen/menu"
      label="Open menus"
      variant="outline"
      color="neutral"
    />
  </div>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import DishMenu from './Menu.vue'
import { useKitchenItemDetail } from '../../../composables/dish/useKitchenItemDetailContext'
import { useKitchenMenuCollection } from '../../../../menu/composables/useKitchenMenuCollection'
const { kitchenId, dishId, storageKitchenId, rootCollection, databaseId } =
  useKitchenItemDetail()
const { activeMenus, pending, error } = useKitchenMenuCollection(
  storageKitchenId,
  {
    kitchenCollectionPath: rootCollection,
    databaseId,
  }
)
const results = ref<Record<string, 'pending' | 'error' | 'empty' | 'match'>>({})
watch(
  [kitchenId, dishId],
  () => {
    results.value = {}
  },
  { flush: 'sync' }
)
const relationshipsPending = computed(() =>
  activeMenus.value.some(
    (menu) => !results.value[menu.id] || results.value[menu.id] === 'pending'
  )
)
const relationshipsEmpty = computed(
  () =>
    !relationshipsPending.value &&
    activeMenus.value.every((menu) => results.value[menu.id] === 'empty')
)
</script>
