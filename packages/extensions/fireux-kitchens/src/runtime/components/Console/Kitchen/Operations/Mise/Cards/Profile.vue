<template>
  <UCard>
    <div class="flex items-start gap-3">
      <UAvatar
        :src="imageUrl || undefined"
        :icon="icon"
        size="md"
      />

      <div class="min-w-0 flex-1 space-y-4">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0 space-y-1">
            <h2 class="truncate text-base font-semibold text-highlighted">
              {{ displayTitle }}
            </h2>
            <UBadge
              v-if="hasMissingTitle"
              color="error"
              variant="soft"
              size="xs"
            >
              Missing title
            </UBadge>
            <p v-if="description" class="text-sm text-dimmed">
              {{ description }}
            </p>
          </div>

          <UBadge
            v-if="status"
            size="xs"
            variant="soft"
            color="neutral"
            class="shrink-0"
          >
            {{ status }}
          </UBadge>
        </div>

        <div class="console-summary-grid">
          <div class="console-summary-field">
            Type:
            <span class="console-summary-value">{{ typeLabel || 'Missing type' }}</span>
          </div>
          <div class="console-summary-field">
            Station:
            <span class="console-summary-value">{{ station || 'Missing station' }}</span>
          </div>
          <div class="console-summary-field">
            Recipe:
            <span class="console-summary-value">{{ recipeId || 'No linked recipe' }}</span>
          </div>
          <div class="console-summary-field">
            Status:
            <span class="console-summary-value">{{ status || 'Missing status' }}</span>
          </div>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { KitchenMiseTask } from '../../../../../../models/kitchen/mise.model'

const props = defineProps<{
  task: KitchenMiseTask
}>()

const normalizeString = (value: unknown) => String(value ?? '').trim()
const taskRecord = computed(() => props.task as Record<string, unknown>)
const title = computed(() => normalizeString(props.task.title))
const hasMissingTitle = computed(() => !title.value)
const displayTitle = computed(() => title.value || 'Missing mise title')
const description = computed(() => normalizeString(props.task.description))
const status = computed(() => normalizeString(props.task.status))
const station = computed(() =>
  [
    props.task.station,
    taskRecord.value.station_id,
    taskRecord.value.station_name,
    taskRecord.value.responsibility,
    taskRecord.value.responsible_station,
  ]
    .map((value) => normalizeString(value))
    .find(Boolean) || ''
)
const typeLabel = computed(() =>
  [
    taskRecord.value.type,
    taskRecord.value.category,
    taskRecord.value.kind,
    taskRecord.value.task_type,
  ]
    .map((value) => normalizeString(value))
    .find(Boolean) || ''
)
const recipeId = computed(() => normalizeString(props.task.recipe_id))
const imageUrl = computed(() => normalizeString((props.task as any).image_url))
const icon = computed(() => {
  const kind = typeLabel.value.toLowerCase()
  if (/^(food|mise|food_mise|prep|component)$/.test(kind)) {
    return 'i-lucide-utensils'
  }
  return 'i-lucide-list-checks'
})
</script>
