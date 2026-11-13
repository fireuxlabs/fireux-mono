<template>
  <nav class="latap-nav" aria-label="Venue shortcuts">
    <NuxtLink
      v-for="item in navItems"
      :key="item.to"
      class="latap-nav__button latap-glass"
      :to="item.to"
      :aria-label="item.label"
    >
      <UIcon :name="item.icon" />
      <span>{{ item.label }}</span>
    </NuxtLink>
  </nav>
</template>

<script setup lang="ts">
const navItems = [
  { label: 'Home', icon: 'i-ph-house', to: '/' },
  { label: 'Location', icon: 'i-ph-map-pin', to: '/location' },
  { label: 'Menu', icon: 'i-ph-fork-knife', to: '/menus/food' },
  { label: 'Gallery', icon: 'i-ph-camera', to: '/gallery' },
  { label: 'Information', icon: 'i-ph-info', to: '/info' },
] as const
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
  min-height: 3.1rem;
  padding: 0.5rem 0.85rem;
  gap: 0.25rem;
  border-radius: calc(var(--ui-radius) * 4);
  cursor: pointer;
  place-items: center;
  text-decoration: none;
  font-size: 0.7rem;
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
    min-height: 2.85rem;
    padding: 0.4rem 0.55rem;
    font-size: 0.6rem;
  }
}
</style>
