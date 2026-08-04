<template>
  <UPage>
    <UPageHeader
      title="Repository docs"
      description="Current operating context and concept maps, rendered from their authoritative repository sources."
      headline="FireUX"
    />

    <UPageBody>
      <div class="grid gap-4 md:grid-cols-3">
        <UCard
          v-for="section in sections"
          :key="section.to"
          :to="section.to"
        >
          <div class="space-y-2">
            <UIcon :name="section.icon" class="size-6 text-primary" />
            <h2 class="font-semibold">{{ section.label }}</h2>
            <p class="text-sm text-dimmed">{{ section.description }}</p>
          </div>
        </UCard>
      </div>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'docs',
  title: 'Repository docs',
})

const sections = [
  {
    label: 'Working agreement',
    description: 'The short router every repository task starts from.',
    icon: 'i-lucide-signpost',
    to: '/docs/governance/agents',
  },
  {
    label: 'Agent context',
    description: 'Living entrypoints for repo-wide and durable scoped work.',
    icon: 'i-lucide-bot',
    to: '/docs/ai/gpt-context',
  },
  {
    label: 'Concept maps',
    description: 'Ownership, family language, and the current FireUX spine.',
    icon: 'i-lucide-network',
    to: '/docs/concepts/fireux-mono',
  },
] as const
</script>
