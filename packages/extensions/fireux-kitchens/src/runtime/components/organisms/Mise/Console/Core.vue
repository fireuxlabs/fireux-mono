<template>
  <UCard>
    <template #header>
      <div class="console-card-header">
        <div class="console-card-header__title">Prep Whiteboard</div>
        <p class="console-card-header__description">
          Simple done / not done view for service prep.
        </p>
      </div>
    </template>

    <div v-if="tasksSorted.length" class="space-y-2">
      <button
        v-for="task in tasksSorted"
        :key="task.id || task.title"
        type="button"
        class="flex w-full items-start gap-3 rounded-lg border border-default bg-default p-3 text-left transition"
        :class="[
          isDone(task) ? 'opacity-60' : '',
          canWrite ? 'hover:bg-elevated/60' : 'cursor-default',
        ]"
        :disabled="!canWrite"
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
            {{ taskTitle(task) }}
          </span>
          <span v-if="taskDescription(task)" class="block text-xs text-dimmed">
            {{ taskDescription(task) }}
          </span>
        </span>

        <UBadge
          v-if="!canWrite"
          color="neutral"
          variant="soft"
          size="xs"
          class="shrink-0"
        >
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
import type { KitchenMiseTask } from '../../../../models/kitchen-mise.model'

const props = withDefaults(
  defineProps<{
    collection?: KitchenMiseTask[]
    canWrite?: boolean
  }>(),
  {
    collection: () => [],
    canWrite: false,
  }
)
const emit = defineEmits<{
  (event: 'toggle-done', task: KitchenMiseTask): void
}>()

const normalizeString = (value: unknown) => String(value ?? '').trim()
const statusRank = (task: KitchenMiseTask) => (isDone(task) ? 1 : 0)

const tasksSorted = computed(() =>
  [...props.collection].sort((a, b) => {
    const doneDelta = statusRank(a) - statusRank(b)
    if (doneDelta !== 0) return doneDelta
    return taskTitle(a).localeCompare(taskTitle(b))
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
  normalizeString(task.title) || normalizeString(task.id) || 'Untitled mise'

const taskDescription = (task: KitchenMiseTask) =>
  normalizeString(task.description) || normalizeString(task.notes)

const toggleDone = (task: KitchenMiseTask) => {
  if (!props.canWrite) return
  emit('toggle-done', task)
}
</script>
