<template>
  <UDashboardPanel id="console-kitchen-dishes">
    <template #header>
      <LayoutsConsoleNavbar title="Dishes" />
    </template>

    <template #body>
      <section class="space-y-8">
        <div class="text-xs text-dimmed">
          Mode: <span class="font-medium">{{ mode }}</span>
          <span class="mx-2">·</span>
          Kitchen: <span class="font-medium">{{ kitchenId || 'none' }}</span>
          <span class="mx-2">·</span>
          Dishes: <span class="font-medium">{{ dishesVisible.length }}</span>
          <span class="mx-1">/</span>
          <span class="font-medium">{{ dishes.length }}</span>
          <span class="mx-2">·</span>
          Selected Dish:
          <span class="font-medium">{{ selectedDishLabel }}</span>
        </div>

        <div class="flex items-center justify-end gap-2">
          <UButton
            size="xs"
            :variant="dishScope === 'linked' ? 'solid' : 'soft'"
            @click="dishScope = 'linked'"
          >
            Show linked
          </UButton>
          <UButton
            size="xs"
            :variant="dishScope === 'all' ? 'solid' : 'soft'"
            @click="dishScope = 'all'"
          >
            Show all
          </UButton>
        </div>

        <DishCollectionManager
          :collection="dishesVisible"
          :selected-id="selectedDishId"
          title="Dishes"
          description="Service-ready items for this kitchen."
          :link="false"
          :selection-mode="true"
          @select="onSelectDish"
        />

        <UCard v-if="selectedDish">
          <div class="space-y-2">
            <div class="font-medium">
              {{ selectedDish.name || selectedDish.id || 'Untitled dish' }}
            </div>
            <div class="text-xs text-dimmed">
              {{ selectedDish.description || 'No description' }}
            </div>
            <div class="text-xs text-dimmed">
              {{ selectedDish.active ? 'Active' : 'Inactive' }} · Sort: {{ selectedDish.sort_order || 0 }}
            </div>

            <div class="grid gap-3 pt-2 sm:grid-cols-3">
              <div class="rounded border border-default p-2">
                <div class="text-xs font-medium text-dimmed">Recipes</div>
                <div class="mt-1 text-sm">
                  {{ selectedDish.recipe_ids?.length || 0 }}
                </div>
              </div>
              <div class="rounded border border-default p-2">
                <div class="text-xs font-medium text-dimmed">Ingredients</div>
                <div class="mt-1 text-sm">
                  {{ selectedDish.ingredient_ids?.length || 0 }}
                </div>
              </div>
              <div class="rounded border border-default p-2">
                <div class="text-xs font-medium text-dimmed">Mise</div>
                <div class="mt-1 text-sm">
                  {{ selectedDish.mise_ids?.length || 0 }}
                </div>
              </div>
            </div>
          </div>
        </UCard>

        <UAlert
          v-else-if="dishesVisible.length"
          color="neutral"
          variant="soft"
          title="No dish selected"
          description="Select a dish above to inspect details."
        />

        <UAlert
          v-else-if="dishes.length"
          color="neutral"
          variant="soft"
          title="No linked dishes"
          description="No dishes are linked from menu items in this scope."
        />

        <UAlert
          v-else
          color="neutral"
          variant="soft"
          title="No dishes loaded"
          description="No dish documents found for the current kitchen context."
        />
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import type { Dish } from '../../../models/dish.model'
import { computed, ref, watch } from 'vue'
import DishCollectionManager from '../../../components/organisms/Dish/Collection/Manager.vue'
import { useRuntimeKitchen } from '../../../composables/fireux/app/kitchen-runtime/useRuntimeKitchen'

definePageMeta({
  layout: 'kitchen-console',
  nav: {
    visibility: { modules: ['fireux-kitchens'] },
    key: 'console-kitchen-dishes',
    label: 'Dishes',
    icon: 'i-lucide-utensils',
    order: 4,
    desktop: true,
    mobile: true,
    layouts: ['kitchen-console'],
  },
  requiresAuth: true,
})

const runtime = useRuntimeKitchen()
const mode = runtime.mode
const kitchenId = runtime.id
const dishes = computed(() => runtime.data.value.dishes ?? [])
const menus = computed(() => runtime.data.value.menus ?? [])
const selectedDishId = ref('')
const dishScope = ref<'linked' | 'all'>('linked')

const linkedDishIdSet = computed(() => {
  const ids = new Set<string>()

  for (const menu of menus.value) {
    for (const section of menu.sections ?? []) {
      for (const item of section.items ?? []) {
        const dishId = String(item.dish_id || '').trim()
        if (dishId) ids.add(dishId)
      }
    }
  }

  return ids
})

const dishesVisible = computed(() => {
  if (dishScope.value === 'all') return dishes.value
  return dishes.value.filter((dish) => linkedDishIdSet.value.has(String(dish.id || '').trim()))
})

watch(
  dishesVisible,
  (nextDishes) => {
    const current = String(selectedDishId.value || '').trim()
    if (!current) return
    if (nextDishes.some((dish) => String(dish.id || '').trim() === current)) return
    selectedDishId.value = ''
  },
  { immediate: true }
)

const selectedDish = computed<Dish | null>(() => {
  const selected = String(selectedDishId.value || '').trim()
  if (!selected) return null
  return dishesVisible.value.find((dish) => String(dish.id || '').trim() === selected) || null
})

const selectedDishLabel = computed(
  () => selectedDish.value?.name || selectedDish.value?.id || 'none'
)

const onSelectDish = (dishId: string) => {
  selectedDishId.value = String(dishId || '').trim()
}
</script>
