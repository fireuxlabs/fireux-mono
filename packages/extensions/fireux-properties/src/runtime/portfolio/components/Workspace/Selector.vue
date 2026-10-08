<template>
  <section class="flex flex-wrap items-center gap-2" aria-label="Portfolio selector">
    <UTabs v-if="items.length" :model-value="index.selectedId.value" :items="items"
      :content="false" variant="link" size="sm" class="w-fit max-w-full"
      @update:model-value="index.select(String($event))" />
    <span v-if="index.outcome.value === 'pending'" role="status">Loading…</span>
    <UAlert v-else-if="index.outcome.value === 'error'" title="Workspace choices could not be loaded" color="error" />
  </section>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { usePortfolioWorkspaceIndex } from '../../composables/workspace/usePortfolioWorkspaceIndex'
const index = usePortfolioWorkspaceIndex()
const items = computed(() => index.collection.value.filter(item => Boolean(item.id)).map(item => ({
  label: item.identity.name || item.id, value: item.id,
})))
</script>
