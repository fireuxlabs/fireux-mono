<template>
  <UDashboardPanel id="console-portfolio-tasks">
    <template #header>
      <LayoutsConsoleNavbar title="Tasks" />
    </template>

    <template #body>
      <section class="space-y-6">
        <UAlert
          v-if="!runtimeId"
          color="warning"
          variant="soft"
          title="No portfolio selected"
          description="Select a portfolio on /console/portfolio/overview before using tasks."
          :actions="[{ label: 'Go to portfolios', to: '/console/portfolio/overview', icon: 'i-lucide-arrow-right' }]"
        />

        <template v-else>
          <UCard>
            <div class="flex items-start gap-4">
              <div class="space-y-1">
                <div class="text-sm font-semibold">Task tracker</div>
                <div class="text-xs text-dimmed">
                  Mode: <span class="font-medium">{{ runtimeMode }}</span>
                  · Source: <code>portfolios/{{ runtimeId }}/tasks</code>
                </div>
              </div>
            </div>
          </UCard>

          <UCard>
            <div class="grid gap-3 sm:grid-cols-3">
              <div class="rounded border border-default p-3">
                <div class="text-xs text-dimmed">Open</div>
                <div class="text-xl font-semibold">{{ summary.open }}</div>
              </div>
              <div class="rounded border border-default p-3">
                <div class="text-xs text-dimmed">In progress</div>
                <div class="text-xl font-semibold">{{ summary.inProgress }}</div>
              </div>
              <div class="rounded border border-default p-3">
                <div class="text-xs text-dimmed">Done</div>
                <div class="text-xl font-semibold">{{ summary.done }}</div>
              </div>
            </div>
          </UCard>

          <UCard v-if="!isReadOnly">
            <template #header>
              <div class="text-sm font-semibold">Create task</div>
            </template>

            <div class="grid gap-3 sm:grid-cols-2">
              <UInput v-model="newTaskTitle" :disabled="isReadOnly" placeholder="Task title" />
              <UInput v-model="newTaskDueDate" :disabled="isReadOnly" placeholder="Due date (YYYY-MM-DD)" />
              <UInput v-model="newTaskDescription" :disabled="isReadOnly" placeholder="Description" class="sm:col-span-2" />
            </div>

            <div class="mt-3">
              <UButton
                size="sm"
                icon="i-lucide-plus"
                :disabled="isReadOnly || !newTaskTitle.trim() || createBusy"
                :loading="createBusy"
                @click="createManualTask"
              >
                Create task
              </UButton>
            </div>
          </UCard>

          <UCard>
            <template #header>
              <div class="text-sm font-semibold">Task list</div>
            </template>

            <div v-if="cards.length" class="space-y-3">
              <div
                v-for="item in cards"
                :key="item.id"
                class="rounded border border-default p-3"
              >
                <div class="flex items-start justify-between gap-3">
                  <div class="space-y-1">
                    <div class="text-sm font-semibold">{{ item.title }}</div>
                    <div class="text-xs text-dimmed">{{ item.subtitle }}</div>
                  </div>

                  <div class="flex items-center gap-2">
                    <UBadge :color="statusColor(item.status)" variant="soft">
                      {{ item.status }}
                    </UBadge>

                    <div v-if="!isReadOnly" class="flex gap-1">
                      <UButton size="xs" variant="ghost" :disabled="isReadOnly" @click="setStatus(item.id, 'open')">Open</UButton>
                      <UButton size="xs" variant="ghost" :disabled="isReadOnly" @click="setStatus(item.id, 'in_progress')">In progress</UButton>
                      <UButton size="xs" variant="ghost" :disabled="isReadOnly" @click="setStatus(item.id, 'done')">Done</UButton>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <UAlert
              v-else
              color="neutral"
              variant="soft"
              title="No tasks"
              description="Create tasks manually or from compliance/documents workflows."
            />
          </UCard>
        </template>
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { useRuntimePortfolio } from 'fireux-properties/runtime/composables/fireux/app/portfolio-runtime/useRuntimePortfolio'
import { computed, ref } from 'vue'
import { usePortfolioTaskCollection } from '../../../composables/fireux/firestore/tasks/fetch/usePortfolioTaskCollection'
import { useTaskCreate } from '../../../composables/fireux/firestore/tasks/mutations/useTaskCreate'
import { useTaskUpdate } from '../../../composables/fireux/firestore/tasks/mutations/useTaskUpdate'
import { useTaskInterface } from '../../../composables/fireux/firestore/tasks/utils/view/useTaskInterface'
import type { Task } from '../../../models/task.model'

definePageMeta({
  layout: 'console',
  nav: {
    visibility: { modules: ['fireux-tasks'] },
    key: 'console-portfolio-tasks',
    label: 'Tasks',
    icon: 'i-lucide-list-checks',
    order: 50,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})

const runtimePortfolio = useRuntimePortfolio()
const runtimeId = computed(() => runtimePortfolio.id.value)
const runtimeMode = computed(() => runtimePortfolio.mode.value)
const isReadOnly = computed(() => runtimePortfolio.isReadOnly.value)

const { collection } = usePortfolioTaskCollection(runtimePortfolio)
const { createTask } = useTaskCreate(runtimePortfolio)
const { updateTask } = useTaskUpdate(runtimePortfolio)
const { card } = useTaskInterface()

const cards = computed(() =>
  collection.value
    .map((entry) => card(entry))
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
)

const summary = computed(() => {
  const totals = {
    open: 0,
    inProgress: 0,
    done: 0,
  }

  for (const task of collection.value) {
    if (task.status === 'open') totals.open += 1
    if (task.status === 'in_progress') totals.inProgress += 1
    if (task.status === 'done') totals.done += 1
  }

  return totals
})

const newTaskTitle = ref('')
const newTaskDescription = ref('')
const newTaskDueDate = ref('')
const createBusy = ref(false)

const statusColor = (status: Task['status']) => {
  if (status === 'open') return 'warning'
  if (status === 'in_progress') return 'info'
  return 'success'
}

const createManualTask = async () => {
  if (isReadOnly.value) return

  createBusy.value = true
  try {
    await createTask({
      title: newTaskTitle.value,
      description: newTaskDescription.value,
      status: 'open',
      source: 'manual',
      due_date: newTaskDueDate.value,
      linked_entity_type: '',
      linked_entity_id: '',
    })

    newTaskTitle.value = ''
    newTaskDescription.value = ''
    newTaskDueDate.value = ''
  } finally {
    createBusy.value = false
  }
}

const setStatus = async (taskId: string, status: Task['status']) => {
  if (isReadOnly.value) return
  await updateTask(taskId, { status })
}
</script>
