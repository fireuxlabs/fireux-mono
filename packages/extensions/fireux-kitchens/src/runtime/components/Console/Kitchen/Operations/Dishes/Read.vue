<template>
  <section aria-label="Dishes" class="space-y-4">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
      <UInput
        v-model="query"
        icon="i-lucide-search"
        placeholder="Search dishes"
        class="w-full sm:max-w-sm"
      />

      <div class="flex gap-1 overflow-x-auto">
        <UButton
          v-for="option in kindOptions"
          :key="option.value"
          size="sm"
          :icon="option.icon"
          :color="kindFilter === option.value ? 'primary' : 'neutral'"
          :variant="kindFilter === option.value ? 'solid' : 'soft'"
          @click="kindFilter = option.value"
        >
          {{ option.label }}
        </UButton>
      </div>

      <span class="text-sm text-dimmed sm:ml-auto">
        {{ visibleDishes.length }} dishes
      </span>
    </div>

    <div v-if="pending" class="text-sm text-dimmed">
      Loading dishes...
    </div>

    <UAlert
      v-else-if="error"
      color="error"
      variant="soft"
      icon="i-lucide-circle-alert"
      title="Dishes unavailable"
      description="The dishes for this kitchen could not be loaded. Please try again."
    />

    <UAlert
      v-else-if="!dishes.length"
      color="neutral"
      variant="soft"
      title="No dishes yet"
      :description="readOnly
        ? 'No dishes are available in this read-only source.'
        : 'Create the first dish for this kitchen.'"
    />

    <UAlert
      v-else-if="!visibleDishes.length"
      color="neutral"
      variant="soft"
      title="No matching dishes"
      description="Try another search or choose a different type."
    />

    <div
      v-else
      class="flex flex-wrap gap-3"
    >
      <ConsoleKitchenOperationsDishesCardsCell
        v-for="dish in visibleDishes"
        :id="dish.id"
        :key="dish.id"
        :title="dish.name || dish.id"
        :image-url="dish.image"
        :meta="kindLabel(dish)"
        :price-label="getPriceLabelForDish(dish.id)"
        :data-service-state="
          isDishInService(dish.id) ? 'active' : 'inactive'
        "
        class="w-32 sm:w-36"
        :class="
          isDishInService(dish.id)
            ? ''
            : 'opacity-45 saturate-50'
        "
        action
        @action="openQuickLook(dish)"
      />
    </div>

    <ConsoleKitchenOperationsDishesQuickLook
      v-model:open="quickLookOpen"
      :dish="selectedDish"
      :menu-usage="selectedDishMenuUsage"
      :price-label="selectedDishPriceLabel"
      @after-leave="selectedDish = null"
    />

<DevDebugPanel
  object-origin="fetched"
      launcher
      include-route
      title="Kitchen dishes debug"
      context="Kitchen dishes console · /console/kitchen/dishes"
      :objects="dishDebug"
  :derived="{}"
      :default-open="false"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useKitchenDishesWorkspace } from '../../../../../composables/fireux/console/kitchen/operations/Dishes/useKitchenDishesWorkspace'
import type { Dish } from '../../../../../models/kitchen/dish.model'

type DishKindFilter = 'all' | 'food' | 'drink' | 'deal'

const {
  dishes,
  pending,
  error,
  readOnly,
  debug,
  getMenuUsageForDish,
  getPriceLabelForDish,
  isDishInService,
} = useKitchenDishesWorkspace()

const query = ref('')
const kindFilter = ref<DishKindFilter>('all')
const quickLookOpen = ref(false)
const selectedDish = ref<Dish | null>(null)

const clean = (value: unknown) => String(value ?? '').trim()
const searchable = (dish: Dish) =>
  [
    dish.name,
    dish.description,
    dish.item_kind,
    dish.is_deal ? 'deal' : '',
  ].map(clean).join(' ').toLowerCase()
const kindLabel = (dish: Dish) =>
  dish.is_deal ? 'Deal' : dish.item_kind === 'drink' ? 'Drink' : 'Food'

const kindOptions: Array<{
  value: DishKindFilter
  label: string
  icon: string
}> = [
  { value: 'all', label: 'All', icon: 'i-lucide-layout-grid' },
  { value: 'food', label: 'Food', icon: 'i-lucide-utensils' },
  { value: 'drink', label: 'Drinks', icon: 'i-lucide-glass-water' },
  { value: 'deal', label: 'Deals', icon: 'i-lucide-tags' },
]
const visibleDishes = computed(() => {
  const needle = clean(query.value).toLowerCase()

  return dishes.value
    .filter((dish) => {
      if (needle && !searchable(dish).includes(needle)) return false
      if (kindFilter.value === 'food') {
        return dish.item_kind === 'food' && !dish.is_deal
      }
      if (kindFilter.value === 'drink') return dish.item_kind === 'drink'
      if (kindFilter.value === 'deal') return dish.is_deal
      return true
    })
    .slice()
    .sort((left, right) =>
      clean(left.name || left.id).localeCompare(clean(right.name || right.id))
    )
})
const selectedDishPriceLabel = computed(() =>
  selectedDish.value ? getPriceLabelForDish(selectedDish.value.id) : ''
)
const selectedDishMenuUsage = computed(() =>
  selectedDish.value ? getMenuUsageForDish(selectedDish.value.id) : []
)
const openQuickLook = (dish: Dish) => {
  selectedDish.value = dish
  quickLookOpen.value = true
}
const dishDebug = computed(() => ({
  objects: {
    dishes: dishes.value.map((dish) => ({
      id: dish.id,
      name: dish.name,
      item_kind: dish.item_kind,
      is_deal: dish.is_deal,
      priceLabel: getPriceLabelForDish(dish.id),
      kitchenId: dish.kitchen_id,
    })),
  },
  derived: {
    ...debug.value,
    visibleCount: visibleDishes.value.length,
  },
}))
</script>
