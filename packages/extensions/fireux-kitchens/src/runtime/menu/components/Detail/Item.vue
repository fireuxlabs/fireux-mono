<template>
  <article
    class="menu-browse-item"
    :class="{ 'menu-browse-item--with-image': itemImageUrl }"
    :aria-labelledby="itemNameId"
    data-menu-item="true"
    :data-menu-item-id="item.id"
    data-menu-item-mode="read-only"
  >
    <img
      v-if="itemImageUrl"
      :src="itemImageUrl"
      alt=""
      class="menu-browse-item__image"
      width="80"
      height="80"
      loading="lazy"
      decoding="async"
      @error="hideImage"
    />

    <div class="menu-browse-item__copy">
      <div class="menu-browse-item__heading">
        <h3 :id="itemNameId">{{ item.name }}</h3>
        <span
          v-if="itemPrice"
          class="menu-browse-item__price"
          :data-menu-item-price-kind="hasPriceOptions ? 'starting' : 'base'"
        >
          <span>{{ itemPrice }}</span>
        </span>
      </div>

      <p v-if="item.promotionLabel" class="mt-1 text-sm text-primary">
        {{ item.promotionLabel }}
      </p>
      <p v-if="item.description" class="menu-browse-item__description">
        {{ item.description }}
      </p>

      <div
        v-if="hasPriceOptions || item.addOns.length"
        class="menu-browse-item__choices"
      >
        <div
          v-if="hasPriceOptions"
          class="menu-browse-item__options"
          data-menu-item-price-kind="variant"
          :data-menu-item-option-count="item.priceOptions.length"
        >
          <p :id="priceOptionsLabelId" class="menu-browse-item__options-label">
            {{ availableOptionsLabel }}
          </p>
          <ul :aria-labelledby="`${itemNameId} ${priceOptionsLabelId}`">
            <li v-for="option in item.priceOptions" :key="option.id">
              <span>{{ option.label }}</span>
              <span>{{ formatPrice(option.price) }}</span>
            </li>
          </ul>
        </div>

        <component
          :is="collapseExtras ? 'details' : 'div'"
          v-if="item.addOns.length"
          class="menu-browse-item__options menu-browse-item__options--add-ons"
          data-menu-item-price-kind="add-on"
          :data-menu-item-option-count="item.addOns.length"
        >
          <component
            :is="collapseExtras ? 'summary' : 'p'"
            :id="addOnsLabelId"
            class="menu-browse-item__options-label"
            :class="{ 'cursor-pointer': collapseExtras }"
          >
            {{ optionalExtrasLabel }}
          </component>
          <ul :aria-labelledby="`${itemNameId} ${addOnsLabelId}`">
            <li v-for="addOn in item.addOns" :key="addOn.id">
              <span>{{ addOn.label }}</span>
              <span>{{ addOnPrice(addOn.price) }}</span>
            </li>
          </ul>
        </component>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { CurrencyDisplayFormat } from '../../../models/shared/currency-display.model.ts'
import { formatCurrencyAmount } from '../../../utils/currency-display'
import type { MenuManifestItem } from '../../models/menu-detail.model.ts'

const props = defineProps<{
  collapseExtras?: boolean
  accessibilityId: string
  availableOptionsLabel: string
  currencyCode: string
  currencyFormat: CurrencyDisplayFormat
  showCurrency: boolean
  item: MenuManifestItem
  optionalExtrasLabel: string
}>()

const itemNameId = computed(() => `${props.accessibilityId}-name`)
const priceOptionsLabelId = computed(() => `${props.accessibilityId}-options`)
const addOnsLabelId = computed(() => `${props.accessibilityId}-add-ons`)
const failedImageUrl = ref('')
const itemImageUrl = computed(() => {
  const url = String(props.item.imageUrl || '').trim()

  return url && url !== failedImageUrl.value ? url : ''
})
const hasPriceOptions = computed(() => props.item.priceOptions.length > 0)
const itemPrice = computed(() => {
  if (!hasPriceOptions.value) return formatPrice(props.item.price)

  const canonicalStartingPrice = Number(props.item.price)
  if (Number.isFinite(canonicalStartingPrice) && canonicalStartingPrice > 0) {
    return formatPrice(canonicalStartingPrice)
  }

  const prices = props.item.priceOptions
    .map((option) => Number(option.price))
    .filter((price) => Number.isFinite(price) && price > 0)

  return prices.length ? formatPrice(Math.min(...prices)) : ''
})

watch(
  () => props.item.imageUrl,
  () => {
    failedImageUrl.value = ''
  }
)

function hideImage() {
  failedImageUrl.value = itemImageUrl.value
}

function formatPrice(price: number) {
  return formatCurrencyAmount(price, {
    currencyCode: props.currencyCode,
    format: props.currencyFormat,
    showCurrency: props.showCurrency,
  })
}

function addOnPrice(price: number) {
  return price > 0 ? `+ ${formatPrice(price)}` : 'No extra charge'
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

.menu-browse-item--with-image {
  grid-template-columns: 5rem minmax(0, 1fr);
}

.menu-browse-item__image {
  display: block;
  width: 5rem;
  height: 5rem;
  border-radius: calc(var(--ui-radius) * 3);
  object-fit: cover;
}

.menu-browse-item__copy {
  min-width: 0;
}

.menu-browse-item__heading,
.menu-browse-item__options li {
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
  display: grid;
  gap: 0.8rem;
  margin-top: 0.95rem;
  padding-top: 0.8rem;
  border-top: 1px solid color-mix(in srgb, var(--menu-text) 8%, transparent);
}

.menu-browse-item__options--add-ons:not(:first-child) {
  padding-top: calc(var(--spacing) * 3);
  border-top: 1px dashed color-mix(in srgb, var(--menu-text) 10%, transparent);
}

.menu-browse-item__options-label {
  margin: 0 0 0.35rem;
  color: var(--menu-muted);
  font-size: 0.72rem;
  font-weight: var(--font-weight-extrabold);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.menu-browse-item__options ul {
  display: grid;
  gap: 0.3rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.menu-browse-item__options li {
  color: var(--menu-muted);
  font-size: 0.82rem;
  line-height: 1.4;
}

.menu-browse-item__options li span:first-child {
  min-width: 0;
  overflow-wrap: anywhere;
}

.menu-browse-item__options li span:last-child {
  color: var(--menu-text);
  font-weight: var(--font-weight-bold);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.menu-browse-item__options--add-ons li span:last-child {
  color: var(--menu-primary);
}

@media (max-width: 520px) {
  .menu-browse-item--with-image {
    grid-template-columns: 4rem minmax(0, 1fr);
  }

  .menu-browse-item__image {
    width: 4rem;
    height: 4rem;
  }
}

@media (max-width: 420px) {
  .menu-browse-item--with-image .menu-browse-item__heading {
    grid-template-columns: minmax(0, 1fr);
    gap: var(--spacing);
  }

  .menu-browse-item--with-image .menu-browse-item__price {
    justify-self: start;
  }

  .menu-browse-item__options li {
    gap: 0.6rem;
  }
}

@media (max-width: 340px) {
  .menu-browse-item__heading,
  .menu-browse-item__options li {
    grid-template-columns: minmax(0, 1fr);
    gap: 0.15rem;
  }

  .menu-browse-item__price,
  .menu-browse-item__options li span:last-child {
    justify-self: start;
  }
}
</style>
