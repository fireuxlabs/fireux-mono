<template>
  <nav class="baeren-nav" aria-label="Bären Schnellzugriff">
    <NuxtLink v-for="item in items" :key="item.to" :to="item.to">
      <UIcon :name="item.icon" aria-hidden="true" />
      <span>{{ item.label }}</span>
    </NuxtLink>
  </nav>
</template>

<script setup lang="ts">
const items = [
  { label: 'Hotel', to: '/hotel', icon: 'i-lucide-bed-double' },
  { label: 'Menu', to: '/menus', icon: 'i-lucide-utensils' },
  { label: 'Events', to: '/events', icon: 'i-lucide-calendar-days' },
  { label: 'Route', to: '/location', icon: 'i-lucide-map-pin' },
] as const
</script>

<style scoped>
.baeren-nav {
  position: fixed;
  z-index: 30;
  right: 0.5rem;
  bottom: max(0.5rem, env(safe-area-inset-bottom));
  left: 0.5rem;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.2rem;
  max-width: 31rem;
  margin-inline: auto;
  padding: 0.4rem;
  border: 1px solid rgb(var(--baeren-nav-border-rgb) / 30%);
  border-radius: 1.25rem;
  background: rgb(var(--baeren-nav-surface-rgb) / 97%);
  box-shadow:
    inset 0 0 0 1px rgb(255 255 255 / 44%),
    0 1rem 2.75rem rgb(var(--baeren-nav-shadow-rgb) / 32%);
  backdrop-filter: blur(16px) saturate(115%);
}

.baeren-nav a {
  display: flex;
  min-width: 0;
  min-height: 3.4rem;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  border-radius: 0.9rem;
  color: var(--baeren-nav-ink);
  font-size: 0.66rem;
  font-weight: 850;
  text-decoration: none;
}

.baeren-nav a :deep(.iconify) {
  width: 1.2rem;
  height: 1.2rem;
}

.baeren-nav a.router-link-active {
  background: var(--baeren-accent);
  color: var(--baeren-on-dark);
}

@media (min-width: 56rem) {
  .baeren-nav {
    right: 1.25rem;
    bottom: 1.25rem;
    left: auto;
    width: auto;
    grid-template-columns: repeat(4, 5rem);
  }
}
</style>
