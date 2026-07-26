<template>
  <nav class="mobile-nav" aria-label="Quick navigation">
    <NuxtLink v-for="item in items" :key="item.to" :to="item.to">
      <UIcon :name="item.icon" aria-hidden="true" />
      <span>{{ item.label }}</span>
    </NuxtLink>
  </nav>
</template>

<script setup lang="ts">
const items = [
  { label: 'Stays', to: '/stays', icon: 'i-lucide-house' },
  { label: 'Book', to: '/book', icon: 'i-lucide-calendar-days' },
  { label: 'Contact', to: '/contact', icon: 'i-lucide-message-circle' },
] as const
</script>

<style scoped>
.mobile-nav {
  position: fixed;
  z-index: 40;
  right: calc(var(--spacing) * 3);
  bottom: max(calc(var(--spacing) * 3), env(safe-area-inset-bottom));
  left: calc(var(--spacing) * 3);
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: calc(var(--spacing) * 1);
  max-width: 20rem;
  margin-inline: auto;
  padding: calc(var(--spacing) * 2);
  border: 1px solid var(--aus-line);
  border-radius: 9999px;
  background: rgb(255 253 248 / 94%);
  box-shadow: 0 calc(var(--spacing) * 4) calc(var(--spacing) * 16)
    rgb(23 48 46 / 22%);
  backdrop-filter: blur(18px);
}

.mobile-nav a {
  display: flex;
  min-height: 3.5rem;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: calc(var(--spacing) * 1);
  border-radius: 9999px;
  color: var(--aus-muted);
  font-size: 0.68rem;
  font-weight: var(--font-weight-extrabold);
  text-decoration: none;
}

.mobile-nav a.router-link-active {
  background: var(--aus-forest);
  color: var(--aus-white);
}

@media (min-width: 58rem) {
  .mobile-nav {
    right: calc(var(--spacing) * 5);
    bottom: calc(var(--spacing) * 5);
    left: auto;
    width: 19rem;
  }
}
</style>
