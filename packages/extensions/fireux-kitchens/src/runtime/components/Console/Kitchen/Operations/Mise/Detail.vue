<template>
  <div class="space-y-6">
    <UButton
      to="/console/kitchen/mise"
      color="neutral"
      variant="ghost"
      icon="i-lucide-arrow-left"
      size="sm"
    >
      Back to mise
    </UButton>

    <template v-if="task">
      <ConsoleKitchenOperationsMiseCardsProfile :task="task" />

      <ConsoleKitchenOperationsMiseEdit
        v-if="canEditMise"
        :task="task"
      />
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
      scope="console"
      object-origin="fetched"
      :objects="{ task }"
      :derived="debug"
    />
  </div>
</template>

<script setup lang="ts">
import { provideKitchenMiseTaskWorkspace } from '../../../../../composables/fireux/console/kitchen/operations/Mise/useKitchenMiseTaskWorkspace'

const { task, miseId, pending, canEditMise, debug } =
  provideKitchenMiseTaskWorkspace()
</script>
