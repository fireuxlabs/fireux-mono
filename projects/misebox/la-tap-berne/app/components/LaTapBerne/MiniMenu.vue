<template>
  <nav class="latap-mini-menu" aria-label="Venue shortcuts">
    <NuxtLink
      v-for="item in miniMenuItems"
      :key="item.to"
      class="latap-mini-menu__button"
      :class="{ 'latap-mini-menu__button--active': isActive(item.to) }"
      :to="item.to"
      :aria-label="item.label"
    >
      <UIcon :name="item.icon" />
    </NuxtLink>
  </nav>
</template>

<script setup lang="ts">
import { useRoute } from '#imports'

const route = useRoute()

const miniMenuItems = [
  { label: 'Home', icon: 'i-ph-house', to: '/home' },
  { label: 'Location', icon: 'i-ph-map-pin', to: '/location' },
  { label: 'Menu', icon: 'i-ph-fork-knife', to: '/' },
  { label: 'Gallery', icon: 'i-ph-camera', to: '/gallery' },
  { label: 'Information', icon: 'i-ph-info', to: '/info' },
] as const

const normalizePath = (value: string) => value.replace(/\/+$/, '') || '/'
const isActive = (to: string) => normalizePath(route.path) === normalizePath(to)
</script>

<style scoped>
.latap-mini-menu {
  position: fixed;
  inset-inline: 0;
  bottom: clamp(5.5rem, 10vw, 7.5rem);
  z-index: 20;
  display: flex;
  justify-content: center;
  gap: clamp(0.45rem, 1.5vw, 0.8rem);
  pointer-events: auto;
}

.latap-mini-menu__button {
  display: grid;
  width: 3.1rem;
  height: 3.1rem;
  padding: 0;
  border: 1px solid color-mix(in srgb, var(--brand-canvas) 58%, transparent);
  border-radius: 1rem;
  background: color-mix(in srgb, var(--brand-ink) 18%, transparent);
  color: var(--brand-canvas);
  cursor: pointer;
  place-items: center;
  box-shadow: 0 0.85rem 2rem rgb(42 14 7 / 22%);
  text-decoration: none;
  backdrop-filter: blur(16px);
  transition:
    border-color 180ms ease,
    background 180ms ease,
    transform 180ms ease;
}

.latap-mini-menu__button:hover,
.latap-mini-menu__button--active {
  border-color: color-mix(in srgb, var(--brand-canvas) 80%, transparent);
  background: color-mix(in srgb, var(--brand-ink) 26%, transparent);
  transform: translateY(-2px);
}

.latap-mini-menu__button :deep(.iconify) {
  width: 1.3rem;
  height: 1.3rem;
}

@media (max-width: 720px) {
  .latap-mini-menu {
    bottom: clamp(5.75rem, 18vw, 7rem);
  }

  .latap-mini-menu__button {
    width: 2.85rem;
    height: 2.85rem;
  }
}
</style>
