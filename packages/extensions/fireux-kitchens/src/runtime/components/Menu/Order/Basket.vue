<template>
  <footer class="menu-basket" aria-live="polite">
    <button
      type="button"
      class="menu-basket__summary"
      :aria-expanded="isOpen"
      @click="isOpen = !isOpen"
    >
      <span class="menu-basket__copy">
        <strong>{{ quantity }} item{{ quantity === 1 ? '' : 's' }}</strong>
        <span>Ready to send to the kitchen.</span>
      </span>
      <UIcon
        :name="isOpen ? 'i-lucide-chevron-down' : 'i-lucide-chevron-up'"
        class="size-4"
      />
    </button>

    <div v-if="isOpen" class="menu-basket__items">
      <div
        v-for="item in items"
        :key="item.id"
        class="menu-basket__item"
      >
        <span>{{ item.quantity }}x</span>
        <p>{{ item.name }}</p>
      </div>
    </div>

    <div class="menu-basket__actions">
      <button
        type="button"
        class="menu-basket__button menu-basket__button--ghost"
        :disabled="pending"
        @click="$emit('clear')"
      >
        Clear
      </button>
      <button
        type="button"
        class="menu-basket__button menu-basket__button--primary"
        :disabled="pending"
        @click="$emit('place')"
      >
        {{ pending ? 'Sending...' : 'Place order' }}
      </button>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { ref } from 'vue'

type MenuBasketItem = {
  id: string
  name: string
  quantity: number
}

withDefaults(
  defineProps<{
    quantity: number
    items?: MenuBasketItem[]
    pending?: boolean
  }>(),
  {
    items: () => [],
  }
)

defineEmits<{
  (event: 'clear'): void
  (event: 'place'): void
}>()

const isOpen = ref(false)
</script>

<style scoped>
.menu-basket {
  position: sticky;
  bottom: 1rem;
  display: grid;
  gap: 1rem;
  align-items: center;
  width: min(44rem, calc(100% - 1rem));
  margin: 0 auto;
  padding: 0.85rem;
  border: 1px solid color-mix(in srgb, var(--menu-text) 16%, transparent);
  border-radius: 1.25rem;
  background: color-mix(in srgb, var(--menu-bg) 88%, transparent);
  box-shadow: 0 1.25rem 4rem color-mix(in srgb, var(--menu-text) 18%, transparent);
  backdrop-filter: blur(20px);
}

.menu-basket__summary {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  justify-content: space-between;
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
  font: inherit;
  text-align: left;
}

.menu-basket__copy,
.menu-basket__actions,
.menu-basket__items {
  display: grid;
}

.menu-basket__copy {
  gap: 0.1rem;
  text-align: left;
}

.menu-basket__copy span {
  margin: 0;
}

.menu-basket__copy strong {
  color: var(--menu-title);
  font-weight: 900;
}

.menu-basket__copy span {
  color: var(--menu-muted);
  font-size: 0.82rem;
  font-weight: 700;
}

.menu-basket__actions {
  grid-auto-flow: column;
  gap: 0.45rem;
  justify-content: end;
}

.menu-basket__button {
  appearance: none;
  min-height: 2.25rem;
  padding: 0.48rem 0.85rem;
  border: 1px solid transparent;
  border-radius: 999px;
  cursor: pointer;
  font: inherit;
  font-size: 0.82rem;
  font-weight: 850;
  transition:
    background-color 160ms ease,
    border-color 160ms ease,
    color 160ms ease,
    opacity 160ms ease;
}

.menu-basket__button:disabled {
  cursor: not-allowed;
  opacity: 0.62;
}

.menu-basket__button--ghost {
  border-color: color-mix(in srgb, var(--menu-primary) 28%, transparent);
  background: color-mix(in srgb, var(--menu-primary) 6%, transparent);
  color: var(--menu-primary);
}

.menu-basket__button--primary {
  background: var(--menu-primary);
  color: var(--menu-bg);
}

.menu-basket__items {
  gap: 0.45rem;
  padding-top: 0.25rem;
  border-top: 1px solid color-mix(in srgb, var(--menu-text) 12%, transparent);
}

.menu-basket__item {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 0.5rem;
  align-items: start;
  color: var(--menu-title);
  font-size: 0.88rem;
  font-weight: 800;
  text-align: left;
}

.menu-basket__item p {
  margin: 0;
  color: var(--menu-muted);
  font-weight: 700;
}

@media (max-width: 640px) {
  .menu-basket__actions {
    grid-auto-flow: row;
    justify-content: stretch;
  }
}
</style>
