<template>
  <nav class="menu-surface-rail" aria-label="Menu options">
    <NuxtLink
      v-for="option in options"
      :key="option.value"
      :to="option.to"
      class="menu-surface-rail__link"
      :class="{ 'menu-surface-rail__link--active': option.active }"
      :aria-current="option.active ? 'page' : undefined"
      :data-menu-surface-option="option.value"
    >
      {{ option.label }}
      <UIcon
        :name="option.active ? 'i-lucide-check' : 'i-lucide-arrow-right'"
        aria-hidden="true"
      />
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
.menu-surface-rail {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.65rem;
  width: min(100%, 48rem);
  margin: 0 auto;
}

.menu-surface-rail__link {
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

.menu-surface-rail__link:hover,
.menu-surface-rail__link--active {
  border-color: var(--menu-primary);
  background: var(--menu-primary);
  color: var(--menu-bg);
  transform: translateY(-1px);
}

.menu-surface-rail__link:focus-visible {
  outline: 2px solid var(--menu-primary);
  outline-offset: 0.2rem;
}

.menu-surface-rail__link :deep(svg) {
  width: 0.9rem;
  height: 0.9rem;
}

@media (max-width: 30rem) {
  .menu-surface-rail__link {
    flex: 1 1 calc(50% - 0.65rem);
  }
}
</style>
