<template>
  <UDashboardPanel id="dashboard-kitchen-menu">
    <template #header>
      <LayoutsDashboardNavbar title="Menu Stack" />
    </template>

    <template #body>
      <div class="panels-stack">
        <UAlert
          v-if="!runtimeKitchenId"
          icon="i-lucide-triangle-alert"
          color="warning"
          title="Select a kitchen first"
          description="Open /kitchens and select a runtime kitchen before creating menu data."
        />

        <template v-else>
          <UCard>
            <template #header>
              <div class="space-y-1">
                <div class="flex items-center justify-between gap-2">
                  <h2 class="text-base font-semibold">Starter menu builder</h2>
                  <UBadge variant="soft" color="neutral">
                    {{ selectedKitchenName }}
                  </UBadge>
                </div>
                <p class="text-xs text-dimmed">
                  Create one menu, three dishes, linked recipes, and mise en place tasks from your
                  current global ingredients.
                </p>
              </div>
            </template>

            <div class="flex flex-wrap items-center gap-2">
              <UButton
                :loading="isSeeding"
                color="primary"
                icon="i-lucide-wand-sparkles"
                @click="handleSeed"
              >
                Seed starter menu stack
              </UButton>
              <UButton
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
                <div class="flex items-center justify-between gap-2">
                  <div class="text-sm font-semibold">Menus</div>
                  <UBadge variant="soft">{{ counts.menus }}</UBadge>
                </div>
              </template>

              <div v-if="menus.length" class="space-y-2 text-sm">
                <div
                  v-for="menu in menus"
                  :key="menu.id"
                  class="rounded-md border border-default p-2"
                >
                  <p class="font-medium">{{ menu.name || menu.id }}</p>
                  <p class="text-xs text-dimmed">{{ menu.description || 'No description' }}</p>
                  <div class="mt-1 flex flex-wrap items-center gap-2 text-xs text-dimmed">
                    <span>Status: {{ menu.status }}</span>
                    <span>Service: {{ menu.service }}</span>
                    <span>Dishes: {{ menu.dish_ids?.length ?? 0 }}</span>
                  </div>
                </div>
              </div>
              <p v-else class="text-sm text-dimmed">
                No menus yet.
              </p>
            </UCard>

            <UCard>
              <template #header>
                <div class="flex items-center justify-between gap-2">
                  <div class="text-sm font-semibold">Dishes</div>
                  <UBadge variant="soft">{{ counts.dishes }}</UBadge>
                </div>
              </template>

              <div v-if="dishes.length" class="space-y-2 text-sm">
                <div
                  v-for="dish in dishesSorted"
                  :key="dish.id"
                  class="rounded-md border border-default p-2"
                >
                  <p class="font-medium">{{ dish.name || dish.id }}</p>
                  <p class="text-xs text-dimmed">{{ dish.description || 'No description' }}</p>
                  <div class="mt-1 flex flex-wrap items-center gap-2 text-xs text-dimmed">
                    <span>Station: {{ dish.station || 'n/a' }}</span>
                    <span>Course: {{ dish.course || 'n/a' }}</span>
                    <span>Recipe: {{ dish.recipe_id || 'n/a' }}</span>
                  </div>
                </div>
              </div>
              <p v-else class="text-sm text-dimmed">
                No dishes yet.
              </p>
            </UCard>

            <UCard>
              <template #header>
                <div class="flex items-center justify-between gap-2">
                  <div class="text-sm font-semibold">Recipes</div>
                  <UBadge variant="soft">{{ counts.recipes }}</UBadge>
                </div>
              </template>

              <div v-if="recipes.length" class="space-y-2 text-sm">
                <div
                  v-for="recipe in recipes"
                  :key="recipe.id"
                  class="rounded-md border border-default p-2"
                >
                  <p class="font-medium">{{ recipe.name || recipe.id }}</p>
                  <div class="mt-1 flex flex-wrap items-center gap-2 text-xs text-dimmed">
                    <span>Lines: {{ recipe.ingredient_lines?.length ?? 0 }}</span>
                    <span>Steps: {{ recipe.steps?.length ?? 0 }}</span>
                    <span>Yield: {{ recipe.yield_qty }} {{ recipe.yield_unit }}</span>
                  </div>
                </div>
              </div>
              <p v-else class="text-sm text-dimmed">
                No recipes yet.
              </p>
            </UCard>

            <UCard>
              <template #header>
                <div class="flex items-center justify-between gap-2">
                  <div class="text-sm font-semibold">Mise en place tasks</div>
                  <UBadge variant="soft">{{ counts.mise }}</UBadge>
                </div>
              </template>

              <div v-if="miseTasks.length" class="space-y-2 text-sm">
                <div
                  v-for="task in miseTasks"
                  :key="task.id"
                  class="rounded-md border border-default p-2"
                >
                  <p class="font-medium">{{ task.title || task.id }}</p>
                  <div class="mt-1 flex flex-wrap items-center gap-2 text-xs text-dimmed">
                    <span>Station: {{ task.station || 'n/a' }}</span>
                    <span>Status: {{ task.status }}</span>
                    <span>Checklist: {{ task.checklist?.length ?? 0 }}</span>
                  </div>
                </div>
              </div>
              <p v-else class="text-sm text-dimmed">
                No mise tasks yet.
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
import { useKitchenMenuStackCreate } from '../../../composables/fireux/firestore/objects/kitchen/mutations/useKitchenMenuStackCreate'

definePageMeta({
  layout: 'kitchen-dashboard',
  nav: {
    key: 'dashboard-kitchen-menu',
    label: 'Menus',
    icon: 'i-lucide-book-open-check',
    order: 15,
    desktop: true,
    mobile: true,
    layouts: ['kitchen-dashboard'],
  },
  requiresAuth: true,
})

const { runtimeKitchenId, selectedKitchen, dashboardQuery } = useKitchenDashboardSelection()
const { ingredients } = useIngredientFetch()
const { menus, dishes, recipes, miseTasks, counts } = useKitchenMenuStackFetch(runtimeKitchenId)
const { createStarterKitchenMenuStack } = useKitchenMenuStackCreate()
const toast = useToastify()

const isSeeding = ref(false)

const selectedKitchenName = computed(() =>
  String(selectedKitchen.value?.name || selectedKitchen.value?.short_name || runtimeKitchenId.value)
)

const dishesSorted = computed(() =>
  [...(dishes.value ?? [])].sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0))
)

const homeRoute = computed(() =>
  dashboardQuery.value
    ? {
        path: '/dashboard/kitchen',
        query: dashboardQuery.value,
      }
    : '/dashboard/kitchen'
)

const handleSeed = async () => {
  if (!runtimeKitchenId.value) {
    toast.warn('Select a kitchen first')
    return
  }

  isSeeding.value = true
  try {
    const result = await createStarterKitchenMenuStack(
      runtimeKitchenId.value,
      ingredients.value ?? []
    )
    toast.success(
      `Seeded menu stack (${result.dishIds.length} dishes, ${result.recipeIds.length} recipes, ${result.miseTaskIds.length} mise tasks).`
    )
  } catch (error: any) {
    toast.error(String(error?.message || 'Failed to seed kitchen menu stack'))
  } finally {
    isSeeding.value = false
  }
}
</script>

