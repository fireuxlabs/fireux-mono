<template>
  <div class="grid gap-5">
    <div class="grid gap-4 lg:grid-cols-2">
      <UPageCard
        title="Discover Portfolios"
        description="Browse published Granite Portfolios and their available property information."
        icon="i-lucide-layout-dashboard"
        to="/portfolios"
        variant="subtle"
      />
      <UPageCard
        title="Manage your Portfolio collection"
        description="Free and Professional support one Portfolio. Business operates multiple Portfolios."
        icon="i-lucide-badge-check"
        to="/pricing"
        variant="subtle"
      />
    </div>

    <nav
      aria-label="Explore Granite"
      class="flex flex-wrap gap-x-5 gap-y-2 border-t border-default pt-5 text-sm"
    >
      <NuxtLink
        v-for="link in links"
        :key="link.to"
        :to="link.to"
        class="font-medium text-muted hover:text-highlighted"
      >
        {{ link.label }}
      </NuxtLink>
    </nav>
  </div>
</template>

<script setup lang="ts">
const links = [
  { label: 'Operations', to: '/operations' },
  { label: 'Portfolios', to: '/portfolios' },
  { label: 'Pricing', to: '/pricing' },
  { label: 'About', to: '/about' },
] as const
</script>
