<template>
  <article
    class="menu-browse-item"
    :aria-labelledby="itemNameId"
    data-menu-item="true"
    :data-menu-item-id="item.id"
    data-menu-item-mode="preview"
  >
    <MenuItemImage :enabled="showItemImages" :image-url="item.imageUrl" />

    <div class="menu-browse-item__copy">
      <div class="menu-browse-item__heading">
        <h3 :id="itemNameId">{{ item.name }}</h3>
        <span
          v-if="itemPrice"
          class="menu-browse-item__price"
          :data-menu-item-price-kind="hasPriceOptions ? 'selected' : 'base'"
          aria-live="polite"
          aria-atomic="true"
        >
          <span>{{ itemPrice }}</span>
        </span>
      </div>

      <p v-if="item.promotionLabel">
        {{ item.promotionLabel }}
      </p>
      <p v-if="item.description" class="menu-browse-item__description">
        {{ item.description }}
      </p>

      <MenuDetailMealDeal
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
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  readItemChoiceGroups,
  priceItemChoices,
} from '../../../kitchen/utils/item-choices'
import type { ItemChoiceSelection } from '../../../kitchen/models/item-choice.model'
import type { CurrencyDisplayFormat } from '../../../models/shared/currency-display.model.ts'
import { formatCurrencyAmount } from '../../../utils/currency-display'
import type { PublicMenuItem } from '../../models/menu-detail.model.ts'

const props = defineProps<{
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
const hasPriceOptions = computed(() =>
  choiceGroups.value.some((group) => group.pricing === 'full')
)
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
.menu-browse-item {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: calc(var(--spacing) * 4);
  padding: calc(var(--spacing) * 5) 0;
  border-bottom: 1px solid color-mix(in srgb, var(--menu-text) 12%, transparent);
}

.menu-browse-item:has(> .menu-item-image) {
  grid-template-columns: 5rem minmax(0, 1fr);
}

.menu-browse-item__copy {
  min-width: 0;
}

.menu-browse-item__heading {
  display: grid;
  grid-template-columns: minmax(0, 1fr) max-content;
  gap: calc(var(--spacing) * 4);
  align-items: baseline;
}

.menu-browse-item h3 {
  min-width: 0;
  margin: 0;
  color: var(--menu-title);
  font-family: var(--menu-title-font);
  font-size: 1.075rem;
  font-weight: var(--font-weight-extrabold);
  line-height: 1.35;
  overflow-wrap: anywhere;
}

.menu-browse-item__price {
  display: inline-flex;
  align-items: baseline;
  gap: 0.3rem;
  color: var(--menu-primary);
  font-size: 0.92rem;
  font-weight: var(--font-weight-extrabold);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.menu-browse-item__description {
  margin: 0.45rem 0 0;
  color: var(--menu-muted);
  font-size: 0.9rem;
  line-height: 1.55;
  overflow-wrap: anywhere;
  white-space: pre-line;
}

.menu-browse-item__choices {
  display: flex;
  flex-wrap: wrap;
  gap: calc(var(--spacing) * 2);
  margin-top: calc(var(--spacing) * 2);
}

@media (max-width: 520px) {
  .menu-browse-item:has(> .menu-item-image) {
    grid-template-columns: 4rem minmax(0, 1fr);
  }

  .menu-browse-item {
    --menu-item-image-size: 4rem;
  }
}

@media (max-width: 420px) {
  .menu-browse-item:has(> .menu-item-image) .menu-browse-item__heading {
    grid-template-columns: minmax(0, 1fr);
    gap: var(--spacing);
  }

  .menu-browse-item:has(> .menu-item-image) .menu-browse-item__price {
    justify-self: start;
  }
}

@media (max-width: 340px) {
  .menu-browse-item__heading {
    grid-template-columns: minmax(0, 1fr);
    gap: 0.15rem;
  }

  .menu-browse-item__price {
    justify-self: start;
  }
}
</style>
