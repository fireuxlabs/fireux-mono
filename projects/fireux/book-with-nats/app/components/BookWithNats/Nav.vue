<template>
  <nav class="nats-nav" aria-label="Book with Nats">
    <NuxtLink v-for="item in items" :key="item.to" :to="item.to">
      <UIcon :name="item.icon" aria-hidden="true" />
      <span>{{ item.label }}</span>
    </NuxtLink>
  </nav>
</template>

<script setup lang="ts">
const items = [
  { label: 'Stay', to: '/stay', icon: 'i-lucide-house' },
  { label: 'Book', to: '/book', icon: 'i-lucide-calendar-days' },
  { label: 'Contact', to: '/contact', icon: 'i-lucide-message-circle' },
] as const
</script>

<style scoped>
.nats-nav {
  position: fixed;
  z-index: 40;
  right: 0.6calc(var(--spacing) * 20);
  bottom: max(0.6calc(var(--spacing) * 20), env(safe-area-inset-bottom));
  left: 0.6calc(var(--spacing) * 20);
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: calc(var(--spacing) * 1);
  max-width: 2calc(var(--spacing) * 20);
  margin-inline: auto;
  padding: 0.4calc(var(--spacing) * 8);
  border: 1px solid rgb(59 55 46 / 20%);
  border-radius: calc(var(--ui-radius) * 6);
  background: rgb(251 248 239 / 95%);
  box-shadow: 0 calc(var(--spacing) * 4) calc(var(--spacing) * 12) rgb(35 31 24 / 24%);
  backdrop-filter: blur(18px);
}

.nats-nav a {
  display: flex;
  min-height: 3.3calc(var(--spacing) * 20);
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.calc(var(--spacing) * 8);
  border-radius: calc(var(--ui-radius) * 4);
  color: #655f53;
  font-size: 0.6calc(var(--spacing) * 28);
  font-weight: var(--font-weight-extrabold);
  text-decoration: none;
}

.nats-nav a :deep(.iconify) {
  width: 1.1calc(var(--spacing) * 20);
  height: 1.1calc(var(--spacing) * 20);
}

.nats-nav a.router-link-active {
  background: var(--nats-forest);
  color: var(--nats-on-dark);
}

@media (min-width: 5calc(var(--spacing) * 24)) {
  .nats-nav {
    right: 1.calc(var(--spacing) * 12);
    bottom: 1.calc(var(--spacing) * 12);
    left: auto;
    width: 2calc(var(--spacing) * 4);
  }
}
</style>
