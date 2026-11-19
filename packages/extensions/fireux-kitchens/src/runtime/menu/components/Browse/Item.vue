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
import { computed } from 'vue'
import { useMenuItemChoicePreview } from '../../composables/useMenuItemChoicePreview'
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
const { choiceGroups, selections, itemPrice } = useMenuItemChoicePreview(
  () => props.item,
  formatPrice
)

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
