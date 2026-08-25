<template>
  <UCard>
    <template #header>
      <div class="workspace-card-header">
        <div class="workspace-card-header__title">Prep Whiteboard</div>
        <p class="workspace-card-header__description">
          Simple done / not done view for service prep.
        </p>
      </div>
    </template>

    <div v-if="tasksSorted.length" class="space-y-2">
      <button
        v-for="task in tasksSorted"
        :key="task.id || task.title"
        type="button"
        class="flex w-full cursor-default items-start gap-3 rounded-lg border border-default bg-default p-3 text-left"
        :class="isDone(task) ? 'opacity-60' : ''"
        disabled
      >
        <span
          class="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded border"
          :class="
            isDone(task)
              ? 'border-primary bg-primary text-inverted'
              : 'border-default text-dimmed'
          "
        >
          <UIcon v-if="isDone(task)" name="i-lucide-check" class="size-3.5" />
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

        <UBadge color="neutral" variant="soft" size="xs" class="shrink-0">
          Read only
        </UBadge>
      </button>
    </div>

    <UAlert
      v-else
      color="neutral"
      variant="soft"
      title="No mise tasks"
      description="No prep tasks are available for the selected kitchen."
    />
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { KitchenMiseTask } from '../../../utils/mise.ts'

const props = withDefaults(
  defineProps<{
    collection?: KitchenMiseTask[]
  }>(),
  {
    collection: () => [],
  }
)

const normalizeString = (value: unknown) => String(value ?? '').trim()
const statusRank = (task: KitchenMiseTask) => (isDone(task) ? 1 : 0)

const tasksSorted = computed(() =>
  [...props.collection].sort((a, b) => {
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
    source.done || source.checked || source.complete || source.completed
  )
}

const taskTitle = (task: KitchenMiseTask) => normalizeString(task.title)

const taskDisplayTitle = (task: KitchenMiseTask) =>
  taskTitle(task) || 'Missing mise title'

const hasMissingTitle = (task: KitchenMiseTask) => !taskTitle(task)

const taskDescription = (task: KitchenMiseTask) =>
  normalizeString(task.description) || normalizeString(task.notes)
</script>
