<template>
  <div class="grid gap-5">
    <div class="grid gap-4 lg:grid-cols-2">
      <UPageCard
        title="Project Team evidence"
        description="Review the evidence and operator jobs behind the Project Team capability."
        icon="i-lucide-search-check"
        to="/search-demand"
        variant="subtle"
      />
      <UPageCard
        title="Proposed Team Tools"
        description="Compare available Team Tools with the researched next candidates."
        icon="i-lucide-wrench"
        to="/search-demand/tools"
        variant="subtle"
      />
    </div>

    <nav
      aria-label="Explore Project Team research"
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
  { label: 'Evidence', to: '/search-demand' },
  { label: 'Analysis', to: '/search-demand/analysis' },
  { label: 'Proposed Tools', to: '/search-demand/tools' },
] as const
</script>
