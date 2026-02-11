<template>
  <UDashboardPanel id="dashboard-kitchen-mise">
    <template #header>
      <LayoutsDashboardNavbar title="Mise en Place" />
    </template>

    <template #body>
      <div class="space-y-6">
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
                Lumen prep list for the burger board.
              </p>
            </div>
          </template>
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
            No mise tasks yet.
          </p>
        </UCard>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { dummyKitchenScenario } from '../../../../../../../../dummy/scenario'
import { useRuntimeKitchen } from '../../../composables/fireux/app/useRuntimeKitchen'

definePageMeta({
  layout: 'kitchen-dashboard',
  nav: {
    key: 'dashboard-kitchen-mise',
    label: 'Mise en place',
    icon: 'i-lucide-clipboard-check',
    order: 2,
    desktop: true,
    mobile: true,
    layouts: ['kitchen-dashboard'],
  },
  requiresAuth: true,
})

const runtimeKitchen = useRuntimeKitchen()
const runtimeKitchenId = computed(() => String(runtimeKitchen.value?.id || '').trim())
const selectedKitchenName = computed(
  () => String(runtimeKitchen.value?.name || runtimeKitchenId.value)
)

const miseTasks = ref([...dummyKitchenScenario.menuStack.miseTasks])

const ingredientNameById = computed(() => {
  const map = new Map<string, string>()
  for (const ingredient of dummyKitchenScenario.globalIngredients ?? []) {
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
</script>
