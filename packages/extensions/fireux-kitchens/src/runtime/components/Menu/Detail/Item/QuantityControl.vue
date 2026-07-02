<template>
  <div class="menu-item__quantity">
    <template v-if="quantity">
      <button
        type="button"
        class="menu-item__quantity-button"
        :aria-label="`Remove ${label}`"
        @click="$emit('remove')"
      >
        <UIcon name="i-lucide-minus" aria-hidden="true" />
      </button>
      <span>{{ quantity }}</span>
    </template>

    <button
      type="button"
      class="menu-item__quantity-button"
      :aria-label="`Add ${label}`"
      @click="$emit('add')"
    >
      <UIcon name="i-lucide-plus" aria-hidden="true" />
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string
  quantity: number
}>()

defineEmits<{
  (event: 'add'): void
  (event: 'remove'): void
}>()
</script>

<style scoped>
.menu-item__quantity {
  display: inline-flex;
  gap: var(--menu-space-xs);
  align-items: center;
}

.menu-item__quantity-button {
  display: inline-grid;
  width: 1.75rem;
  height: 1.75rem;
  place-items: center;
  border: 1px solid color-mix(in srgb, var(--menu-primary) 42%, transparent);
  border-radius: var(--menu-radius-control);
  background: color-mix(in srgb, var(--menu-primary) 14%, var(--menu-bg));
  color: var(--menu-primary);
  cursor: pointer;
  font: inherit;
}

.menu-item__quantity-button:hover {
  background: color-mix(in srgb, var(--menu-primary) 24%, var(--menu-bg));
}

.menu-item__quantity span {
  min-width: 1.5rem;
  color: var(--menu-primary);
  font-size: 0.9rem;
  font-weight: 900;
  text-align: center;
}
</style>
