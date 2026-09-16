<template>
  <section class="pt-4" aria-label="Project tools">
    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
        :ui="{
          container: 'h-full justify-between p-4 sm:p-5',
          leadingIcon: 'size-7',
          description: 'text-sm',
        }"
      />
    </div>
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
