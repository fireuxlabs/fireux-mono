<template>
  <section
    id="workspace-entity-controls"
    class="flex flex-wrap items-center gap-2"
    aria-label="Kitchen selector"
  >
    <WorkspaceKitchenSelectorChoices
      v-if="
        workspace.multipleKitchenView.value && workspace.collection.value.length
      "
      :collection="workspace.collection.value"
      :selected-id="workspace.id.value"
      @select="workspace.select"
    />
    <span v-if="workspace.collectionOutcome.value === 'pending'" role="status"
      >Loading Kitchens…</span
    >
    <UAlert
      v-else-if="workspace.collectionOutcome.value === 'error'"
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
      v-else-if="workspace.collection.value.length && creation.canCreate.value"
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
import { useKitchenCreate } from '../../../composables/firestore/useKitchenCreate'
import { useKitchenWorkspace } from '../../../composables/workspace/useKitchenWorkspace'

withDefaults(defineProps<{ showUpgrade?: boolean; returnTo?: string }>(), {
  showUpgrade: true,
  returnTo: '',
})
const creation = useKitchenCreate()
const createOpen = ref(false)
const workspace = useKitchenWorkspace()
</script>
