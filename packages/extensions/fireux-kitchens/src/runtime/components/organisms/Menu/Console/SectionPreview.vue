<template>
  <UAccordion type="multiple" class="space-y-2">
    <UAccordionItem
      v-for="section in sectionsSorted"
      :key="section.id || section.label"
      :value="String(section.id || section.label || 'section')"
      :title="sectionTitle(section)"
    >
      <template #body>
        <div v-if="sectionItems(section).length" class="space-y-2">
          <div
            v-for="item in sectionItems(section).slice(0, 4)"
            :key="item.id || item.dish_id || item.label"
            class="flex items-center justify-between gap-3 rounded border border-default p-2 text-sm"
          >
            <span class="font-medium">
              {{ item.label || item.dish_id || 'Untitled item' }}
            </span>
            <span class="text-dimmed">
              {{ formatPrice(item.price_minor, item.currency_code || currencyCode) }}
            </span>
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
      </template>
    </UAccordionItem>
  </UAccordion>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { MenuSection, MenuSectionItem } from '../../../../models/menu.model'

const props = withDefaults(
  defineProps<{
    sections?: MenuSection[]
    currencyCode?: string
  }>(),
  {
    sections: () => [],
    currencyCode: 'CHF',
  }
)

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

const sectionTitle = (section: MenuSection) => {
  const label = String(section.label || section.id || 'Untitled section')
  const count = sectionItems(section).length
  return `${label} · ${count} ${count === 1 ? 'item' : 'items'}`
}

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
