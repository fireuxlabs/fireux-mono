<template>
  <UCard>
    <template #header>
      <div class="console-card-header">
        <div class="console-card-header__title">Prep Whiteboard</div>
        <p class="console-card-header__description">
          Toggle prep tasks done or not done for the selected test kitchen.
        </p>
      </div>
    </template>

    <div v-if="canToggleMise && tasksSorted.length" class="space-y-2">
      <button
        v-for="task in tasksSorted"
        :key="task.id || task.title"
        type="button"
        class="flex w-full items-start gap-3 rounded-lg border border-default bg-default p-3 text-left transition hover:bg-elevated/60"
        :class="isDone(task) ? 'opacity-60' : ''"
        @click="toggleDone(task)"
      >
        <span
          class="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded border"
          :class="
            isDone(task)
              ? 'border-primary bg-primary text-inverted'
              : 'border-default text-dimmed'
          "
        >
          <UIcon
            v-if="isDone(task)"
            name="i-lucide-check"
            class="size-3.5"
          />
        </span>

        <span class="min-w-0 flex-1 space-y-1">
          <span
            class="block text-sm font-medium text-highlighted"
            :class="isDone(task) ? 'line-through' : ''"
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
      </button>
    </div>

    <UAlert
      v-else-if="canToggleMise"
      color="neutral"
      variant="soft"
      title="No mise tasks"
      description="No prep tasks are available for the selected kitchen."
    />

    <UAlert
      v-else
      color="neutral"
      variant="soft"
      title="Prep whiteboard unavailable"
      description="Switch to a writable test kitchen to toggle mise tasks."
    />
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useKitchenConsoleMise } from '../../../../../composables/fireux/console/kitchen/Operations/Mise/useKitchenConsoleMise'
import type { KitchenMiseTask } from '../../../../../models/kitchen-mise.model'

const { miseTasks, canToggleMise, toggleDone } = useKitchenConsoleMise()

const normalizeString = (value: unknown) => String(value ?? '').trim()
const statusRank = (task: KitchenMiseTask) => (isDone(task) ? 1 : 0)

const tasksSorted = computed(() =>
  [...miseTasks.value].sort((a, b) => {
    const doneDelta = statusRank(a) - statusRank(b)
    if (doneDelta !== 0) return doneDelta
    const titleDelta = taskDisplayTitle(a).localeCompare(taskDisplayTitle(b))
    if (titleDelta !== 0) return titleDelta
    return normalizeString(a.id).localeCompare(normalizeString(b.id))
  })
)

const isDone = (task: KitchenMiseTask) => {
  const source = task as Record<string, unknown>
  if (task.status === 'done') return true
  return Boolean(
    source.done ||
      source.checked ||
      source.complete ||
      source.completed
  )
}

const taskTitle = (task: KitchenMiseTask) =>
  normalizeString(task.title)

const taskDisplayTitle = (task: KitchenMiseTask) =>
  taskTitle(task) || 'Missing mise title'

const hasMissingTitle = (task: KitchenMiseTask) => !taskTitle(task)

const taskDescription = (task: KitchenMiseTask) =>
  normalizeString(task.description) || normalizeString(task.notes)
</script>
