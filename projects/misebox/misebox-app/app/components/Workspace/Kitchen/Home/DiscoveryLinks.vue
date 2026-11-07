<template>
  <div class="pagebody">
    <UPageGrid>
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
        description="Start with a free Kitchen Workspace for one Kitchen. Pro also supports one Kitchen. Business operates multiple Kitchens."
        icon="i-lucide-badge-check"
        to="/pricing"
        variant="subtle"
      />
    </UPageGrid>

    <nav aria-label="Explore Misebox">
      <NuxtLink v-for="link in links" :key="link.to" :to="link.to">
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
