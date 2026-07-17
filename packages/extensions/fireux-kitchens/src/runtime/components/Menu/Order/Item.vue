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
    <div class="menu-order-item__row">
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
          <span v-if="!canSelect" class="menu-order-item__unavailable-label">
            Price unavailable
          </span>
        </span>

        <span v-if="item.description" class="menu-order-item__description">
          {{ item.description }}
        </span>

        <span
          v-if="priceOptions.length"
          class="menu-order-item__variants"
          role="radiogroup"
          :aria-label="`${item.name} options`"
        >
          <button
            v-for="variant in priceOptions"
            :key="variant.id"
            type="button"
            class="menu-order-item__variant"
            :class="{
              'menu-order-item__variant--selected': selectedVariantId === variant.id,
            }"
            role="radio"
            :aria-checked="selectedVariantId === variant.id"
            @click="selectedVariantId = variant.id"
          >
            <span>{{ variant.label }}</span>
            <strong>{{ formatPrice(variant.price) }}</strong>
          </button>
        </span>
      </span>

      <span class="menu-order-item__action">
        <strong
          v-if="actionPriceLabel"
          class="menu-order-item__price"
          :data-menu-item-price-kind="selectedVariant ? 'variant' : 'base'"
        >
          {{ actionPriceLabel }}
        </strong>

        <button
          type="button"
          class="menu-order-item__add"
          :data-menu-action="requiresConfiguration ? 'configure-item' : 'add-item'"
          :aria-label="actionLabel"
          :title="actionLabel"
          :disabled="!canSelect"
          @click="activateItem"
        >
          <UIcon name="i-lucide-plus" aria-hidden="true" />
        </button>
      </span>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { formatCurrencyAmount } from 'fireux-core/runtime/models/core/money.model'
import type { MenuManifestItem } from '../../../models/kitchen/menu/menu-detail.model'
import type { MenuOrderBasketInput } from '../../../composables/fireux/menu/order/useMenuOrderBasket'
import {
  defaultMenuOrderPriceOption,
  menuOrderPositivePrice,
  resolveMenuOrderAddOns,
  resolveMenuOrderPriceOptions,
} from '../../../utils/menu-order-options'

const props = defineProps<{
  currencyCode: string
  item: MenuManifestItem
}>()

const emit = defineEmits<{
  (event: 'select', selection: MenuOrderItemSelection): void
  (event: 'add', input: MenuOrderBasketInput): void
}>()

type MenuOrderItemSelection = {
  trigger: HTMLButtonElement
  variantId?: string
}

const failedImageUrl = ref('')
const selectedVariantId = ref('')
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
const selectedVariant = computed(() => priceOptions.value.find(
  ({ id }) => id === selectedVariantId.value
) || null)
const startingPrice = computed(() => {
  if (!orderDataValid.value) return 0

  if (!hasPriceOptions.value) {
    return menuOrderPositivePrice(props.item.price) ? Number(props.item.price) : 0
  }

  return Math.min(...priceOptions.value.map(({ price }) => Number(price)))
})
const actionPriceLabel = computed(() => {
  const price = selectedVariant.value?.price ?? startingPrice.value

  return formatPrice(price)
})
const canSelect = computed(() =>
  orderDataValid.value && itemIdentityValid.value && startingPrice.value > 0
)
const requiresConfiguration = computed(() =>
  addOns.value.length > 0
)
const actionLabel = computed(() => requiresConfiguration.value
  ? `Choose extras for ${props.item.name}`
  : selectedVariant.value
    ? `Add ${props.item.name}, ${selectedVariant.value.label}, to basket`
    : `Add ${props.item.name} to basket`
)

watch(
  () => props.item.imageUrl,
  () => {
    failedImageUrl.value = ''
  }
)

watch(
  () => props.item,
  () => {
    selectedVariantId.value = defaultMenuOrderPriceOption(
      priceOptions.value
    )?.id || ''
  },
  { immediate: true }
)

function activateItem(event: MouseEvent) {
  if (!canSelect.value) return
  const trigger = event.currentTarget
  if (!(trigger instanceof HTMLButtonElement)) return

  if (requiresConfiguration.value) {
    emit('select', {
      trigger,
      ...(selectedVariant.value ? { variantId: selectedVariant.value.id } : {}),
    })
    return
  }

  emit('add', {
    item: props.item,
    ...(selectedVariant.value ? { variantId: selectedVariant.value.id } : {}),
    addOnIds: [],
    quantity: 1,
  })
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

.menu-order-item__row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) max-content;
  gap: 1rem;
  align-items: center;
  padding: 1.25rem 0;
}

.menu-order-item--with-image .menu-order-item__row {
  grid-template-columns: 5rem minmax(0, 1fr) max-content;
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
  gap: 0.25rem;
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
  color: var(--menu-primary);
  font-size: 0.78rem;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.menu-order-item__description {
  color: var(--menu-muted);
  font-size: 0.9rem;
  line-height: 1.55;
  overflow-wrap: anywhere;
  white-space: pre-line;
}

.menu-order-item__variants {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-top: 0.1rem;
}

.menu-order-item__variant {
  display: inline-flex;
  min-height: 1.85rem;
  align-items: center;
  gap: 0.3rem;
  padding: 0.28rem 0.5rem;
  border: 1px solid color-mix(in srgb, var(--menu-secondary) 28%, transparent);
  border-radius: 999px;
  background: color-mix(in srgb, var(--menu-secondary) 6%, var(--menu-bg));
  color: var(--menu-muted);
  cursor: pointer;
  font: inherit;
  font-size: 0.68rem;
  font-weight: 750;
  line-height: 1.2;
}

.menu-order-item__variant strong {
  color: inherit;
  font-variant-numeric: tabular-nums;
}

.menu-order-item__variant--selected {
  border-color: var(--menu-primary);
  background: var(--menu-primary);
  color: var(--menu-bg);
  box-shadow: 0 0.2rem 0.65rem color-mix(in srgb, var(--menu-primary) 18%, transparent);
}

.menu-order-item__variant:focus-visible {
  outline: 2px solid var(--menu-primary);
  outline-offset: 0.15rem;
}

.menu-order-item__action {
  display: grid;
  gap: 0.4rem;
  justify-items: center;
  align-self: center;
}

.menu-order-item__add {
  display: grid;
  width: 2.75rem;
  height: 2.75rem;
  place-items: center;
  border: 1px solid color-mix(in srgb, var(--menu-primary) 42%, transparent);
  border-radius: 999px;
  background: color-mix(in srgb, var(--menu-primary) 10%, var(--menu-bg));
  color: var(--menu-primary);
  cursor: pointer;
  transition:
    background-color 150ms ease,
    color 150ms ease,
    transform 150ms ease;
}

.menu-order-item__add:hover {
  background: var(--menu-primary);
  color: var(--menu-bg);
  transform: translateY(-1px);
}

.menu-order-item__add:focus-visible {
  outline: 2px solid var(--menu-primary);
  outline-offset: 0.2rem;
}

.menu-order-item__add:disabled {
  cursor: not-allowed;
  opacity: 0.5;
  transform: none;
}

.menu-order-item__add :deep(svg) {
  width: 1.15rem;
  height: 1.15rem;
}

.menu-order-item__unavailable-label {
  color: var(--menu-muted);
  font-size: 0.75rem;
  font-weight: 800;
  white-space: nowrap;
}

@media (max-width: 520px) {
  .menu-order-item--with-image .menu-order-item__row {
    grid-template-columns: 4rem minmax(0, 1fr) max-content;
  }

  .menu-order-item__image {
    width: 4rem;
    height: 4rem;
  }
}

</style>
