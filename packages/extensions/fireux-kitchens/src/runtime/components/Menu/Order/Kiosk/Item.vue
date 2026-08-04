<!-- Concurrent edit — 2026-07-22 11:58 CEST — Out-of-box Kiosk design: balance image and image-free cards without fake media. -->
<template>
  <article
    class="menu-order-kiosk-item"
    :class="{
      'menu-order-kiosk-item--unavailable': !canSelect,
      'menu-order-kiosk-item--without-media': !itemImageUrl,
    }"
    data-menu-item="true"
    :data-menu-item-id="item.id"
    data-menu-item-mode="selectable"
  >
    <div v-if="itemImageUrl" class="menu-order-kiosk-item__media">
      <img
        :src="itemImageUrl"
        :alt="item.name"
        width="320"
        height="240"
        loading="lazy"
        decoding="async"
        @error="hideImage"
      >
    </div>

    <div class="menu-order-kiosk-item__body">
      <div class="menu-order-kiosk-item__copy">
        <h3>{{ item.name }}</h3>
        <p v-if="item.description">{{ item.description }}</p>
        <span v-if="!canSelect" class="menu-order-kiosk-item__unavailable-label">
          Price unavailable
        </span>
      </div>

      <div
        v-if="priceOptions.length"
        class="menu-order-kiosk-item__variants"
        role="radiogroup"
        :aria-label="`${item.name} options`"
      >
        <button
          v-for="variant in priceOptions"
          :key="variant.id"
          type="button"
          :class="{
            'menu-order-kiosk-item__variant--selected':
              selectedVariantId === variant.id,
          }"
          role="radio"
          :aria-checked="selectedVariantId === variant.id"
          @click="selectedVariantId = variant.id"
        >
          <span>{{ variant.label }}</span>
          <strong>{{ formatPrice(variant.price) }}</strong>
        </button>
      </div>

      <button
        type="button"
        class="menu-order-kiosk-item__add"
        :data-menu-action="requiresConfiguration ? 'configure-item' : 'add-item'"
        :aria-label="actionLabel"
        :disabled="!canSelect"
        @click="activateItem"
      >
        <span>
          {{ requiresConfiguration ? 'Extras' : 'Add' }}
        </span>
        <strong v-if="actionPriceLabel">{{ actionPriceLabel }}</strong>
      </button>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { formatCurrencyAmount } from 'fireux-core/runtime/models/utils/money.model'
import type { MenuManifestItem } from '../../../../models/kitchen/menu/menu-detail.model'
import type { MenuOrderBasketInput } from '../../../../composables/fireux/menu/order/useMenuOrderBasket'
import {
  defaultMenuOrderPriceOption,
  menuOrderPositivePrice,
  resolveMenuOrderAddOns,
  resolveMenuOrderPriceOptions,
} from '../../../../utils/menu-order-options'

type MenuOrderItemSelection = {
  trigger: HTMLButtonElement
  variantId?: string
}

const props = defineProps<{
  currencyCode: string
  item: MenuManifestItem
}>()

const emit = defineEmits<{
  (event: 'select', selection: MenuOrderItemSelection): void
  (event: 'add', input: MenuOrderBasketInput): void
}>()

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
const itemIdentityValid = computed(() => Boolean(
  String(props.item.id || '').trim() && String(props.item.name || '').trim()
))
const selectedVariant = computed(() => priceOptions.value.find(
  ({ id }) => id === selectedVariantId.value
) || null)
const startingPrice = computed(() => {
  if (!orderDataValid.value) return 0
  if (!priceOptions.value.length) {
    return menuOrderPositivePrice(props.item.price) ? Number(props.item.price) : 0
  }

  return Math.min(...priceOptions.value.map(({ price }) => Number(price)))
})
const actionPriceLabel = computed(() => formatPrice(
  selectedVariant.value?.price ?? startingPrice.value
))
const canSelect = computed(() =>
  orderDataValid.value && itemIdentityValid.value && startingPrice.value > 0
)
const requiresConfiguration = computed(() => addOns.value.length > 0)
const actionLabel = computed(() => requiresConfiguration.value
  ? `Choose extras for ${props.item.name}`
  : selectedVariant.value
    ? `Add ${props.item.name}, ${selectedVariant.value.label}, to basket`
    : `Add ${props.item.name} to basket`
)

watch(() => props.item.imageUrl, () => {
  failedImageUrl.value = ''
})

watch(() => props.item, () => {
  selectedVariantId.value = defaultMenuOrderPriceOption(
    priceOptions.value
  )?.id || ''
}, { immediate: true })

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
.menu-order-kiosk-item {
  --kiosk-item-bg: var(--menu-bg, var(--ui-bg));
  --kiosk-item-text: var(--menu-text, var(--ui-text));
  --kiosk-item-title: var(--menu-title, var(--ui-text-highlighted));
  --kiosk-item-muted: var(--menu-muted, var(--ui-text-muted));
  --kiosk-item-primary: var(--menu-primary, var(--ui-primary));
  --kiosk-item-secondary: var(--menu-secondary, var(--ui-secondary));

  display: grid;
  height: 100%;
  min-width: 0;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--kiosk-item-text) 14%, transparent);
  border-radius: var(--menu-radius-control);
  background: color-mix(in srgb, var(--kiosk-item-bg) 96%, var(--kiosk-item-primary));
  box-shadow: 0 0.8rem 2.2rem color-mix(in srgb, var(--kiosk-item-text) 5%, transparent);
  color: var(--kiosk-item-text);
}

