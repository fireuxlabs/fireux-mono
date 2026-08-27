<template>
  <div class="app-launcher" role="list">
    <NuxtLink
      v-for="app in apps"
      :key="app.to || app.id"
      :to="app.to"
      class="app-launcher__app"
      role="listitem"
    >
      <span class="app-launcher__icon">
        <img
          v-if="app.thumbnailUrl || app.logoUrl"
          :src="app.thumbnailUrl || app.logoUrl"
          :alt="app.displayName"
          class="app-launcher__image"
        />
        <span v-else class="app-launcher__fallback" aria-hidden="true">
          {{ app.avatarText }}
        </span>
      </span>
      <span class="app-launcher__name">{{ app.displayName }}</span>
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
import type { AppCard } from '../../composables/useAppInterface'

defineProps<{
  apps: AppCard.Card[]
}>()
</script>

<style scoped>
.app-launcher {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(6.5rem, 1fr));
  gap: calc(var(--spacing) * 7) calc(var(--spacing) * 4);
  align-items: start;
}

.app-launcher__app {
  display: flex;
  min-width: 0;
  flex-direction: column;
  align-items: center;
  gap: calc(var(--spacing) * 2.5);
  color: inherit;
  text-align: center;
  text-decoration: none;
}

.app-launcher__icon {
  display: grid;
  width: clamp(4.75rem, 8vw, 6rem);
  aspect-ratio: 1;
  overflow: hidden;
  place-items: center;
  border: 1px solid color-mix(in srgb, currentColor 10%, transparent);
  border-radius: calc(var(--ui-radius) * 2);
  background: var(--ui-bg-elevated);
  box-shadow:
    0 1px 2px rgb(0 0 0 / 8%),
    0 8px 24px rgb(0 0 0 / 10%);
  transition:
    transform 160ms ease,
    box-shadow 160ms ease;
}

.app-launcher__app:hover .app-launcher__icon,
.app-launcher__app:focus-visible .app-launcher__icon {
  transform: translateY(-2px) scale(1.02);
  box-shadow:
    0 2px 4px rgb(0 0 0 / 10%),
    0 12px 28px rgb(0 0 0 / 14%);
}

.app-launcher__app:focus-visible {
  border-radius: var(--ui-radius);
  outline: 2px solid var(--ui-primary);
  outline-offset: 0.4rem;
}

.app-launcher__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.app-launcher__fallback {
  font-size: var(--text-xl);
  font-weight: var(--font-weight-bold);
}

.app-launcher__name {
  display: -webkit-box;
  max-width: 7.5rem;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  line-height: var(--text-sm--line-height);
}

@media (max-width: 40rem) {
  .app-launcher {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: calc(var(--spacing) * 6) calc(var(--spacing) * 3);
  }
}
</style>
