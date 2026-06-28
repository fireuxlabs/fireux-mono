<template>
  <footer class="menu-basket" aria-live="polite">
    <button
      type="button"
      class="menu-basket__button"
      :disabled="pending"
      :aria-label="basketLabel"
      @click="$emit('place')"
    >
      <UIcon
        name="i-lucide-shopping-basket"
        class="menu-basket__icon"
        aria-hidden="true"
      />
    </button>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    quantity: number
    pending?: boolean
    actionLabel?: string
  }>(),
  {
    actionLabel: 'Place order',
    pending: false,
  }
)

defineEmits<{
  (event: 'place'): void
}>()

const basketLabel = computed(() => {
  const count = Math.max(0, Number(props.quantity || 0))
  const countLabel = count
    ? `${count} item${count === 1 ? '' : 's'} selected`
    : 'No items selected'

  return `${props.actionLabel}. ${countLabel}.`
})
</script>

<style scoped>
.menu-basket {
  width: auto;
}

.menu-basket__button {
  position: relative;
  display: inline-grid;
  width: 4rem;
  height: 4rem;
  align-items: center;
  justify-items: center;
  padding: 0;
  border: 1px solid color-mix(in srgb, var(--menu-text) 16%, transparent);
  border-radius: 999px;
  background: var(--menu-primary);
  color: var(--menu-bg);
  cursor: pointer;
  font: inherit;
  box-shadow: 0 1rem 2.5rem color-mix(in srgb, var(--menu-text) 22%, transparent);
  transition:
    transform 160ms ease,
    box-shadow 160ms ease,
    opacity 160ms ease;
}

.menu-basket__button:hover {
  box-shadow: 0 1.25rem 3rem color-mix(in srgb, var(--menu-text) 26%, transparent);
  transform: translateY(-1px);
}

.menu-basket__button:disabled {
  cursor: not-allowed;
  opacity: 0.62;
}

.menu-basket__icon {
  width: 1.55rem;
  height: 1.55rem;
}
</style>
