<template>
  <section
    id="workspace-entity-controls"
    class="flex items-center gap-2"
    aria-label="Kitchen selector"
  >
    <WorkspaceKitchenSelectorChoices
      v-if="index.collection.value.length"
      :collection="index.collection.value"
      :selected-id="index.selectedId.value"
      @select="index.select"
    />
    <span v-if="index.outcome.value === 'pending'" role="status">Loading Kitchens…</span>
    <UAlert v-else-if="index.outcome.value === 'error'" color="error" title="Kitchens could not be loaded" />
    <UButton
      v-if="index.selectedId.value"
      color="neutral"
      variant="ghost"
      label="Clear selection"
      @click="index.clear"
    />
    <UButton
      icon="i-lucide-plus"
      color="neutral"
      variant="soft"
      size="sm"
      aria-label="Create Kitchen"
      @click="createOpen = true"
    />

    <WorkspaceKitchenCrudCreate v-model:open="createOpen" />
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useKitchenWorkspaceIndex } from '../../composables/workspace/index/useKitchenWorkspaceIndex'

const createOpen = ref(false)
const index = useKitchenWorkspaceIndex()
</script>
