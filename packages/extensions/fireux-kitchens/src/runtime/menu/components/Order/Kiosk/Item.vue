<!-- Concurrent edit — 2026-07-22 11:58 CEST — Out-of-box Kiosk design: balance image and image-free cards without fake media. -->
<template>
  <article
    class="menu-order-kiosk-item"
    :class="{
      'menu-order-kiosk-item--unavailable': !canSelect,
      'menu-order-kiosk-item--without-media': !itemImageUrl,
    }"
    :data-menu-item-media-fit="mediaFit"
    data-menu-item="true"
    :data-menu-item-id="item.id"
    data-menu-item-mode="selectable"
  >
    <div class="menu-order-kiosk-item__media">
      <img
        v-if="itemImageUrl"
        :src="itemImageUrl"
        :alt="item.name"
        width="320"
        height="240"
        loading="lazy"
        decoding="async"
        @error="hideImage"
      >
      <span v-else class="menu-order-kiosk-item__media-fallback" aria-hidden="true">
        <UIcon :name="item.itemKind === 'drink' ? 'i-lucide-cup-soda' : 'i-lucide-utensils'" />
      </span>
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
        data-menu-action="view-item"
        :aria-label="actionLabel"
        :disabled="!canSelect"
        @click="activateItem"
      >
        <span>
          View
        </span>
        <strong v-if="actionPriceLabel">{{ actionPriceLabel }}</strong>
      </button>
    </div>
  </article>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { formatCurrencyAmount } from '../../../../utils/currency-display'
import type { MenuManifestItem } from '../../../models/menu-detail.model.ts'
import type { MenuOrderBasketInput } from '../../../composables/order/useMenuOrderBasket'
import {
  defaultMenuOrderPriceOption,
  menuOrderPositivePrice,
  resolveMenuOrderAddOns,
  resolveMenuOrderPriceOptions,
} from '../../../utils/menu-order-options'
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
const mediaFit = computed(() => props.item.itemKind === 'drink' ? 'contain' : 'cover')
const actionLabel = computed(() => `View ${props.item.name} details`)
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
  emit('select', {
    trigger,
    ...(selectedVariant.value ? { variantId: selectedVariant.value.id } : {}),
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
  grid-template-rows: auto minmax(0, 1fr);
  height: 100%;
  min-width: 0;
  padding: clamp(calc(var(--spacing) * 3), 1.5vw, calc(var(--spacing) * 5));
  border: 1px solid color-mix(in srgb, var(--kiosk-item-text) 8%, transparent);
  border-radius: calc(var(--ui-radius) * 3);
  background: color-mix(in srgb, var(--kiosk-item-bg) 78%, transparent);
  box-shadow: 0 0.8rem 2.2rem color-mix(in srgb, var(--kiosk-item-text) 7%, transparent);
  color: var(--kiosk-item-text);
  backdrop-filter: blur(8px);
  animation: kiosk-item-enter 420ms ease-out both;
  transition: border-color 180ms ease, box-shadow 180ms ease, transform 180ms ease;
}
.menu-order-kiosk-item:hover,
.menu-order-kiosk-item:focus-within {
  border-color: color-mix(in srgb, var(--kiosk-item-primary) 34%, transparent);
  box-shadow: 0 1rem 2.8rem color-mix(in srgb, var(--kiosk-item-primary) 12%, transparent);
  transform: translateY(-0.18rem);
}
.menu-order-kiosk-item__media {
  display: grid;
  width: 94%;
  aspect-ratio: 1;
  min-height: 0;
  justify-self: center;
  place-items: center;
  overflow: visible;
  border: 0;
}
.menu-order-kiosk-item__media img {
  display: block;
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 1.1rem 1.4rem color-mix(in srgb, var(--kiosk-item-text) 22%, transparent));
  object-fit: contain;
  transition: filter 180ms ease, transform 220ms ease;
}
.menu-order-kiosk-item:hover .menu-order-kiosk-item__media img,
.menu-order-kiosk-item:focus-within .menu-order-kiosk-item__media img {
  filter: drop-shadow(0 1.35rem 1.6rem color-mix(in srgb, var(--kiosk-item-primary) 24%, transparent));
  transform: scale(1.035) rotate(-0.4deg);
}
.menu-order-kiosk-item[data-menu-item-media-fit='contain'] .menu-order-kiosk-item__media img {
  padding: clamp(0.65rem, 3vw, 1.4rem);
  object-fit: contain;
}
.menu-order-kiosk-item__media-fallback {
  display: grid;
  width: 5rem;
  height: 5rem;
  place-items: center;
  border-radius: 9999px;
  background: color-mix(in srgb, var(--kiosk-item-primary) 12%, var(--kiosk-item-bg));
  color: var(--kiosk-item-primary);
}
.menu-order-kiosk-item__media-fallback :deep(svg) {
  width: 3.25rem;
  height: 3.25rem;
}
.menu-order-kiosk-item__body,
.menu-order-kiosk-item__copy {
  display: grid;
}
.menu-order-kiosk-item__body {
  min-height: 9rem;
  gap: 0.8rem;
  padding-top: clamp(calc(var(--spacing) * 4), 1.7vw, calc(var(--spacing) * 5));
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
  padding: 0.65rem calc(var(--spacing) * 3);
  border: 0;
  border-radius: var(--menu-radius-control);
  background: var(--kiosk-item-primary);
  color: var(--menu-bg);
  cursor: pointer;
  font: inherit;
  font-weight: var(--font-weight-black);
  transition: filter 160ms ease, transform 160ms ease;
}
.menu-order-kiosk-item__add:hover:not(:disabled) {
  filter: brightness(1.08);
  transform: translateY(-1px);
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
  background: color-mix(in srgb, var(--kiosk-item-text) 8%, transparent);
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
  border: 1px dashed color-mix(in srgb, var(--kiosk-item-text) 18%, transparent);
  border-radius: var(--menu-radius-control);
  background: color-mix(in srgb, var(--kiosk-item-bg) 78%, transparent);
}
.menu-order-kiosk-item--without-media .menu-order-kiosk-item__body {
  min-height: 10rem;
  padding-inline: calc(var(--spacing) * 4);
}
.menu-order-kiosk-item--without-media h3 {
  font-size: clamp(1.35rem, 2.6vw, 1.8rem);
}
@keyframes kiosk-item-enter {
  from {
    opacity: 0;
    transform: translateY(0.8rem) scale(0.98);
  }
}
@media (prefers-reduced-motion: reduce) {
  .menu-order-kiosk-item {
    animation: none;
    transition: none;
  }
  .menu-order-kiosk-item__media img,
  .menu-order-kiosk-item__add {
    transition: none;
  }
}
</style>
