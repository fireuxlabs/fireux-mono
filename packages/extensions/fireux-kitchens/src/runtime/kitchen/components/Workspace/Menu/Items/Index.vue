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
    <UInput
      v-model="query"
      icon="i-lucide-search"
      placeholder="Search items"
      aria-label="Search items"
    />
    <ul v-if="results.length" aria-label="Items" class="item-list">
      <li v-for="item in results" :key="item.id">
        <NuxtLink :to="`${itemCataloguePath}/${encodeURIComponent(item.id)}`">
          {{ item.name || item.id }}
        </NuxtLink>
      </li>
    </ul>
    <p v-else role="status">
      {{ dishes.length ? 'No matching items.' : 'No items yet.' }}
    </p>
  </template>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useKitchenWorkspaceItems } from '../../../../composables/workspace/menu/items/useKitchenWorkspaceItems'
import { itemCataloguePath } from '../../../../utils/item-catalogue-route'

const { kitchenId, storageKitchenId, dishes, outcome, error } =
  useKitchenWorkspaceItems()
const query = ref('')
const results = computed(() => {
  const search = query.value.trim().toLocaleLowerCase()
  return dishes.value
    .filter((item) =>
      `${item.name || item.id} ${item.description || ''}`
        .toLocaleLowerCase()
        .includes(search)
    )
    .sort((a, b) => (a.name || a.id).localeCompare(b.name || b.id))
})

watch(kitchenId, (_next, previous) => {
  if (previous) query.value = ''
})
</script>

<style scoped>
.item-list {
  list-style: none;
  margin: 0;
  padding: 0;
}
.item-list li + li {
  border-block-start: 1px solid var(--ui-border);
}
.item-list a {
  display: block;
  padding-block: calc(var(--spacing) * 3);
}
.item-list a:hover {
  text-decoration: underline;
}
</style>
