<template>
  <WorkspacePageHeader :title="kitchen?.name || 'Kitchen'" />
  <FireState
    v-if="state === 'pending' || state === 'error'"
    :outcome="state"
    :error="error"
    entity="Kitchen"
  />
  <template v-else-if="kitchen">
    <KitchenChoices
      v-if="multipleKitchenView && collection.length > 1"
      :collection="collection"
      :selected-id="id"
      @select="select"
    />
  </template>
  <p v-else>No Kitchen is available to this account.</p>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import KitchenChoices from 'fireux-kitchens/runtime/kitchen/components/Workspace/Selector/Choices.vue'
import { useKitchenWorkspace } from 'fireux-kitchens/runtime/kitchen/composables/workspace/useKitchenWorkspace'

const {
  data: kitchen,
  outcome,
  collection,
  collectionOutcome,
  error,
  id,
  multipleKitchenView,
  select,
} = useKitchenWorkspace()
const state = computed(() =>
  collectionOutcome.value === 'ready' ? outcome.value : collectionOutcome.value
)
</script>
