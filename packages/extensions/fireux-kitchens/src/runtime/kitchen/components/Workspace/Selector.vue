<template>
  <section
    id="workspace-entity-controls"
    class="flex flex-wrap items-center gap-2"
    aria-label="Kitchen selector"
  >
    <WorkspaceKitchenSelectorChoices
      v-if="index.multipleKitchenView.value && index.collection.value.length"
      :collection="index.collection.value"
      :selected-id="index.selectedId.value"
      @select="index.select"
    />
    <span v-if="index.outcome.value === 'pending'" role="status"
      >Loading Kitchens…</span
    >
    <UAlert
      v-else-if="index.outcome.value === 'error'"
      color="error"
      title="Kitchens could not be loaded"
    />
    <UButton
      v-if="showUpgrade && creation.showUpgrade.value"
      to="/pricing"
      label="Upgrade to manage more"
      icon="i-lucide-arrow-up-right"
      color="primary"
      variant="soft"
    />
    <UButton
      v-else-if="index.collection.value.length && creation.canCreate.value"
      label="Create workspace"
      icon="i-lucide-plus"
      color="neutral"
      variant="soft"
      size="sm"
      aria-label="Create Kitchen"
      @click="createOpen = true"
    />

    <WorkspaceKitchenHomeCreate
      v-if="creation.canCreate.value"
      v-model:open="createOpen"
      :return-to="returnTo"
    />
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useKitchenWorkspace } from '../../composables/workspace/useKitchenWorkspace'
import { useKitchenWorkspaceIndex } from '../../composables/workspace/index/useKitchenWorkspaceIndex'

withDefaults(defineProps<{ showUpgrade?: boolean; returnTo?: string }>(), {
  showUpgrade: true,
  returnTo: '',
})
const creation = useKitchenWorkspace()
const createOpen = ref(false)
const index = useKitchenWorkspaceIndex()
</script>
