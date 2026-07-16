<template>
  <article
    class="menu-browse-item"
    :class="{ 'menu-browse-item--with-image': itemImageUrl }"
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
    >

    <div class="menu-browse-item__copy">
      <div class="menu-browse-item__heading">
        <h3>{{ item.name }}</h3>
        <span v-if="itemPrice" class="menu-browse-item__price">
          {{ itemPrice }}
        </span>
      </div>

      <p v-if="item.description" class="menu-browse-item__description">
        {{ item.description }}
      </p>

      <div v-if="item.priceOptions.length" class="menu-browse-item__options">
        <p class="menu-browse-item__options-label">Available options</p>
        <ul aria-label="Available options">
          <li v-for="option in item.priceOptions" :key="option.id">
            <span>{{ option.label }}</span>
            <span>{{ formatPrice(option.price) }}</span>
          </li>
        </ul>
      </div>

      <div v-if="item.addOns.length" class="menu-browse-item__options">
        <p class="menu-browse-item__options-label">Optional extras</p>
        <ul aria-label="Optional extras">
          <li v-for="addOn in item.addOns" :key="addOn.id">
            <span>{{ addOn.label }}</span>
            <span>{{ addOnPrice(addOn.price) }}</span>
          </li>
        </ul>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { formatCurrencyAmount } from 'fireux-core/runtime/models/core/money.model'
import type { MenuManifestItem } from '../../../models/kitchen/menu/menu-detail.model'

const props = defineProps<{
  currencyCode: string
  item: MenuManifestItem
}>()

const failedImageUrl = ref('')
const itemImageUrl = computed(() => {
  const url = String(props.item.imageUrl || '').trim()

  return url && url !== failedImageUrl.value ? url : ''
})
const itemPrice = computed(() =>
  props.item.priceOptions.length || props.item.price <= 0
    ? ''
    : formatPrice(props.item.price)
)

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
    format: 'code',
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
  gap: 1rem;
  padding: 1.25rem 0;
  border-bottom: 1px solid color-mix(in srgb, var(--menu-text) 12%, transparent);
}

.menu-browse-item--with-image {
  grid-template-columns: 5rem minmax(0, 1fr);
}

.menu-browse-item__image {
  display: block;
  width: 5rem;
  height: 5rem;
  border-radius: 0.75rem;
  object-fit: cover;
}

.menu-browse-item__copy {
  min-width: 0;
}

.menu-browse-item__heading,
.menu-browse-item__options li {
  display: grid;
  grid-template-columns: minmax(0, 1fr) max-content;
  gap: 1rem;
  align-items: baseline;
}

.menu-browse-item h3 {
  min-width: 0;
  margin: 0;
  color: var(--menu-title);
  font-family: var(--menu-title-font);
  font-size: 1.05rem;
  line-height: 1.35;
  overflow-wrap: anywhere;
}

.menu-browse-item__price {
  color: var(--menu-text);
  font-size: 0.9rem;
  font-weight: 800;
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

.menu-browse-item__options {
  margin-top: 0.9rem;
}

.menu-browse-item__options-label {
  margin: 0 0 0.35rem;
  color: var(--menu-muted);
  font-size: 0.72rem;
  font-weight: 850;
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
}

.menu-browse-item__options li span:first-child {
  min-width: 0;
  overflow-wrap: anywhere;
}

.menu-browse-item__options li span:last-child {
  color: var(--menu-text);
  font-weight: 750;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
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
</style>
