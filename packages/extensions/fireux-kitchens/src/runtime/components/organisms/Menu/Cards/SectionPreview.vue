<template>
  <div class="space-y-3">
    <div
      v-for="section in sectionsSorted"
      :key="section.id"
      class="space-y-2"
    >
      <p
        v-if="showSectionHeadings"
        class="text-xs font-medium uppercase tracking-wide text-dimmed"
      >
        {{ section.label }}
      </p>

      <div v-if="sectionItems(section).length" class="space-y-2">
        <div
          v-for="item in sectionItems(section)"
          :key="item.id"
          class="pill"
        >
          <div class="flex min-w-0 items-start gap-2">
            <div class="min-w-0 flex-1 space-y-1">
              <p class="truncate text-sm font-medium text-highlighted">
                {{ itemLabel(item) }}
              </p>
              <div class="flex flex-wrap items-center gap-1">
                <UBadge variant="soft" color="neutral" size="xs">
                  {{ formatItemPrice(item, currencyCode) }}
                </UBadge>
              </div>
            </div>
          </div>
        </div>
      </div>

      <p v-else class="text-sm text-dimmed">
        No items in this section yet.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Dish } from '../../../../models/dish.model'
import type { MenuSection, MenuSectionItem } from '../../../../models/menu.model'

const props = withDefaults(
  defineProps<{
    sections?: MenuSection[]
    dishes?: Dish[]
    currencyCode?: string
    showSectionHeadings?: boolean
  }>(),
  {
    sections: () => [],
    dishes: () => [],
    currencyCode: 'CHF',
    showSectionHeadings: true,
  }
)

const normalizeString = (value: unknown) => String(value ?? '').trim()

const sectionsSorted = computed(() =>
  [...props.sections].sort(
    (a, b) => Number(a?.sort_order || 0) - Number(b?.sort_order || 0)
  )
)

const sectionItems = (section: MenuSection) =>
  Array.isArray(section.items)
    ? [...section.items].sort(
        (a, b) => Number(a?.sort_order || 0) - Number(b?.sort_order || 0)
      )
    : []

const dishesById = computed(() => {
  const lookup = new Map<string, Dish>()

  props.dishes.forEach((dish) => {
    const id = normalizeString(dish?.id)
    if (id) lookup.set(id, dish)
  })

  return lookup
})

const resolvedDish = (item: MenuSectionItem) =>
  dishesById.value.get(normalizeString(item.dish_id)) ?? null

const resolvedDishName = (item: MenuSectionItem) => {
  const dish = resolvedDish(item)
  return normalizeString(dish?.name)
}

const itemLabel = (item: MenuSectionItem) =>
  normalizeString(item.label) ||
  resolvedDishName(item)

const itemPrice = (item: MenuSectionItem) => {
  const price = Number(item.price)
  return Number.isFinite(price) ? price : 0
}

const formatItemPrice = (item: MenuSectionItem, currencyCode?: string) =>
  new Intl.NumberFormat('de-CH', {
    style: 'currency',
    currency: String(currencyCode || 'CHF').trim().toUpperCase() || 'CHF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(itemPrice(item))
</script>
