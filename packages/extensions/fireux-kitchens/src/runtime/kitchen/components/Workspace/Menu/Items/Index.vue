<template>
  <WorkspacePageHeader title="Items" variant="child" />
  <FireState v-if="outcome === 'pending'" outcome="pending" entity="items" />
  <FireState
    v-else-if="outcome === 'error'"
    outcome="error"
    entity="items"
    :error="error"
  />
  <p v-else-if="!storageKitchenId">Select a Kitchen to view its items.</p>
  <template v-else>
    <ul v-if="items.length" aria-label="Items">
      <li v-for="item in items" :key="item.id">
        <NuxtLink :to="`${itemCataloguePath}/${encodeURIComponent(item.id)}`">
          {{ item.name || item.id }}
        </NuxtLink>
      </li>
    </ul>
    <p v-else role="status">No items yet.</p>
  </template>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useKitchenWorkspaceItems } from '../../../../composables/workspace/menu/items/useKitchenWorkspaceItems'
import { itemCataloguePath } from '../../../../utils/item-catalogue-route'

const { storageKitchenId, dishes, outcome, error } = useKitchenWorkspaceItems()
const items = computed(() =>
  [...dishes.value].sort((a, b) =>
    (a.name || a.id).localeCompare(b.name || b.id)
  )
)
</script>
