<template>
  <div class="pagebody">
    <UPageGrid>
      <UPageCard
        title="Discover Properties"
        description="Explore Properties in the Granite Directory."
        icon="i-lucide-layout-dashboard"
        to="/"
        variant="subtle"
      />
      <UPageCard
        title="Manage your Portfolio collection"
        description="Free and Pro support one Portfolio. Business operates multiple Portfolios."
        icon="i-lucide-badge-check"
        to="/pricing"
        variant="subtle"
      />
    </UPageGrid>

    <nav aria-label="Explore Granite">
      <NuxtLink v-for="link in links" :key="link.to" :to="link.to">
        {{ link.label }}
      </NuxtLink>
    </nav>
  </div>
</template>

<script setup lang="ts">
const links = [
  { label: 'Operations', to: '/operations' },
  { label: 'Directory', to: '/' },
  { label: 'Pricing', to: '/pricing' },
  { label: 'About', to: '/about' },
] as const
</script>
