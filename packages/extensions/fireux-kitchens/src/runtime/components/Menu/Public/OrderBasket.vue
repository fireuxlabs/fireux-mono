<template>
  <footer class="menu-basket" aria-live="polite">
    <div class="menu-basket__copy">
      <p>{{ quantity }} item{{ quantity === 1 ? '' : 's' }}</p>
      <span>Ready to send to the kitchen.</span>
    </div>

    <div class="menu-basket__actions">
      <UButton
        size="sm"
        color="neutral"
        variant="ghost"
        @click="$emit('clear')"
      >
        Clear
      </UButton>
      <UButton
        size="sm"
        :loading="pending"
        @click="$emit('place')"
      >
        Place order
      </UButton>
    </div>
  </footer>
</template>

<script setup lang="ts">
defineProps<{
  quantity: number
  pending?: boolean
}>()

defineEmits<{
  (event: 'clear'): void
  (event: 'place'): void
}>()
</script>

<style scoped>
.menu-basket {
  position: sticky;
  bottom: 1rem;
  display: flex;
  gap: 1rem;
  align-items: center;
  justify-content: space-between;
  width: min(44rem, calc(100% - 1rem));
  margin: 0 auto;
  padding: 0.85rem;
  border: 1px solid color-mix(in srgb, var(--menu-text) 16%, transparent);
  border-radius: 1.25rem;
  background: color-mix(in srgb, var(--menu-bg) 88%, transparent);
  box-shadow: 0 1.25rem 4rem color-mix(in srgb, var(--menu-text) 18%, transparent);
  backdrop-filter: blur(20px);
}

.menu-basket__copy,
.menu-basket__actions {
  display: grid;
}

.menu-basket__copy {
  gap: 0.1rem;
  text-align: left;
}

.menu-basket__copy p,
.menu-basket__copy span {
  margin: 0;
}

.menu-basket__copy p {
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
}

@media (max-width: 640px) {
  .menu-basket {
    align-items: stretch;
    flex-direction: column;
  }

  .menu-basket__actions {
    grid-auto-flow: row;
  }
}
</style>
