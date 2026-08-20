<template>
  <div class="space-y-6">
    <UButton
      to="/workspace/kitchen/mise"
      color="neutral"
      variant="ghost"
      icon="i-lucide-arrow-left"
      size="sm"
    >
      Back to mise
    </UButton>

    <template v-if="task">
      <WorkspaceKitchenOperationsMiseCardsProfile :task="task" />

      <WorkspaceKitchenOperationsMiseEdit v-if="canEditMise" :task="task" />

      <WorkspaceKitchenOperationsMiseDelete v-if="canEditMise" :task="task" />
    </template>

    <UAlert
      v-else
      color="neutral"
      variant="soft"
      :title="pending ? 'Loading mise task' : 'Mise task not found'"
      :description="
        pending
          ? 'Fetching the selected kitchen mise task.'
          : `No mise task was found for ${miseId || 'this route'}.`
      "
    />

    <DevDebugPanel
      title="Kitchen mise detail"
      scope="workspace"
      object-origin="fetched"
      :objects="{ task }"
      :derived="debug"
    />
  </div>
</template>

<script setup lang="ts">
import { provideKitchenMiseTaskWorkspace } from '../../../../composables/workspace/operations/Mise/useKitchenMiseTaskWorkspace'

const { task, miseId, pending, canEditMise, debug } =
  provideKitchenMiseTaskWorkspace()
</script>
