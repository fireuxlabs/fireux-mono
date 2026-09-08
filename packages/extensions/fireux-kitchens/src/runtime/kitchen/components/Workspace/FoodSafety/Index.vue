<template>
  <section class="space-y-5">
    <UPageHeader :title="current.title" :description="current.description" />
    <UAlert
      icon="i-lucide-shield-check"
      color="warning"
      variant="subtle"
      title="Not connected yet"
      :description="current.boundary"
    />
  </section>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from '#imports'
const route = useRoute()
const views = {
  checks: {
    title: 'Due checks',
    description: 'The checks your team needs to complete today.',
    boundary:
      'Scheduled checks and completion records are not connected. This screen cannot yet confirm that your kitchen is safe or that checks are complete.',
  },
  records: {
    title: 'Food safety records',
    description: 'Find completed checks and their supporting evidence.',
    boundary:
      'No safety record source is connected. Missing information must not be treated as a passed check.',
  },
  actions: {
    title: 'Corrective actions',
    description: 'Follow up when a check identifies a problem.',
    boundary:
      'Issue ownership, corrective work and verification are not connected yet.',
  },
  procedures: {
    title: 'Procedures',
    description: 'Keep the team’s working instructions easy to find.',
    boundary:
      'Kitchen-specific procedures are not connected yet. Product reference material below is not your approved food safety plan.',
  },
}
const current = computed(
  () => views[route.query.view as keyof typeof views] || views.checks
)
</script>
