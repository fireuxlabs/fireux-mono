<template>
  <nav class="menu-browse-surface-rail" aria-label="Order options">
    <NuxtLink
      v-for="option in options"
      :key="option.value"
      :to="option.to"
      class="menu-browse-surface-rail__link"
      :data-menu-browse-option="option.value"
    >
      {{ option.label }}
      <UIcon name="i-lucide-arrow-right" aria-hidden="true" />
    </NuxtLink>
  </nav>
</template>

<script setup lang="ts">
import type { GuestMenuSurfaceOption } from '../../../utils/menu-context'

defineProps<{
  options: GuestMenuSurfaceOption[]
}>()
</script>

<style scoped>
.menu-browse-surface-rail {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.65rem;
  width: min(100%, 48rem);
  margin: 0 auto;
}

.menu-browse-surface-rail__link {
  display: inline-flex;
  min-height: 2.65rem;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.6rem 0.9rem;
  border: 1px solid color-mix(in srgb, var(--menu-primary) 36%, transparent);
  border-radius: var(--menu-radius-control);
  background: color-mix(in srgb, var(--menu-bg) 90%, var(--menu-primary));
  color: var(--menu-primary);
  font-size: 0.82rem;
  font-weight: 900;
  text-decoration: none;
  transition:
    border-color 150ms ease,
    background-color 150ms ease,
    color 150ms ease,
    transform 150ms ease;
}

.menu-browse-surface-rail__link:hover {
  border-color: var(--menu-primary);
  background: var(--menu-primary);
  color: var(--menu-bg);
  transform: translateY(-1px);
}

.menu-browse-surface-rail__link:focus-visible {
  outline: 2px solid var(--menu-primary);
  outline-offset: 0.2rem;
}

.menu-browse-surface-rail__link :deep(svg) {
  width: 0.9rem;
  height: 0.9rem;
}

@media (max-width: 30rem) {
  .menu-browse-surface-rail__link {
    flex: 1 1 calc(50% - 0.65rem);
  }
}
</style>
