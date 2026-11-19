<template>
  <div>
    <UPageGrid as="div" v-if="!compact">
      <UPageCard
        title="Kitchen Team evidence"
        description="Review the evidence and operator jobs behind the Kitchen Team capability."
        icon="i-lucide-search-check"
        to="/workspace/kitchen/team/search-demand"
        variant="subtle"
      />
      <UPageCard
        title="Proposed Team Tools"
        description="Compare available Team Tools with the researched next candidates."
        icon="i-lucide-wrench"
        to="/workspace/kitchen/team/search-demand/tools"
        variant="subtle"
      />
    </UPageGrid>

    <nav aria-label="Explore Kitchen Team research">
      <NuxtLink v-for="link in links" :key="link.to" :to="link.to">
        {{ link.label }}
      </NuxtLink>
    </nav>
  </div>
</template>

<script setup lang="ts">
defineProps<{ compact?: boolean }>()
const links = [
  { label: 'Evidence', to: '/workspace/kitchen/team/search-demand' },
  { label: 'Analysis', to: '/workspace/kitchen/team/search-demand/analysis' },
  {
    label: 'Proposed Tools',
    to: '/workspace/kitchen/team/search-demand/tools',
  },
] as const
</script>
