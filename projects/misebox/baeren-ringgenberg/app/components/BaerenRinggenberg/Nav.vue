<template>
  <nav class="baeren-nav" aria-label="Venue shortcuts">
    <NuxtLink
      v-for="item in navItems"
      :key="item.to"
      class="baeren-nav__button baeren-glass"
      :to="item.to"
      :aria-label="item.label"
    >
      <UIcon :name="item.icon" />
    </NuxtLink>
  </nav>
</template>

<script setup lang="ts">
const navItems = [
  { label: 'Home', icon: 'i-ph-house', to: '/home' },
  { label: 'Location', icon: 'i-ph-map-pin', to: '/location' },
  { label: 'Menu', icon: 'i-ph-fork-knife', to: '/' },
  { label: 'Gallery', icon: 'i-ph-camera', to: '/gallery' },
  { label: 'Information', icon: 'i-ph-info', to: '/info' },
] as const
</script>

<style scoped>
.baeren-nav {
  position: fixed;
  inset-inline: 0;
  bottom: clamp(5.5rem, 10vw, 7.5rem);
  z-index: 20;
  display: flex;
  justify-content: center;
  gap: clamp(0.45rem, 1.5vw, 0.8rem);
  pointer-events: auto;
}

.baeren-nav__button {
  display: grid;
  width: 3.1rem;
  height: 3.1rem;
  padding: 0;
  border-radius: 1rem;
  cursor: pointer;
  place-items: center;
  text-decoration: none;
}

.baeren-nav__button :deep(.iconify) {
  width: 1.3rem;
  height: 1.3rem;
}

@media (max-width: 720px) {
  .baeren-nav {
    bottom: clamp(5.75rem, 18vw, 7rem);
  }

  .baeren-nav__button {
    width: 2.85rem;
    height: 2.85rem;
  }
}
</style>
