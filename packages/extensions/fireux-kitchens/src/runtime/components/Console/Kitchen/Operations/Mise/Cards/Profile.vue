<template>
  <UCard>
    <div class="flex items-start gap-3">
      <UAvatar
        icon="i-lucide-list-checks"
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
            v-if="statusOption"
            size="xs"
            variant="soft"
            :color="statusOption.color"
            class="shrink-0"
          >
            {{ statusOption.label }}
          </UBadge>
        </div>

        <div class="console-summary-grid">
          <div class="console-summary-field">
            Station:
            <span class="console-summary-value">
              {{ summary?.station || 'Missing station' }}
            </span>
          </div>
          <div class="console-summary-field">
            Priority:
            <span class="console-summary-value">
              {{ kitchenMisePriorityLabel(summary?.priority) }}
            </span>
          </div>
          <div class="console-summary-field">
            Estimate:
            <span class="console-summary-value">
              {{
                summary?.estimatedMinutes
                  ? `${summary.estimatedMinutes} min`
                  : 'No estimate'
              }}
            </span>
          </div>
          <div class="console-summary-field">
            Service date:
            <span class="console-summary-value">
              {{ summary?.serviceDate || 'No service date' }}
            </span>
          </div>
          <div class="console-summary-field">
            Recipe:
            <span class="console-summary-value">
              {{ summary?.recipeId || 'No linked recipe' }}
            </span>
          </div>
          <div class="console-summary-field">
            Ingredients:
            <span class="console-summary-value">
              {{ summary?.ingredientCount || 0 }}
            </span>
          </div>
          <div class="console-summary-field">
            Prep items:
            <span class="console-summary-value">
              {{ summary?.prepItemCount || 0 }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  KITCHEN_MISE_STATUS_OPTIONS,
  kitchenMisePriorityLabel,
  type KitchenMiseTask,
} from '../../../../../../models/kitchen/mise.model'
import { projectKitchenMiseTask } from '../../../../../../models/kitchen/mise-presentation'

const props = defineProps<{
  task: KitchenMiseTask
}>()

const normalizeString = (value: unknown) => String(value ?? '').trim()
const summary = computed(() => projectKitchenMiseTask(props.task))
const title = computed(() => normalizeString(props.task.title))
const hasMissingTitle = computed(() => !title.value)
const displayTitle = computed(() => title.value || 'Missing mise title')
const description = computed(() => normalizeString(props.task.description))
const statusOption = computed(() =>
  KITCHEN_MISE_STATUS_OPTIONS.find(
    option => option.value === summary.value?.status
  )
)
</script>
