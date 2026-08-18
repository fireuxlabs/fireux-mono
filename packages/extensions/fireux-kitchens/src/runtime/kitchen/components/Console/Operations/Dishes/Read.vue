<template>
  <section :aria-label="catalogue.title" class="space-y-4">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
      <UInput
        v-model="query"
        icon="i-lucide-search"
        :placeholder="`Search ${catalogue.plural}`"
        class="w-full sm:max-w-sm"
      />

      <span class="text-sm text-dimmed sm:ml-auto">
        {{ visibleDishes.length }} {{ catalogue.plural }}
      </span>
    </div>

    <div v-if="pending" class="text-sm text-dimmed">
      Loading {{ catalogue.plural }}...
    </div>

    <UAlert
      v-else-if="error"
      color="error"
      variant="soft"
      icon="i-lucide-circle-alert"
      :title="`${catalogue.title} unavailable`"
      :description="`The ${catalogue.plural} for this kitchen could not be loaded. Please try again.`"
    />

    <UAlert
      v-else-if="!dishes.length"
      color="neutral"
      variant="soft"
      :title="`No ${catalogue.plural} yet`"
      :description="readOnly
        ? `No ${catalogue.plural} are available in this read-only source.`
        : `Create the first ${catalogue.singular} for this kitchen.`"
    />

    <UAlert
      v-else-if="!visibleDishes.length"
      color="neutral"
      variant="soft"
      :title="`No matching ${catalogue.plural}`"
      description="Try another search."
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
      :title="`Kitchen ${catalogue.plural} debug`"
      :context="`Kitchen ${catalogue.plural} console · ${catalogue.path}`"
      :objects="dishDebug"
  :derived="{}"
      :default-open="false"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useKitchenDishesWorkspace } from '../../../../composables/console/operations/Dishes/useKitchenDishesWorkspace'
import type { Dish } from '../../../../models/dish.model.ts'

const {
  dishes,
  pending,
  error,
  readOnly,
  debug,
  getMenuUsageForDish,
  getPriceLabelForDish,
  isDishInService,
  catalogue,
} = useKitchenDishesWorkspace()

const query = ref('')
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

const visibleDishes = computed(() => {
  const needle = clean(query.value).toLowerCase()

  return dishes.value
    .filter((dish) => {
      if (needle && !searchable(dish).includes(needle)) return false
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
