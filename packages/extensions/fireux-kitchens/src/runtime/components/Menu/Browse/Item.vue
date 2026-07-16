<template>
  <article
    class="menu-browse-item"
    :class="{ 'menu-browse-item--with-image': item.imageUrl }"
  >
    <img
      v-if="item.imageUrl"
      :src="item.imageUrl"
      alt=""
      class="menu-browse-item__image"
      loading="lazy"
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
        <h4>Choose one</h4>
        <ul>
          <li v-for="option in item.priceOptions" :key="option.id">
            <span>{{ option.label }}</span>
            <span>{{ formatPrice(option.price) }}</span>
          </li>
        </ul>
      </div>

      <div v-if="item.addOns.length" class="menu-browse-item__options">
        <h4>Optional extras</h4>
        <ul>
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
import { computed } from 'vue'
import { formatCurrencyAmount } from 'fireux-core/runtime/models/core/money.model'
import type { MenuManifestItem } from '../../../models/kitchen/menu/menu-detail.model'

const props = defineProps<{
  currencyCode: string
  item: MenuManifestItem
}>()

const itemPrice = computed(() =>
  props.item.priceOptions.length ? '' : formatPrice(props.item.price)
)

function formatPrice(price: number) {
  return formatCurrencyAmount(price, {
    currencyCode: props.currencyCode,
    format: 'code',
  })
}

function addOnPrice(price: number) {
  return price > 0 ? `+ ${formatPrice(price)}` : 'Included'
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
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.menu-browse-item h3 {
  margin: 0;
  color: var(--menu-title);
  font-family: var(--menu-title-font);
  font-size: 1.05rem;
  line-height: 1.35;
}

.menu-browse-item__price {
  flex: 0 0 auto;
  color: var(--menu-text);
  font-size: 0.9rem;
  font-weight: 800;
}

.menu-browse-item__description {
  margin: 0.45rem 0 0;
  color: var(--menu-muted);
  font-size: 0.9rem;
  line-height: 1.55;
  white-space: pre-line;
}

.menu-browse-item__options {
  margin-top: 0.9rem;
}

.menu-browse-item__options h4 {
  margin: 0 0 0.35rem;
  color: var(--menu-dimmed);
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

.menu-browse-item__options li span:last-child {
  flex: 0 0 auto;
  color: var(--menu-text);
  font-weight: 750;
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
