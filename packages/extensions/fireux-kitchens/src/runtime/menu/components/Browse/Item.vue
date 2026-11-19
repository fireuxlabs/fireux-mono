<template>
  <MenuItemDisplay
    :name-id="itemNameId"
    :heading-tag="headingTag"
    :name="item.name"
    :price="itemPrice"
    :description="item.description"
    :promotion-label="item.promotionLabel"
    :image-url="showItemImages ? item.imageUrl : undefined"
    announce-price
  >
    <MenuMealDeal
      v-if="item.mealDeal"
      :deal="item.mealDeal"
      :format-price="formatPrice"
    />

    <MenuItemChoices
      v-if="choiceGroups.length"
      class="menu-browse-item__choices"
      :groups="choiceGroups"
      v-model="selections"
      :money="formatPrice"
      :show-names="item.choiceGroups !== undefined"
    />
  </MenuItemDisplay>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  readItemChoiceGroups,
  priceItemChoices,
} from '../../../kitchen/utils/item-choices'
import type { ItemChoiceSelection } from '../../../kitchen/records/menus/items/item-offer'
import type { CurrencyDisplayFormat } from '../../../models/shared/currency-display.model.ts'
import { formatCurrencyAmount } from '../../../utils/currency-display'
import type { PublicMenuItem } from '../../models/menu-detail.model.ts'

const props = defineProps<{
  headingTag?: 'h3' | 'h4'
  accessibilityId: string
  availableOptionsLabel: string
  currencyCode: string
  currencyFormat: CurrencyDisplayFormat
  showCurrency: boolean
  showItemImages?: boolean
  item: PublicMenuItem
  optionalExtrasLabel: string
}>()

const itemNameId = computed(() => `${props.accessibilityId}-name`)
const choiceGroups = computed(() => readItemChoiceGroups(props.item))
const selections = ref<ItemChoiceSelection>({})
watch(
  [() => props.item.id, () => props.item.dishId, choiceGroups],
  (currentOwner, previousOwner) => {
    const sameItem =
      previousOwner &&
      currentOwner[0] === previousOwner[0] &&
      currentOwner[1] === previousOwner[1]
    const next: ItemChoiceSelection = {}
    for (const group of choiceGroups.value) {
      const current = (sameItem ? selections.value[group.id] || [] : []).filter(
        (id) => group.options.some((option) => option.id === id)
      )
      const cheapest =
        group.pricing === 'full'
          ? group.options.reduce((a, b) => (a.price <= b.price ? a : b))
          : undefined
      next[group.id] = current.length ? current : cheapest ? [cheapest.id] : []
    }
    selections.value = next
  },
  { immediate: true, flush: 'sync' }
)
const itemPrice = computed(() => {
  try {
    return formatPrice(
      priceItemChoices(
        props.item.price,
        choiceGroups.value,
        selections.value,
        true
      ).unitMinor / 100
    )
  } catch {
    return formatPrice(props.item.price)
  }
})

function formatPrice(price: number) {
  return formatCurrencyAmount(price, {
    currencyCode: props.currencyCode,
    format: props.currencyFormat,
    showCurrency: props.showCurrency,
  })
}
</script>

<style scoped>
.menu-browse-item__choices {
  display: flex;
  flex-wrap: wrap;
  gap: calc(var(--spacing) * 2);
  margin-top: calc(var(--spacing) * 2);
}
</style>
