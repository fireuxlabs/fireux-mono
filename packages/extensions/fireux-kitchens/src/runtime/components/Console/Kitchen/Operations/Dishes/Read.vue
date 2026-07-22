<template>
  <div class="space-y-6">
    <UCard>
      <template #header>
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 class="text-base font-semibold text-highlighted">Dishes</h2>
            <p class="text-sm text-dimmed">
              Search and maintain the kitchen dish library.
            </p>
          </div>

          <div class="flex flex-wrap gap-2">
            <UBadge color="neutral" variant="soft">{{ dishes.length }} total</UBadge>
            <UBadge color="neutral" variant="soft">{{ imageCount }} with images</UBadge>
          </div>
        </div>
      </template>

      <div class="space-y-4">
        <div class="grid gap-3 xl:grid-cols-[minmax(18rem,1fr)_auto_auto]">
          <UInput
            v-model="query"
            icon="i-lucide-search"
            placeholder="Search dishes"
            :ui="{ root: 'w-full' }"
          />

          <UButtonGroup>
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
          </UButtonGroup>

          <UButtonGroup>
            <UButton
              v-for="option in imageOptions"
              :key="option.value"
              size="sm"
              :icon="option.icon"
              :color="imageFilter === option.value ? 'primary' : 'neutral'"
              :variant="imageFilter === option.value ? 'solid' : 'soft'"
              @click="imageFilter = option.value"
            >
              {{ option.label }}
            </UButton>
          </UButtonGroup>
        </div>

        <div class="flex flex-wrap items-center justify-between gap-3">
          <p class="text-sm text-dimmed">
            Showing {{ visibleDishes.length }} of {{ dishes.length }}
          </p>

          <UButton
            v-if="hasFilters"
            size="sm"
            color="neutral"
            variant="ghost"
            icon="i-lucide-x"
            @click="clearFilters"
          >
            Clear
          </UButton>
        </div>

        <UAlert
          v-if="pending"
          color="neutral"
          variant="soft"
          title="Loading dishes"
        />

        <UAlert
          v-else-if="!dishes.length"
          color="neutral"
          variant="soft"
          title="No dishes yet"
          description="Create or import dishes before organizing this kitchen library."
        />

        <UAlert
          v-else-if="!visibleDishes.length"
          color="neutral"
          variant="soft"
          title="No matching dishes"
          description="Clear a filter or search for another dish name."
        />

        <div v-else class="space-y-5">
          <section
            v-for="group in groupedDishes"
            :key="group.key"
            class="space-y-3"
          >
            <div class="flex items-center gap-2">
              <UBadge color="neutral" variant="soft">{{ group.label }}</UBadge>
              <span class="text-xs text-dimmed">{{ group.dishes.length }}</span>
            </div>

            <div class="grid gap-3 lg:grid-cols-2 2xl:grid-cols-3">
              <ConsoleKitchenOperationsDishesCardsCell
                v-for="dish in group.dishes"
                :id="dish.id"
                :key="dish.id"
                :to="`/console/kitchen/dishes/${encodeURIComponent(dish.id)}`"
                :title="dish.name || dish.id"
                :subtitle="dishSubtitle(dish)"
                :image-url="dish.image"
                :description="dish.description"
                :meta="dish.item_kind"
                show-subtitle
                link
              />
            </div>
          </section>
        </div>
      </div>
    </UCard>

    <DevJson
      title="Kitchen dishes debug"
      context="Kitchen dishes console · /console/kitchen/dishes"
      :data="dishDebug"
      :default-open="false"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useKitchenConsoleDishes } from '../../../../../composables/fireux/console/kitchen/operations/Dishes/useKitchenConsoleDishes'
import type { Dish } from '../../../../../models/kitchen/dish.model'

type DishKindFilter = 'all' | 'food' | 'drink' | 'deal'
type DishImageFilter = 'all' | 'with_image' | 'without_image'

