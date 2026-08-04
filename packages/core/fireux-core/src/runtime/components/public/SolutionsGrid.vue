<!-- Concurrent edit — 2026-07-21 13:51 CEST — CSS necessity pass: replace the bespoke solutions grid with Nuxt UI page primitives. -->
<template>
  <UPageGrid>
    <UPageCard
      v-for="solution in solutions"
      :key="solution.slug"
      :icon="solution.icon || 'i-lucide-lightbulb'"
      :description="solution.description"
      :to="solution.to || `/solutions/${solution.slug}`"
      :target="solution.external ? '_blank' : undefined"
      variant="subtle"
    >
      <template #title>
        <h2>{{ solution.title }}</h2>
      </template>

      <template #footer>
        <UBadge
          :label="solution.owner?.name || `/solutions/${solution.slug}`"
          color="neutral"
          variant="soft"
          size="sm"
        />
      </template>
    </UPageCard>
  </UPageGrid>
</template>

<script setup lang="ts">
import type { FireuxMetaSolution } from '../../../config/app/meta-content'

defineProps<{
  solutions: FireuxMetaSolution[]
}>()
</script>
