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

    <DevFireuxDebugPanel
      title="Kitchen mise detail"
      scope="console"
      :data="debug"
    />
  </div>
</template>

<script setup lang="ts">
import { useKitchenConsoleMiseTask } from '../../../../../composables/fireux/console/kitchen/Operations/Mise/useKitchenConsoleMiseTask'
const { task, miseId, pending, canEditMise, debug } = useKitchenConsoleMiseTask()
</script>
