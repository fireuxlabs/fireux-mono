<template>
  <nav class="latap-nav" aria-label="Venue shortcuts">
    <NuxtLink
      v-for="item in navItems"
      :key="item.to"
      class="latap-nav__button latap-glass-button"
      :class="{ 'latap-glass-button--active': isActive(item.to) }"
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

const navItems = [
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
.latap-nav {
  position: fixed;
  inset-inline: 0;
  bottom: clamp(5.5rem, 10vw, 7.5rem);
  z-index: 20;
  display: flex;
  justify-content: center;
  gap: clamp(0.45rem, 1.5vw, 0.8rem);
  pointer-events: auto;
}

.latap-nav__button {
  display: grid;
  width: 3.1rem;
  height: 3.1rem;
  padding: 0;
  border-radius: 1rem;
  cursor: pointer;
  place-items: center;
  text-decoration: none;
}

.latap-nav__button :deep(.iconify) {
  width: 1.3rem;
  height: 1.3rem;
}

@media (max-width: 720px) {
  .latap-nav {
    bottom: clamp(5.75rem, 18vw, 7rem);
  }

  .latap-nav__button {
    width: 2.85rem;
    height: 2.85rem;
  }
}
</style>
