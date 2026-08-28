<template>
  <div class="grid gap-5">
    <div class="grid gap-4 lg:grid-cols-2">
      <UPageCard
        id="kitchen-collection"
        title="Discover Kitchens"
        description="Browse published Kitchens, restaurant profiles, current Menus and available ordering options."
        icon="i-lucide-map"
        to="/kitchens"
        variant="subtle"
      />
      <UPageCard
        id="workspace-access"
        title="Manage your Kitchen portfolio"
        description="Free and Professional support one Kitchen. Business operates multiple Kitchens. Sign in to attach an anonymous Kitchen to your account."
        icon="i-lucide-badge-check"
        to="/pricing"
        variant="subtle"
      />
    </div>

    <nav
      aria-label="Explore Misebox"
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
  { label: 'Solutions', to: '/solutions' },
  { label: 'Operations', to: '/operations' },
  { label: 'Tools', to: '/tools' },
  { label: 'Kitchens', to: '/kitchens' },
  { label: 'Pricing', to: '/pricing' },
  { label: 'About', to: '/about' },
] as const
</script>
