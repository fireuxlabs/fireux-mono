<template>
  <div class="menu-order-summary">
    <div>
      <p class="menu-order-summary__eyebrow">
        {{ eyebrow }}
      </p>
      <h2>{{ title }}</h2>
    </div>

    <div class="menu-order-summary__selection">
      <p>
        <strong>{{ totalLabel }}</strong>
        <span>{{ itemCountLabel }}</span>
      </p>

      <button
        type="button"
        class="menu-order-summary__edit"
        aria-label="Edit selected items"
        @click="$emit('edit')"
      >
        Edit
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
// Menu ordering spine: docs/concepts/menu-ordering.md
defineProps<{
  eyebrow: string
  title: string
  totalLabel: string
  itemCountLabel: string
}>()

defineEmits<{
  (event: 'edit'): void
}>()
</script>

<style scoped>
.menu-order-summary {
  display: flex;
  gap: 1rem;
  align-items: start;
  justify-content: space-between;
}

.menu-order-summary__eyebrow,
.menu-order-summary h2 {
  margin: 0;
}

.menu-order-summary__eyebrow {
  color: var(--menu-muted);
  font-size: 0.76rem;
  font-weight: 850;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.menu-order-summary h2 {
  color: var(--menu-title);
  font-size: clamp(1.4rem, 4vw, 2rem);
  font-weight: 950;
  letter-spacing: -0.05em;
}

.menu-order-summary__selection {
  display: grid;
  gap: 0.45rem;
  justify-items: end;
  min-width: max-content;
}

.menu-order-summary__selection p {
  display: grid;
  gap: 0.1rem;
  margin: 0;
  text-align: right;
}

.menu-order-summary__selection strong {
  color: var(--menu-title);
  font-size: 1rem;
  font-weight: 950;
}

.menu-order-summary__selection span {
  color: var(--menu-muted);
  font-size: 0.78rem;
  font-weight: 800;
}

.menu-order-summary__edit {
  min-height: 2rem;
  padding: 0.35rem 0.75rem;
  border: 1px solid color-mix(in srgb, var(--menu-text) 14%, transparent);
  border-radius: 999px;
  background: color-mix(in srgb, var(--menu-bg) 72%, transparent);
  color: var(--menu-text);
  cursor: pointer;
  font: inherit;
  font-size: 0.78rem;
  font-weight: 850;
}

@media (max-width: 640px) {
  .menu-order-summary {
    display: grid;
    gap: 0.85rem;
  }

  .menu-order-summary__selection {
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: space-between;
  }

  .menu-order-summary__selection p {
    text-align: left;
  }

  .menu-order-summary__edit {
    width: 100%;
  }
}
</style>
