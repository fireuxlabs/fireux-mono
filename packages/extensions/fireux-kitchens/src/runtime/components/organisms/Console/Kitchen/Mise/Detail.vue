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
      <MiseProfile :task="task" />

      <OrganismsConsoleKitchenMiseEdit
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
      v-if="isDev"
      title="Kitchen mise detail"
      scope="console"
      :data="debug"
    />
  </div>
</template>

<script setup lang="ts">
import { useKitchenConsoleMiseTask } from '../../../../../composables/fireux/console/kitchen/operations/useKitchenConsoleMiseTask'
import MiseProfile from '../../../Mise/Cards/Profile.vue'

const { task, miseId, pending, canEditMise, debug } = useKitchenConsoleMiseTask()
const isDev = import.meta.dev
</script>
