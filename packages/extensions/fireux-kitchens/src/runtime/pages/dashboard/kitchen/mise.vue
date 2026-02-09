<template>
  <UDashboardPanel id="dashboard-kitchen-mise">
    <template #header>
      <LayoutsDashboardNavbar title="Mise en Place" />
    </template>

    <template #body>
      <div class="panels-stack">
        <UAlert
          v-if="!runtimeKitchenId"
          icon="i-lucide-triangle-alert"
          color="warning"
          title="Select a kitchen first"
          description="Choose a runtime kitchen to manage mise en place tasks."
        />

        <template v-else>
          <UCard>
            <template #header>
              <div class="space-y-1">
                <div class="flex items-center justify-between gap-2">
                  <h2 class="text-base font-semibold">Mise en place board</h2>
                  <UBadge variant="soft" color="neutral">
                    {{ selectedKitchenName }}
                  </UBadge>
                </div>
                <p class="text-xs text-dimmed">
                  Mise en place tasks prepare ingredients and sub-recipes for service. Tasks can
                  reference ingredients, recipes, and other mise tasks.
                </p>
              </div>
            </template>

            <div class="flex flex-wrap gap-2">
              <UButton
                size="xs"
                variant="soft"
                color="neutral"
                icon="i-lucide-house"
                :to="homeRoute"
              >
                Back to kitchen home
              </UButton>
            </div>
          </UCard>

          <div class="grid gap-4 lg:grid-cols-2">
            <UCard>
              <template #header>
                <div class="space-y-1">
                  <div class="text-sm font-semibold">Create mise task</div>
                  <p class="text-xs text-dimmed">
                    Keep it lightweight: a title, station, and status is enough to start.
                  </p>
                </div>
              </template>

              <div class="space-y-3">
                <div>
                  <label class="text-xs font-semibold">Task title</label>
                  <UInput
                    v-model="form.title"
                    size="sm"
                    placeholder="Slice onions"
                  />
                </div>
                <div class="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label class="text-xs font-semibold">Station</label>
                    <UInput
                      v-model="form.station"
                      size="sm"
                      placeholder="Prep"
                    />
                  </div>
                  <div>
                    <label class="text-xs font-semibold">Service date</label>
                    <UInput
                      v-model="form.service_date"
                      size="sm"
                      placeholder="2026-02-09"
                    />
                  </div>
                </div>
                <div class="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label class="text-xs font-semibold">Status</label>
                    <USelect
                      v-model="form.status"
                      size="sm"
                      :options="statusOptions"
                    />
                  </div>
                  <div>
                    <label class="text-xs font-semibold">Priority</label>
                    <USelect
                      v-model="form.priority"
                      size="sm"
                      :options="priorityOptions"
                    />
                  </div>
                </div>
              </div>

              <div class="mt-4 flex flex-wrap justify-end gap-2">
                <UButton
                  variant="ghost"
                  color="neutral"
                  :disabled="isCreating"
                  @click="resetForm"
                >
                  Clear
                </UButton>
                <UButton
                  color="primary"
                  :loading="isCreating"
                  @click="handleCreate"
                >
                  Add mise task
                </UButton>
              </div>
            </UCard>

            <UCard>
              <template #header>
                <div class="flex items-center justify-between gap-2">
                  <div class="text-sm font-semibold">Today’s prep list</div>
                  <UBadge variant="soft">{{ miseTasks.length }}</UBadge>
                </div>
              </template>

              <div v-if="sortedMiseTasks.length" class="space-y-2 text-sm">
                <div
                  v-for="task in sortedMiseTasks"
                  :key="task.id"
                  class="rounded-md border border-default p-3"
                >
                  <div class="flex items-start justify-between gap-3">
                    <div class="space-y-1">
                      <p class="font-medium">{{ task.title || task.id }}</p>
                      <div class="flex flex-wrap items-center gap-2 text-xs text-dimmed">
                        <span>Status: {{ task.status }}</span>
                        <span>Priority: {{ task.priority }}</span>
                        <span>Station: {{ task.station || 'n/a' }}</span>
                        <span v-if="task.service_date">Date: {{ task.service_date }}</span>
                      </div>
                      <p v-if="task.ingredient_ids?.length" class="text-xs text-dimmed">
                        Ingredients: {{ ingredientLabels(task.ingredient_ids) }}
                      </p>
                      <p v-if="task.recipe_id" class="text-xs text-dimmed">
                        Recipe: {{ task.recipe_id }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <p v-else class="text-sm text-dimmed">
                No mise tasks yet. Add one to get started.
              </p>
            </UCard>
          </div>
        </template>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify'
import { computed, ref } from 'vue'
import { useKitchenDashboardSelection } from '../../../composables/fireux/app/useKitchenDashboardSelection'
import { useIngredientFetch } from '../../../composables/fireux/firestore/objects/ingredient/fetch/useIngredientFetch'
import { useKitchenMenuStackFetch } from '../../../composables/fireux/firestore/objects/kitchen/fetch/useKitchenMenuStackFetch'
import { useKitchenMiseCreate } from '../../../composables/fireux/firestore/objects/mise/mutations/useKitchenMiseCreate'
import type { KitchenMisePriority, KitchenMiseStatus } from '../../../models/objects/kitchen-mise.model'

definePageMeta({
  layout: 'kitchen-dashboard',
  nav: {
    key: 'dashboard-kitchen-mise',
    label: 'Mise en place',
    icon: 'i-lucide-clipboard-check',
    order: 16,
    desktop: true,
    mobile: true,
    layouts: ['kitchen-dashboard'],
  },
  requiresAuth: true,
})

const { runtimeKitchenId, selectedKitchen, dashboardQuery } = useKitchenDashboardSelection()
const { miseTasks } = useKitchenMenuStackFetch(runtimeKitchenId)
const { createKitchenMiseTask } = useKitchenMiseCreate()
const { ingredients } = useIngredientFetch()
const toast = useToastify()

const statusOptions = [
  { label: 'To do', value: 'todo' },
  { label: 'In progress', value: 'in_progress' },
  { label: 'Done', value: 'done' },
  { label: 'Blocked', value: 'blocked' },
]

const priorityOptions = [
  { label: 'Low', value: 'low' },
  { label: 'Normal', value: 'normal' },
  { label: 'High', value: 'high' },
  { label: 'Urgent', value: 'urgent' },
]

const form = ref({
  title: '',
  station: '',
  service_date: '',
  status: 'todo' as KitchenMiseStatus,
  priority: 'normal' as KitchenMisePriority,
})

const isCreating = ref(false)

const selectedKitchenName = computed(() =>
  String(selectedKitchen.value?.name || selectedKitchen.value?.short_name || runtimeKitchenId.value)
)

const homeRoute = computed(() =>
  dashboardQuery.value
    ? {
        path: '/dashboard/kitchen',
        query: dashboardQuery.value,
      }
    : '/dashboard/kitchen'
)

const ingredientNameById = computed(() => {
  const map = new Map<string, string>()
  for (const ingredient of ingredients.value ?? []) {
    const id = String(ingredient.id || '').trim()
    if (!id) continue
    map.set(id, String(ingredient.name || id))
  }
  return map
})

const ingredientLabels = (ids: string[]) =>
  ids
    .map((id) => ingredientNameById.value.get(String(id || '').trim()) || id)
    .filter(Boolean)
    .join(', ')

const sortedMiseTasks = computed(() =>
  [...(miseTasks.value ?? [])].sort((a, b) =>
    String(a.title || a.id || '').localeCompare(String(b.title || b.id || ''))
  )
)

const resetForm = () => {
  form.value = {
    title: '',
    station: '',
    service_date: '',
    status: 'todo',
    priority: 'normal',
  }
}

const handleCreate = async () => {
  if (!runtimeKitchenId.value) {
    toast.warn('Select a kitchen first')
    return
  }

  if (isCreating.value) return
  isCreating.value = true

  try {
    await createKitchenMiseTask(runtimeKitchenId.value, {
      title: form.value.title,
      station: form.value.station,
      service_date: form.value.service_date,
      status: form.value.status,
      priority: form.value.priority,
    })
    toast.success('Mise task added')
    resetForm()
  } catch (error: any) {
    toast.error(String(error?.message || 'Failed to add mise task'))
  } finally {
    isCreating.value = false
  }
}
</script>
