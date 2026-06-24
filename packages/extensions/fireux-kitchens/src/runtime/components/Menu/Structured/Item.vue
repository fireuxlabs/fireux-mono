<template>
  <article class="menu-item">
    <div class="menu-item__copy">
      <h3>{{ item.name }}</h3>
      <p
        v-if="orderMode && item.priceLabel"
        class="menu-item__price menu-item__price--inline"
      >
        {{ item.priceLabel }}
      </p>
      <p v-if="item.description">
        {{ item.description }}
      </p>
    </div>

    <div
      v-if="item.priceLabel || orderMode"
      class="menu-item__actions"
    >
      <p v-if="!orderMode && item.priceLabel" class="menu-item__price">
        {{ item.priceLabel }}
      </p>

      <div v-if="orderMode" class="menu-quantity">
        <template v-if="quantity">
          <UButton
            size="xs"
            color="neutral"
            variant="soft"
            icon="i-lucide-minus"
            :aria-label="`Remove ${item.name}`"
            @click="$emit('remove', item)"
          />
          <span>{{ quantity }}</span>
        </template>

        <UButton
          size="xs"
          color="neutral"
          variant="soft"
          icon="i-lucide-plus"
          :aria-label="`Add ${item.name}`"
          @click="$emit('add', item)"
        />
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { MenuStructuredItem } from './types'

defineProps<{
  item: MenuStructuredItem
  orderMode?: boolean
  quantity?: number
}>()

defineEmits<{
  (event: 'add', item: MenuStructuredItem): void
  (event: 'remove', item: MenuStructuredItem): void
}>()
</script>

<style scoped>
.menu-item {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 1rem;
  align-items: start;
  padding-bottom: 0.7rem;
  border-bottom: 1px solid color-mix(in srgb, var(--menu-text) 18%, transparent);
}

.menu-item:last-child {
  padding-bottom: 0;
  border-bottom: 0;
}

.menu-item__copy,
.menu-item__actions {
  display: grid;
}

.menu-item__copy {
  gap: 0.2rem;
}

.menu-item__actions {
  gap: 0.45rem;
  justify-items: end;
}

.menu-item h3,
.menu-item p {
  margin: 0;
}

.menu-item h3 {
  font-size: 1.1rem;
  font-weight: 850;
  letter-spacing: -0.03em;
  color: var(--menu-title);
}

.menu-item__copy p {
  color: var(--menu-muted);
  font-size: 0.9rem;
  line-height: 1.35;
}

.menu-item__price {
  color: var(--menu-primary);
  font-size: 0.95rem;
  font-weight: 850;
  white-space: nowrap;
}

.menu-item__price--inline {
  white-space: normal;
}

.menu-quantity {
  display: inline-flex;
  gap: 0.4rem;
  align-items: center;
}

.menu-quantity span {
  min-width: 1.5rem;
  color: var(--menu-primary);
  font-size: 0.9rem;
  font-weight: 900;
  text-align: center;
}
</style>
