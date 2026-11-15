<template>
  <div class="kitchen-context">
    <WorkspacePageHeader
      title="Kitchen context"
      description="Choose common guidance and add the details that make this kitchen different."
    />
    <FireState
      v-if="workspace.outcome.value !== 'ready'"
      :outcome="workspace.outcome.value"
      entity="Kitchen context"
    />
    <template v-else>
      <KitchenContextGuidance
        :key="`${workspace.id.value}/guidance`"
        :kitchen-id="workspace.id.value"
        :can-write="canWrite"
      />
      <WorkspaceKitchenContext
        :key="`${workspace.id.value}/kitchen`"
        :kitchen-id="workspace.id.value"
        subject="kitchen"
        title="Kitchen context · what is different here"
        :can-write="canWrite"
      />
      <WorkspaceKitchenContext
        v-if="workspace.placeOutcome.value === 'ready'"
        :key="`${workspace.id.value}/venue`"
        :kitchen-id="workspace.id.value"
        subject="venue"
        title="Venue context"
        :can-write="canWrite"
      />
      <FireState
        v-else
        :outcome="workspace.placeOutcome.value"
        entity="Venue context"
      />
    </template>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useKitchenWorkspace } from '../../composables/workspace/useKitchenWorkspace'
const workspace = useKitchenWorkspace()
const { currentUser } = useAuth()
const canWrite = computed(
  () =>
    Boolean(currentUser.value) &&
    workspace.outcome.value === 'ready' &&
    workspace.root.value?.id === workspace.id.value
)
</script>
<style scoped>
.kitchen-context {
  display: grid;
  gap: calc(var(--spacing) * 6);
  min-width: 0;
}
</style>
