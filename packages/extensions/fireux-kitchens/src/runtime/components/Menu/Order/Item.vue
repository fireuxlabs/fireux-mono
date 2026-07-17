<template>
  <article
    class="menu-order-item"
    :class="{
      'menu-order-item--with-image': itemImageUrl,
      'menu-order-item--unavailable': !canSelect,
    }"
    data-menu-item="true"
    :data-menu-item-id="item.id"
    data-menu-item-mode="selectable"
  >
    <button
      type="button"
      class="menu-order-item__button"
      data-menu-action="configure-item"
      :disabled="!canSelect"
      @click="selectItem"
    >
      <img
        v-if="itemImageUrl"
        :src="itemImageUrl"
        alt=""
        class="menu-order-item__image"
        width="80"
        height="80"
        loading="lazy"
        decoding="async"
        @error="hideImage"
      >

      <span class="menu-order-item__copy">
        <span class="menu-order-item__heading">
          <strong>{{ item.name }}</strong>
          <span
            v-if="itemPrice"
            class="menu-order-item__price"
            :data-menu-item-price-kind="hasPriceOptions ? 'starting' : 'base'"
          >
            <small v-if="hasPriceOptions">From</small>
            <span>{{ itemPrice }}</span>
          </span>
          <span v-else class="menu-order-item__unavailable-label">
            Price unavailable
          </span>
        </span>

        <span v-if="item.description" class="menu-order-item__description">
          {{ item.description }}
        </span>

        <span v-if="canSelect" class="menu-order-item__prompt">
          {{ choicePrompt }}
          <UIcon name="i-lucide-chevron-right" aria-hidden="true" />
        </span>
      </span>
    </button>
  </article>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { formatCurrencyAmount } from 'fireux-core/runtime/models/core/money.model'
import type { MenuManifestItem } from '../../../models/kitchen/menu/menu-detail.model'
import {
  menuOrderPositivePrice,
  resolveMenuOrderAddOns,
  resolveMenuOrderPriceOptions,
} from '../../../utils/menu-order-options'

const props = defineProps<{
  currencyCode: string
  item: MenuManifestItem
}>()

const emit = defineEmits<{
  (event: 'select', trigger: HTMLButtonElement): void
}>()

const failedImageUrl = ref('')
const itemImageUrl = computed(() => {
  const url = String(props.item.imageUrl || '').trim()

  return url && url !== failedImageUrl.value ? url : ''
})
const resolvedPriceOptions = computed(() =>
  resolveMenuOrderPriceOptions(props.item.priceOptions)
)
const resolvedAddOns = computed(() => resolveMenuOrderAddOns(props.item.addOns))
const priceOptions = computed(() => resolvedPriceOptions.value || [])
const addOns = computed(() => resolvedAddOns.value || [])
const orderDataValid = computed(() =>
  resolvedPriceOptions.value !== null && resolvedAddOns.value !== null
)
const itemIdentityValid = computed(() =>
  Boolean(String(props.item.id || '').trim() && String(props.item.name || '').trim())
)
const hasPriceOptions = computed(() => priceOptions.value.length > 0)
const startingPrice = computed(() => {
  if (!orderDataValid.value) return 0

  if (!hasPriceOptions.value) {
    return menuOrderPositivePrice(props.item.price) ? Number(props.item.price) : 0
  }

  return Math.min(...priceOptions.value.map(({ price }) => Number(price)))
})
const itemPrice = computed(() => formatPrice(startingPrice.value))
const canSelect = computed(() =>
  orderDataValid.value && itemIdentityValid.value && startingPrice.value > 0
)
const choicePrompt = computed(() => {
  const choices = priceOptions.value.length
  const extras = addOns.value.length

  if (choices && extras) return 'Choose an option and extras'
  if (choices) return choices > 1 ? 'Choose an option' : 'View option'
  if (extras) return 'Choose optional extras'

  return 'Choose quantity'
})

watch(
  () => props.item.imageUrl,
  () => {
    failedImageUrl.value = ''
  }
)

function selectItem(event: MouseEvent) {
  if (!canSelect.value) return
  const trigger = event.currentTarget

  if (trigger instanceof HTMLButtonElement) emit('select', trigger)
}

function hideImage() {
  failedImageUrl.value = itemImageUrl.value
}

function formatPrice(price: number) {
  return formatCurrencyAmount(price, {
    currencyCode: props.currencyCode,
    format: 'code',
  })
}
</script>

<style scoped>
.menu-order-item {
  border-bottom: 1px solid color-mix(in srgb, var(--menu-text) 12%, transparent);
}

.menu-order-item__button {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 1rem;
  width: 100%;
  padding: 1.25rem 0;
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
  font: inherit;
  text-align: left;
}

.menu-order-item--with-image .menu-order-item__button {
  grid-template-columns: 5rem minmax(0, 1fr);
}

.menu-order-item__button:focus-visible {
  border-radius: 0.3rem;
  outline: 2px solid var(--menu-primary);
  outline-offset: 0.25rem;
}

.menu-order-item__button:disabled {
  cursor: not-allowed;
  opacity: 0.65;
}

.menu-order-item__image {
  display: block;
  width: 5rem;
  height: 5rem;
  border-radius: 0.75rem;
  object-fit: cover;
}

.menu-order-item__copy {
  display: grid;
  gap: 0.45rem;
  min-width: 0;
}

.menu-order-item__heading {
  display: grid;
  grid-template-columns: minmax(0, 1fr) max-content;
  gap: 1rem;
  align-items: baseline;
}

.menu-order-item__heading > strong {
  min-width: 0;
  color: var(--menu-title);
  font-family: var(--menu-title-font);
  font-size: 1.075rem;
  font-weight: 800;
  line-height: 1.35;
  overflow-wrap: anywhere;
}

.menu-order-item__price {
  display: inline-flex;
  align-items: baseline;
  gap: 0.3rem;
  color: var(--menu-primary);
  font-size: 0.92rem;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.menu-order-item__price small {
  color: var(--menu-muted);
  font-size: 0.66rem;
  font-weight: 850;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.menu-order-item__description {
  color: var(--menu-muted);
  font-size: 0.9rem;
  line-height: 1.55;
  overflow-wrap: anywhere;
  white-space: pre-line;
}

.menu-order-item__prompt {
  display: inline-flex;
  gap: 0.35rem;
  align-items: center;
  margin-top: 0.15rem;
  color: var(--menu-primary);
  font-size: 0.75rem;
  font-weight: 850;
}

.menu-order-item__unavailable-label {
  color: var(--menu-muted);
  font-size: 0.75rem;
  font-weight: 800;
  white-space: nowrap;
}

@media (max-width: 520px) {
  .menu-order-item--with-image .menu-order-item__button {
    grid-template-columns: 4rem minmax(0, 1fr);
  }

  .menu-order-item__image {
    width: 4rem;
    height: 4rem;
  }
}

@media (max-width: 420px) {
  .menu-order-item--with-image .menu-order-item__heading {
    grid-template-columns: minmax(0, 1fr);
    gap: 0.25rem;
  }

  .menu-order-item--with-image .menu-order-item__price {
    justify-self: start;
  }
}
</style>