.menu-order-kiosk-item__media {
  display: grid;
  aspect-ratio: 1;
  min-height: 0;
  place-items: center;
  overflow: hidden;
  border-bottom: 1px solid color-mix(in srgb, var(--kiosk-item-text) 9%, transparent);
}

.menu-order-kiosk-item__media img {
  display: block;
  width: 100%;
  height: 100%;
  padding: clamp(0.65rem, 3vw, 1.4rem);
  object-fit: contain;
}

.menu-order-kiosk-item__body,
.menu-order-kiosk-item__copy {
  display: grid;
}

.menu-order-kiosk-item__body {
  min-height: 10rem;
  gap: 0.8rem;
  padding: clamp(0.9rem, 1.7vw, 1.15rem);
}

.menu-order-kiosk-item__copy {
  gap: 0.35rem;
}

.menu-order-kiosk-item__copy p {
  display: -webkit-box;
  margin: 0;
  overflow: hidden;
  color: var(--kiosk-item-muted);
  font-size: clamp(0.78rem, 1.2vw, 0.9rem);
  line-height: 1.35;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}

.menu-order-kiosk-item h3 {
  margin: 0;
}

.menu-order-kiosk-item h3 {
  display: -webkit-box;
  overflow: hidden;
  color: var(--kiosk-item-title);
  font-family: var(--menu-title-font, inherit);
  font-size: clamp(1.15rem, 2vw, 1.4rem);
  font-weight: var(--font-weight-black);
  line-height: 1.15;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.menu-order-kiosk-item__variants {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
}

.menu-order-kiosk-item__variants button {
  display: inline-grid;
  min-height: 2.5rem;
  padding: 0.45rem 0.65rem;
  border: 1px solid color-mix(in srgb, var(--kiosk-item-text) 16%, transparent);
  border-radius: calc(var(--ui-radius) * 3);
  background: var(--kiosk-item-bg);
  color: var(--kiosk-item-muted);
  cursor: pointer;
  font: inherit;
  font-size: 0.7rem;
  line-height: 1.2;
  text-align: left;
}

.menu-order-kiosk-item__variants button strong {
  color: inherit;
  font-variant-numeric: tabular-nums;
}

.menu-order-kiosk-item__variants .menu-order-kiosk-item__variant--selected {
  border-color: var(--kiosk-item-primary);
  background: color-mix(in srgb, var(--kiosk-item-primary) 11%, var(--kiosk-item-bg));
  color: var(--kiosk-item-primary);
}

.menu-order-kiosk-item__variants button:focus-visible,
.menu-order-kiosk-item__add:focus-visible {
  outline: 3px solid var(--kiosk-item-primary);
  outline-offset: 0.18rem;
}

.menu-order-kiosk-item__add {
  display: flex;
  min-height: 2.75rem;
  align-items: center;
  justify-content: space-between;
  gap: calc(var(--spacing) * 3);
  margin-top: auto;
  padding: 0.55rem 0;
  border: 0;
  border-top: 1px solid color-mix(in srgb, var(--kiosk-item-text) 10%, transparent);
  border-radius: 0;
  background: transparent;
  color: var(--kiosk-item-primary);
  cursor: pointer;
  font: inherit;
  font-weight: var(--font-weight-black);
}

.menu-order-kiosk-item__add > span {
  display: inline-flex;
  min-width: 0;
  align-items: center;
  gap: calc(var(--spacing) * 2);
}

.menu-order-kiosk-item__add > strong {
  flex: 0 0 auto;
  font-size: 0.82rem;
  font-variant-numeric: tabular-nums;
}

.menu-order-kiosk-item__add:disabled {
  border-color: color-mix(in srgb, var(--kiosk-item-text) 10%, transparent);
  background: transparent;
  color: var(--kiosk-item-muted);
  cursor: not-allowed;
}

.menu-order-kiosk-item__unavailable-label {
  color: var(--kiosk-item-muted);
  font-size: 0.72rem;
  font-weight: var(--font-weight-extrabold);
}

.menu-order-kiosk-item--unavailable {
  opacity: 0.66;
}

.menu-order-kiosk-item--without-media {
  position: relative;
  min-height: clamp(18rem, 29vw, 24rem);
  overflow: hidden;
  background:
    radial-gradient(circle at 105% -5%, color-mix(in srgb, var(--kiosk-item-primary) 17%, transparent) 0 7rem, transparent 7.1rem),
    radial-gradient(circle at -5% 105%, color-mix(in srgb, var(--kiosk-item-secondary) 10%, transparent) 0 5rem, transparent 5.1rem),
    color-mix(in srgb, var(--kiosk-item-bg) 95%, var(--kiosk-item-primary));
}

.menu-order-kiosk-item--without-media .menu-order-kiosk-item__body {
  min-height: 100%;
  align-content: end;
  padding-top: clamp(
    calc(var(--spacing) * 16),
    10vw,
    calc(var(--spacing) * 32)
  );
}

.menu-order-kiosk-item--without-media h3 {
  font-size: clamp(1.35rem, 2.6vw, 1.8rem);
}
</style>
