<template>
  <UCard>
    <template #header>
      <div class="workspace-card-header">
        <div class="workspace-card-header__title">{{ tool.label }}</div>
        <p class="workspace-card-header__description">
          Move prep tasks through To do, In progress, Done, or Blocked.
        </p>
      </div>
    </template>

    <div v-if="canUpdateMiseStatus && tasksSorted.length" class="space-y-2">
      <div
        v-for="task in tasksSorted"
        :key="task.id || task.title"
        class="flex w-full flex-col gap-3 rounded-lg border border-default bg-default p-3 sm:flex-row sm:items-start"
      >
        <span
          class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-elevated text-muted"
        >
          <UIcon :name="statusOption(task).icon" class="size-4" />
        </span>

        <span class="min-w-0 flex-1 space-y-1">
          <span
            class="block text-sm font-medium text-highlighted"
            :class="
              normalizeKitchenMiseStatus(task.status) === 'done'
                ? 'line-through opacity-70'
                : ''
            "
          >
            {{ taskDisplayTitle(task) }}
          </span>
          <UBadge
            v-if="hasMissingTitle(task)"
            color="error"
            variant="soft"
            size="xs"
          >
            Missing title
          </UBadge>
          <span v-if="taskDescription(task)" class="block text-xs text-dimmed">
            {{ taskDescription(task) }}
          </span>
        </span>

        <select
          :value="normalizeKitchenMiseStatus(task.status)"
          :aria-label="`Status for ${taskDisplayTitle(task)}`"
          class="w-full shrink-0 rounded-md border border-default bg-default px-3 py-2 text-sm text-highlighted sm:w-36"
          @change="changeStatus(task, $event)"
        >
          <option
            v-for="option in KITCHEN_MISE_STATUS_OPTIONS"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </option>
        </select>
      </div>
    </div>

    <UAlert
      v-else-if="canUpdateMiseStatus"
      color="neutral"
      variant="soft"
      title="No mise tasks"
      description="No prep tasks are available for the selected kitchen."
    />

    <UAlert
      v-else
      color="neutral"
      variant="soft"
      title="Prep status board unavailable"
      description="Choose a writable kitchen to update mise tasks."
    />
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useKitchenMiseWorkspace } from '../../../../composables/workspace/operations/Mise/useKitchenMiseWorkspace'
import { kitchenMisePrepStatusChangeTool } from '../../../../tools/mise'
import {
  KITCHEN_MISE_STATUS_OPTIONS,
  normalizeKitchenMiseStatus,
  type KitchenMiseTask,
} from '../../../../utils/mise.ts'

const { miseTasks, canUpdateMiseStatus, setStatus } = useKitchenMiseWorkspace()
const tool = kitchenMisePrepStatusChangeTool.surfaces.human

const normalizeString = (value: unknown) => String(value ?? '').trim()
const statusRank = (task: KitchenMiseTask) =>
  KITCHEN_MISE_STATUS_OPTIONS.findIndex(
    (option) => option.value === normalizeKitchenMiseStatus(task.status)
  )

const tasksSorted = computed(() =>
  [...miseTasks.value].sort((a, b) => {
    const doneDelta = statusRank(a) - statusRank(b)
    if (doneDelta !== 0) return doneDelta
    const titleDelta = taskDisplayTitle(a).localeCompare(taskDisplayTitle(b))
    if (titleDelta !== 0) return titleDelta
    return normalizeString(a.id).localeCompare(normalizeString(b.id))
  })
)

const taskTitle = (task: KitchenMiseTask) => normalizeString(task.title)

const taskDisplayTitle = (task: KitchenMiseTask) =>
  taskTitle(task) || 'Missing mise title'

const hasMissingTitle = (task: KitchenMiseTask) => !taskTitle(task)

const taskDescription = (task: KitchenMiseTask) =>
  normalizeString(task.description) || normalizeString(task.notes)

const statusOption = (task: KitchenMiseTask) =>
  KITCHEN_MISE_STATUS_OPTIONS.find(
    (option) => option.value === normalizeKitchenMiseStatus(task.status)
  ) ?? KITCHEN_MISE_STATUS_OPTIONS[0]

const changeStatus = (task: KitchenMiseTask, event: Event) => {
  const target = event.target
  if (!(target instanceof HTMLSelectElement)) return
  void setStatus(task, normalizeKitchenMiseStatus(target.value))
}
</script>
