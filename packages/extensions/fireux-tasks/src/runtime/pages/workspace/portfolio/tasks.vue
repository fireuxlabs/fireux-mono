<!-- Concurrent edit — 2026-07-20 16:19 CEST — Extension Workspace Spine pass: move workspace access metadata to the route and classify its surface. -->
<!-- Concurrent edit — 2026-07-20 16:15 CEST — Workspace Spine pass: gate task controls with Portfolio write authority. -->
<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="workspace-portfolio-tasks">
      <template #header>
        <LayoutsWorkspaceNavbar title="Tasks" />
      </template>

      <template #body>
        <section class="space-y-6">
          <MoleculesCopyError v-if="writeError" :message="writeError" />
          <UCard>
            <div class="flex items-start gap-4">
              <div class="space-y-1">
                <div class="text-sm font-semibold">Task tracker</div>
                <div class="text-xs text-dimmed">
                  Source: <span class="font-medium">live</span> ·
                  <code>{{ tasksPath }}</code>
                </div>
              </div>
            </div>
          </UCard>

          <UCard>
            <div class="grid gap-3 sm:grid-cols-3">
              <div class="fx-inset-panel">
                <div class="text-xs text-dimmed">Open</div>
                <div class="text-xl font-semibold">{{ summary.open }}</div>
              </div>
              <div class="fx-inset-panel">
                <div class="text-xs text-dimmed">In progress</div>
                <div class="text-xl font-semibold">
                  {{ summary.inProgress }}
                </div>
              </div>
              <div class="fx-inset-panel">
                <div class="text-xs text-dimmed">Done</div>
                <div class="text-xl font-semibold">{{ summary.done }}</div>
              </div>
            </div>
          </UCard>

          <UCard v-if="canWrite">
            <template #header>
              <div class="text-sm font-semibold">Create task</div>
            </template>

            <div class="grid gap-3 sm:grid-cols-2">
              <UInput
                v-model="newTaskTitle"
                :disabled="!canWrite"
                placeholder="Task title"
              />
              <UInput
                v-model="newTaskDueDate"
                :disabled="!canWrite"
                placeholder="Due date (YYYY-MM-DD)"
              />
              <UInput
                v-model="newTaskDescription"
                :disabled="!canWrite"
                placeholder="Description"
                class="sm:col-span-2"
              />
            </div>

            <div class="mt-3">
              <UButton
                size="sm"
                icon="i-lucide-plus"
                :disabled="!canWrite || !newTaskTitle.trim() || createBusy"
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
              <div v-for="item in cards" :key="item.id" class="fx-inset-panel">
                <div class="flex items-start justify-between gap-3">
                  <div class="space-y-1">
                    <div class="text-sm font-semibold">{{ item.title }}</div>
                    <div class="text-xs text-dimmed">{{ item.subtitle }}</div>
                  </div>

                  <div class="flex items-center gap-2">
                    <UBadge :color="statusColor(item.status)" variant="soft">
                      {{ item.status }}
                    </UBadge>

                    <div v-if="canWrite" class="flex gap-1">
                      <UButton
                        size="xs"
                        variant="ghost"
                        :disabled="!canWrite"
                        @click="setStatus(item.id, 'open')"
                        >Open</UButton
                      >
                      <UButton
                        size="xs"
                        variant="ghost"
                        :disabled="!canWrite"
                        @click="setStatus(item.id, 'in_progress')"
                        >In progress</UButton
                      >
                      <UButton
                        size="xs"
                        variant="ghost"
                        :disabled="!canWrite"
                        @click="setStatus(item.id, 'done')"
                        >Done</UButton
                      >
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
        </section>
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
import {
  useActivePortfolio,
  usePortfolioWorkspaceChildPath,
} from 'fireux-properties/runtime/portfolio/composables/workspace/useActivePortfolio'
import { computed, ref } from 'vue'
import { useTaskScope } from '../../../portfolio/composables/useTaskScope'
import { usePortfolioTaskCollection } from '../../../portfolio/composables/usePortfolioTaskCollection'
import { useTaskCreate } from '../../../portfolio/composables/tasks/useTaskCreate'
import { useTaskUpdate } from '../../../portfolio/composables/tasks/useTaskUpdate'
import { useTaskInterface } from '../../../portfolio/composables/tasks/useTaskInterface'
import { TaskStorage, type Task } from '../../../portfolio/models/task.model.ts'

definePageMeta({
  layout: 'workspace',
  workspaceSurface: 'browse',
  visibility: { modules: ['fireux-tasks'] },
  nav: {
    key: 'workspace-portfolio-tasks',
    label: 'Tasks',
    icon: 'i-lucide-list-checks',
    position: 'top',
    order: 50,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
  },
  requiresAuth: true,
  requiresSelection: true,
})

const runtimePortfolio = useActivePortfolio()
const canWrite = computed(() => runtimePortfolio.canWrite.value)
const tasksPath = usePortfolioWorkspaceChildPath(
  runtimePortfolio,
  TaskStorage.collection
)

const { collection } = usePortfolioTaskCollection(runtimePortfolio)
const { createTask } = useTaskCreate(runtimePortfolio)
const { updateTask } = useTaskUpdate(runtimePortfolio)
const { pill: taskInterface } = useTaskInterface()

const cards = computed(() =>
  collection.value
    .map((entry) => taskInterface(entry))
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
const writeError = ref('')
const captureScope = useTaskScope(runtimePortfolio, () => {
  createBusy.value = false; writeError.value = ''
  newTaskTitle.value = ''; newTaskDescription.value = ''; newTaskDueDate.value = ''
})

const statusColor = (status: Task['status']) => {
  if (status === 'open') return 'warning'
  if (status === 'in_progress') return 'info'
  return 'success'
}

const createManualTask = async () => {
  if (!canWrite.value || createBusy.value) return
  const isCurrent = captureScope()
  writeError.value = ''
  createBusy.value = true
  const draft = {
    title: newTaskTitle.value,
    description: newTaskDescription.value,
    status: 'open' as const,
    source: 'manual' as const,
    due_date: newTaskDueDate.value,
    linked_entity_type: '',
    linked_entity_id: '',
  }
  try {
    await createTask(draft)
    if (!isCurrent()) return
    if (newTaskTitle.value === draft.title && newTaskDescription.value === draft.description && newTaskDueDate.value === draft.due_date) {
      newTaskTitle.value = ''
      newTaskDescription.value = ''
      newTaskDueDate.value = ''
    }
  } catch (error) {
    if (isCurrent()) writeError.value = error instanceof Error ? error.message : String(error)
  } finally {
    if (isCurrent()) createBusy.value = false
  }
}

const setStatus = async (taskId: string, status: Task['status']) => {
  if (!canWrite.value) return
  const isCurrent = captureScope()
  writeError.value = ''
  try { await updateTask({ taskId, changes: { status } }) }
  catch (error) { if (isCurrent()) writeError.value = error instanceof Error ? error.message : String(error) }
}
</script>
