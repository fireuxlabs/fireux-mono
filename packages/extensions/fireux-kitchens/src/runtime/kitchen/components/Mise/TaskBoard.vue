<template>
  <UAccordion
    type="multiple"
    :items="workflowGroups"
    :default-value="defaultOpenStages"
    :unmount-on-hide="false"
    class="space-y-2"
    :ui="{
      trigger: 'py-2',
      body: 'pb-4',
    }"
  >
    <template #default="{ item: group }">
      <div
        :data-mise-workflow-stage="group.value"
        class="flex min-w-0 flex-1 items-center gap-2"
      >
        <UIcon
          :name="group.icon"
          class="size-4 shrink-0 text-muted"
          aria-hidden="true"
        />
        <span
          :id="`${headingId}-${group.value}`"
          class="truncate text-sm font-semibold text-highlighted"
        >
          {{ group.label }}
        </span>
        <UBadge color="neutral" variant="soft" size="xs">
          {{ group.tasks.length }}
        </UBadge>
      </div>
    </template>

    <template #body="{ item: group }">
      <div
        class="kitchen-mise-task-grid grid gap-2"
        :aria-labelledby="`${headingId}-${group.value}`"
      >
        <MoleculesActionSurface
          v-for="task in group.tasks"
          :key="task.id"
          :to="taskRoute(task.id)"
          :data-mise-task-id="task.id"
          :data-mise-status="task.status"
          class="group rounded-xl border border-default bg-default p-3 shadow-sm transition"
          :class="
            linkBase
              ? 'hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md'
              : ''
          "
        >
          <div class="flex items-start gap-3">
            <span
              class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-elevated text-muted"
            >
              <UIcon
                :name="statusOption(task.status).icon"
                class="size-4"
                aria-hidden="true"
              />
            </span>

            <div class="min-w-0 flex-1">
              <h4
                class="text-sm font-semibold text-highlighted"
                :class="task.status === 'done' ? 'line-through opacity-70' : ''"
              >
                {{ task.title }}
              </h4>
              <p
                v-if="task.description"
                class="mt-1 line-clamp-2 text-xs text-dimmed"
              >
                {{ task.description }}
              </p>
            </div>

            <UIcon
              v-if="linkBase"
              name="i-lucide-chevron-right"
              class="size-4 shrink-0 text-muted transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </div>

          <div
            v-if="task.checklist.length"
            class="mt-3 space-y-1.5 rounded-lg bg-elevated/70 p-2.5"
          >
            <div class="flex items-center justify-between gap-2">
              <p class="text-xs font-semibold uppercase tracking-wide text-muted">
                Checklist
              </p>
              <span class="text-xs text-dimmed">
                {{ task.checklistDoneCount }}/{{ task.checklist.length }}
              </span>
            </div>
            <div
              v-for="item in task.checklist"
              :key="item.id"
              class="flex items-start gap-2 text-xs"
              :class="item.done ? 'text-dimmed' : 'text-toned'"
            >
              <UIcon
                :name="
                  item.done
                    ? 'i-lucide-circle-check'
                    : 'i-lucide-circle'
                "
                class="mt-0.5 size-3.5 shrink-0"
                :class="item.done ? 'text-success' : 'text-muted'"
                aria-hidden="true"
              />
              <span :class="item.done ? 'line-through' : ''">
                {{ item.label }}
              </span>
            </div>
          </div>

          <div class="mt-3 flex flex-wrap items-center gap-2">
            <UBadge
              :color="statusOption(task.status).color"
              variant="soft"
              size="xs"
            >
              {{ statusOption(task.status).label }}
            </UBadge>
            <span
              v-if="task.station"
              class="inline-flex items-center gap-1 text-xs text-dimmed"
            >
              <UIcon name="i-lucide-map-pinned" class="size-3.5" />
              {{ task.station }}
            </span>
            <span
              v-if="task.estimatedMinutes"
              class="inline-flex items-center gap-1 text-xs text-dimmed"
            >
              <UIcon name="i-lucide-clock-3" class="size-3.5" />
              {{ task.estimatedMinutes }} min
            </span>
            <span
              v-if="task.serviceDate"
              class="inline-flex items-center gap-1 text-xs text-dimmed"
            >
              <UIcon name="i-lucide-calendar-days" class="size-3.5" />
              {{ task.serviceDate }}
            </span>
            <UBadge
              :color="kitchenMisePriorityColor(task.priority)"
              variant="soft"
              size="xs"
            >
              {{ kitchenMisePriorityLabel(task.priority) }}
            </UBadge>
            <UBadge
              v-if="task.recipeId"
              color="neutral"
              variant="outline"
              size="xs"
            >
              Recipe
            </UBadge>
            <UBadge
              v-if="task.prepItemCount"
              color="neutral"
              variant="outline"
              size="xs"
            >
              {{ task.prepItemCount }} prep
              {{ task.prepItemCount === 1 ? 'item' : 'items' }}
            </UBadge>
            <UBadge
              v-if="task.ingredientCount"
              color="neutral"
              variant="outline"
              size="xs"
            >
              {{ task.ingredientCount }}
              {{ task.ingredientCount === 1 ? 'ingredient' : 'ingredients' }}
            </UBadge>
          </div>
        </MoleculesActionSurface>
      </div>
    </template>
  </UAccordion>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  groupKitchenMiseTaskSummariesByWorkflow,
  kitchenMisePriorityColor,
  type KitchenMiseTaskSummary,
} from '../../models/mise-presentation'
import {
  KITCHEN_MISE_STATUS_OPTIONS,
  kitchenMisePriorityLabel,
  normalizeKitchenMiseStatus,
  type KitchenMiseStatus,
} from '../../models/mise.model.ts'

const props = withDefaults(
  defineProps<{
    headingId?: string
    linkBase?: string
    tasks: KitchenMiseTaskSummary[]
  }>(),
  {
    headingId: 'kitchen-mise-status',
    linkBase: '',
  }
)

const workflowGroups = computed(() =>
  groupKitchenMiseTaskSummariesByWorkflow(props.tasks)
)
const defaultOpenStages = computed(() =>
  workflowGroups.value.slice(0, 2).map(group => group.value)
)
const statusOption = (status: KitchenMiseStatus) =>
  KITCHEN_MISE_STATUS_OPTIONS.find(
    option => option.value === normalizeKitchenMiseStatus(status)
  ) ?? KITCHEN_MISE_STATUS_OPTIONS[0]
const taskRoute = (taskId: string) =>
  props.linkBase
    ? `${props.linkBase}/${encodeURIComponent(taskId)}`
    : undefined
</script>

<style scoped>
.kitchen-mise-task-grid {
  grid-template-columns: repeat(
    auto-fit,
    minmax(min(100%, 14rem), 1fr)
  );
}
</style>
