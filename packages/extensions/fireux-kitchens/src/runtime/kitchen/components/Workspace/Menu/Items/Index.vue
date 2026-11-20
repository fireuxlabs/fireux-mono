<template>
  <WorkspacePageHeader title="Items" variant="child">
    <template #actions>
      <UButton
        v-if="canCreate"
        label="Add item"
        icon="i-lucide-plus"
        @click="createOpen = true"
      />
    </template>
  </WorkspacePageHeader>
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
  <UModal v-if="canCreate" v-model:open="createOpen" title="Add item">
    <template #body>
      <ItemCreate
        v-if="createOpen"
        :kitchen-id="storageKitchenId"
        @created="openItem"
      />
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { navigateTo } from '#imports'
import ItemCreate from './Create/Index.vue'
import { useKitchenWorkspaceItems } from '../../../../composables/workspace/menu/items/useKitchenWorkspaceItems'
import { itemCataloguePath } from '../../../../utils/item-catalogue-route'

const { storageKitchenId, dishes, outcome, error, readOnly } =
  useKitchenWorkspaceItems()
const canCreate = computed(
  () =>
    !!storageKitchenId.value &&
    !readOnly.value &&
    (outcome.value === 'ready' || outcome.value === 'empty')
)
const createOpen = ref(false)
watch(
  [storageKitchenId, canCreate],
  () => {
    createOpen.value = false
  },
  { flush: 'sync' }
)
function openItem(id: string) {
  createOpen.value = false
  return navigateTo(`${itemCataloguePath}/${encodeURIComponent(id)}`)
}
const items = computed(() =>
  [...dishes.value].sort((a, b) =>
    (a.name || a.id).localeCompare(b.name || b.id)
  )
)
</script>
