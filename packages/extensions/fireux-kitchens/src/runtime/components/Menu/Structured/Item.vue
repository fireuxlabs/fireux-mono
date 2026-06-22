<template>
  <article :class="['manifest-item', { 'manifest-item--order': orderMode }]">
    <div class="manifest-item__copy">
      <h3>{{ item.name }}</h3>
      <p v-if="item.description">
        {{ item.description }}
      </p>
    </div>

    <div
      v-if="item.priceLabel || orderMode"
      class="manifest-item__actions"
    >
      <p v-if="item.priceLabel" class="manifest-item__price">
        {{ item.priceLabel }}
      </p>

      <div v-if="orderMode" class="manifest-quantity">
        <UButton
          size="xs"
          color="neutral"
          variant="soft"
          icon="i-lucide-minus"
          :disabled="quantity === 0"
          :aria-label="`Remove ${item.name}`"
          @click="$emit('remove', item)"
        />
        <span>{{ quantity }}</span>
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
.manifest-item {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 1rem;
  align-items: start;
  padding-bottom: 0.7rem;
  border-bottom: 1px solid color-mix(in srgb, var(--menu-text) 18%, transparent);
}

.manifest-item:last-child {
  padding-bottom: 0;
  border-bottom: 0;
}

.manifest-item__copy,
.manifest-item__actions {
  display: grid;
}

.manifest-item__copy {
  gap: 0.2rem;
}

.manifest-item__actions {
  gap: 0.45rem;
  justify-items: end;
}

.manifest-item h3,
.manifest-item p {
  margin: 0;
}

.manifest-item h3 {
  font-size: 1.1rem;
  font-weight: 850;
  letter-spacing: -0.03em;
}

.manifest-item__copy p {
  color: var(--menu-muted);
  font-size: 0.9rem;
  line-height: 1.35;
}

.manifest-item__price {
  font-size: 0.95rem;
  font-weight: 850;
  white-space: nowrap;
}

.manifest-quantity {
  display: inline-flex;
  gap: 0.4rem;
  align-items: center;
}

.manifest-quantity span {
  min-width: 1.5rem;
  color: var(--menu-title);
  font-size: 0.9rem;
  font-weight: 900;
  text-align: center;
}

.manifest-item--order {
  gap: 0.75rem;
  padding-bottom: 0.45rem;
}
</style>
