<template>
  <section aria-label="Project tools">
    <UPageGrid>
      <UPageCard
        v-for="card in cards"
        :key="card.title"
        :title="card.title"
        :description="card.description"
        :icon="card.icon"
        :to="
          selected && card.capability
            ? `/workspace/project/${card.capability}`
            : card.to
        "
        variant="subtle"
        class="landing-tool-card"
      />
    </UPageGrid>
  </section>
</template>
<script setup lang="ts">
defineProps<{ selected: boolean }>()
const cards = [
  {
    title: 'Project profile',
    description: 'Give your work an identity worth sharing.',
    icon: 'i-lucide-briefcase-business',
    capability: 'identity',
    to: '/projects',
  },
  {
    title: 'Overview',
    description: 'See the capabilities and work in one place.',
    icon: 'i-lucide-layout-dashboard',
    capability: 'overview',
    to: '/product',
  },
  {
    title: 'Apps',
    description: 'Discover products built on FireUX.',
    icon: 'i-lucide-app-window',
    capability: '',
    to: '/apps',
  },
  {
    title: 'Ecosystems',
    description: 'Connected products for different domains.',
    icon: 'i-lucide-network',
    capability: '',
    to: '/ecosystems',
  },
]
</script>

<style scoped>
.landing-tool-card {
  aspect-ratio: 1;
  min-height: 11rem;
}
</style>
