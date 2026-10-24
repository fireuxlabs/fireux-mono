<template>
  <section
    class="flex flex-wrap items-center gap-2"
    aria-label="Portfolio selector"
  >
    <UTabs
      v-if="items.length"
      :model-value="workspace.id.value"
      :items="items"
      :content="false"
      variant="link"
      size="sm"
      class="w-fit max-w-full"
      @update:model-value="workspace.select(String($event))"
    />
    <span v-if="workspace.collectionOutcome.value === 'pending'" role="status"
      >Loading…</span
    >
    <UAlert
      v-else-if="workspace.collectionOutcome.value === 'error'"
      title="Workspace choices could not be loaded"
      color="error"
    />
  </section>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { usePortfolioWorkspace } from '../../composables/workspace/usePortfolioWorkspace'
const workspace = usePortfolioWorkspace()
const items = computed(() =>
  workspace.collection.value
    .filter((item) => Boolean(item.id))
    .map((item) => ({
      label: item.identity.name || item.id,
      value: item.id,
    }))
)
</script>