const { dishes, pending, debug } = useKitchenConsoleDishes()

const query = ref('')
const kindFilter = ref<DishKindFilter>('all')
const imageFilter = ref<DishImageFilter>('all')

const clean = (value: unknown) => String(value ?? '').trim()
const searchable = (dish: Dish) =>
  [
    dish.name,
    dish.id,
    dish.description,
    dish.item_kind,
    dish.is_deal ? 'deal' : '',
  ].map(clean).join(' ').toLowerCase()
const hasImage = (dish: Dish) => Boolean(clean(dish.image))
const kindLabel = (dish: Dish) =>
  dish.is_deal ? 'Deal' : dish.item_kind === 'drink' ? 'Drink' : 'Food'
const dishSubtitle = (dish: Dish) =>
  [
    kindLabel(dish),
    hasImage(dish) ? 'Image' : 'No image',
    clean(dish.description) ? '' : 'No description',
  ].filter(Boolean).join(' · ')

const kindOptions: Array<{
  value: DishKindFilter
  label: string
  icon: string
}> = [
  { value: 'all', label: 'All', icon: 'i-lucide-list-filter' },
  { value: 'food', label: 'Food', icon: 'i-lucide-utensils' },
  { value: 'drink', label: 'Drinks', icon: 'i-lucide-glass-water' },
  { value: 'deal', label: 'Deals', icon: 'i-lucide-tags' },
]
const imageOptions: Array<{
  value: DishImageFilter
  label: string
  icon: string
}> = [
  { value: 'all', label: 'Any image', icon: 'i-lucide-images' },
  { value: 'with_image', label: 'With image', icon: 'i-lucide-image' },
  { value: 'without_image', label: 'No image', icon: 'i-lucide-image-off' },
]
const imageCount = computed(() =>
  dishes.value.filter((dish) => hasImage(dish)).length
)
const hasFilters = computed(() =>
  Boolean(clean(query.value)) ||
    kindFilter.value !== 'all' ||
    imageFilter.value !== 'all'
)
const visibleDishes = computed(() => {
  const needle = clean(query.value).toLowerCase()

  return dishes.value
    .filter((dish) => {
      if (needle && !searchable(dish).includes(needle)) return false
      if (kindFilter.value === 'food' && dish.item_kind !== 'food') return false
      if (kindFilter.value === 'drink' && dish.item_kind !== 'drink') return false
      if (kindFilter.value === 'deal' && !dish.is_deal) return false
      if (imageFilter.value === 'with_image' && !hasImage(dish)) return false
      if (imageFilter.value === 'without_image' && hasImage(dish)) return false

      return true
    })
    .slice()
    .sort((left, right) =>
      clean(left.name || left.id).localeCompare(clean(right.name || right.id))
    )
})
const groupedDishes = computed(() => {
  const groups = new Map<string, Dish[]>()

  for (const dish of visibleDishes.value) {
    const first = clean(dish.name || dish.id).slice(0, 1).toUpperCase()
    const key = /^[A-Z]$/.test(first) ? first : '#'
    groups.set(key, [...(groups.get(key) || []), dish])
  }

  return [...groups.entries()].map(([key, groupDishes]) => ({
    key,
    label: key,
    dishes: groupDishes,
  }))
})
const clearFilters = () => {
  query.value = ''
  kindFilter.value = 'all'
  imageFilter.value = 'all'
}
const dishDebug = computed(() => ({
  objects: {
    dishes: dishes.value.map((dish) => ({
      id: dish.id,
      name: dish.name,
      item_kind: dish.item_kind,
      is_deal: dish.is_deal,
      hasDescription: Boolean(clean(dish.description)),
      hasImage: hasImage(dish),
      kitchenId: dish.kitchen_id,
    })),
  },
  derived: {
    ...debug.value,
    visibleCount: visibleDishes.value.length,
    imageCount: imageCount.value,
  },
}))
</script>
