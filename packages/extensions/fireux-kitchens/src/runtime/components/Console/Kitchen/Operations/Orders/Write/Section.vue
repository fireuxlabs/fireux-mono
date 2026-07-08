<template>
  <section class="space-y-3">
    <div class="flex items-center justify-between gap-3">
      <h3 class="text-sm font-semibold text-highlighted">{{ section.label }}</h3>
      <UBadge color="neutral" variant="soft">{{ rows.length }}</UBadge>
    </div>

    <div v-if="rows.length" class="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4">
      <button
        v-for="row in rows"
        :key="row.id"
        type="button"
        class="overflow-hidden rounded-lg border border-default bg-default text-left transition hover:border-primary/50"
        @click="emit('add', row)"
      >
        <div class="grid aspect-square place-items-center bg-muted">
          <img
            v-if="row.imageUrl"
            :src="row.imageUrl"
            :alt="row.label"
            class="size-full object-cover"
            loading="lazy"
          >
          <UIcon
            v-else
            name="i-lucide-utensils"
            class="size-8 text-muted"
          />
        </div>

        <div class="grid gap-1 p-2">
          <p class="line-clamp-2 min-h-10 text-sm font-semibold text-highlighted">
            {{ row.label }}
          </p>
          <p class="text-sm font-bold text-primary">
            {{ money(row.price) }}
          </p>
        </div>
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, toRef } from 'vue'
import type { Dish } from '../../../../../../models/kitchen/dish.model'
import {
  type MenuItem,
  normalizeMenuItemPriceOptions,
} from '../../../../../../models/kitchen/menu/menu-item.model'
import type { MenuSection } from '../../../../../../models/kitchen/menu/menu-section.model'
import { useMenuItemCollection } from '../../../../../../composables/fireux/firestore/menu/fetch/useMenuItemCollection'

export type StaffPosItemRow = {
  id: string
  menuId: string
  sectionId: string
  dishId: string
  label: string
  imageUrl: string
  price: number
  item: MenuItem
}

const props = defineProps<{
  section: MenuSection
  menuId: string
  kitchenId: string
  kitchenCollectionPath: string
  databaseId?: string
  dishes: Dish[]
}>()

const emit = defineEmits<{
  add: [row: StaffPosItemRow]
}>()

const text = (value: unknown) => String(value ?? '').trim()
const record = (value: unknown) =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
const itemState = useMenuItemCollection(
  toRef(props, 'kitchenId'),
  toRef(props, 'menuId'),
  computed(() => props.section.id),
  {
    kitchenCollectionPath: toRef(props, 'kitchenCollectionPath'),
    databaseId: toRef(props, 'databaseId'),
  }
)
const dishesById = computed(() => {
  const map = new Map<string, Dish>()
  props.dishes.forEach((dish) => {
    const id = text(dish.id)
    if (id) map.set(id, dish)
  })
  return map
})
const rows = computed<StaffPosItemRow[]>(() =>
  itemState.items.value.map((item: MenuItem) => {
    const dish = dishesById.value.get(text(item.dish_id))
    const priceOptions = normalizeMenuItemPriceOptions(record(item).price_options)
    const prices = priceOptions
      .map((option: { price: number }) => option.price)
      .filter(Boolean)
    const price = Number(item.price || 0) || (prices.length ? Math.min(...prices) : 0)

    return {
      id: text(item.id),
      menuId: text(item.menu_id),
      sectionId: text(item.section_id),
      dishId: text(item.dish_id),
      label: text(dish?.name) || text(item.dish_id),
      imageUrl: text(item.image_url) || text(dish?.image_url),
      price,
      item,
    }
  })
)
const money = (value: number) =>
  value
    ? new Intl.NumberFormat('de-CH', {
        style: 'currency',
        currency: 'CHF',
      }).format(value)
    : 'Open'
</script>
