<template>
  <div class="space-y-6">
    <KitchenMiseTaskCollection
      :tasks="tasks"
      :kitchen-name="selectedKitchenName"
      :pending="pending"
      :error="Boolean(error)"
      heading-id="console-kitchen-mise-status"
      link-base="/console/kitchen/mise"
    />

    <DevDebugPanel
      title="Kitchen mise"
      scope="console"
      object-origin="fetched"
      :objects="{ selectedKitchen, miseTasks }"
      :derived="pageDebug"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  groupKitchenMiseTaskSummariesByWorkflow,
  projectKitchenMiseTasks,
  cleanKitchenMiseText,
} from '../../../../../models/kitchen/mise-presentation'
import { useKitchenMiseWorkspace } from '../../../../../composables/fireux/console/kitchen/operations/Mise/useKitchenMiseWorkspace'

const {
  miseTasks,
  selectedKitchen,
  stationNames,
  pending,
  error,
  outcome,
  debug,
} = useKitchenMiseWorkspace()
const tasks = computed(() =>
  projectKitchenMiseTasks(miseTasks.value, {
    stationNames: stationNames.value,
  })
)
const workflowGroups = computed(() =>
  groupKitchenMiseTaskSummariesByWorkflow(tasks.value)
)
const activeTaskCount = computed(
  () => tasks.value.filter(task => task.status !== 'done').length
)
const selectedKitchenName = computed(() =>
  cleanKitchenMiseText(selectedKitchen.value?.name)
)
const pageDebug = computed(() => ({
  ...debug.value,
  presentation: {
    groupedBy: 'workflow_stage',
    outcome: outcome.value,
    activeTaskCount: activeTaskCount.value,
    taskCountsByWorkflowStage: Object.fromEntries(
      workflowGroups.value.map(group => [group.value, group.tasks.length])
    ),
  },
}))
</script>
