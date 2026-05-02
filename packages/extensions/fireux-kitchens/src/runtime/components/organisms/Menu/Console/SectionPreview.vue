<template>
  <div class="space-y-3">
    <div
      v-for="section in sectionsSorted"
      :key="section.id || section.label"
      class="rounded border border-default p-3"
    >
      <div class="mb-3 flex items-center justify-between gap-3">
        <div class="text-sm font-semibold">
          {{ section.label || section.id || 'Untitled section' }}
        </div>
      </div>

      <div v-if="sectionItems(section).length" class="space-y-2">
        <div
          v-for="item in sectionItems(section).slice(0, 4)"
          :key="item.id || item.dish_id || item.label"
          class="pill"
        >
          <div class="flex min-w-0 items-start gap-2">
            <UAvatar
              v-if="dishImageUrl(item)"
              :src="dishImageUrl(item)"
              :alt="itemLabel(item)"
              size="sm"
              icon="i-lucide-utensils"
            />

            <div class="min-w-0 flex-1 space-y-1">
              <p class="truncate text-sm font-medium text-highlighted">
                {{ itemLabel(item) }}
              </p>
              <div class="flex flex-wrap items-center gap-1">
                <UBadge variant="soft" color="neutral" size="xs">
                  {{ formatPrice(item.price_minor, item.currency_code || currencyCode) }}
                </UBadge>
              </div>
            </div>
          </div>
        </div>

        <p
          v-if="sectionItems(section).length > 4"
          class="text-xs text-dimmed"
        >
          +{{ sectionItems(section).length - 4 }} more items
        </p>
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
  }>(),
  {
    sections: () => [],
    dishes: () => [],
    currencyCode: 'CHF',
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
  return normalizeString(dish?.name) || normalizeString(dish?.short_name)
}

const itemLabel = (item: MenuSectionItem) =>
  normalizeString(item.label) ||
  resolvedDishName(item) ||
  normalizeString(item.dish_id) ||
  'Untitled item'

const dishImageUrl = (item: MenuSectionItem) =>
  normalizeString(resolvedDish(item)?.image_url)

const formatPrice = (
  valueMinor: MenuSectionItem['price_minor'],
  currencyCode?: string
) =>
  new Intl.NumberFormat('de-CH', {
    style: 'currency',
    currency: String(currencyCode || 'CHF').trim().toUpperCase() || 'CHF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(valueMinor || 0) / 100)
</script>
