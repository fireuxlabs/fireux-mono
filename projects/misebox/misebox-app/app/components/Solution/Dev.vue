<template>
  <UCard variant="subtle">
    <template #header>
      <h2 class="fx-type-section-title">Dev</h2>
    </template>

    <UPageGrid>
      <UCard v-for="endpoint in dev.endpoints" :key="endpoint.path">
        <div>
          <UBadge :label="endpoint.method" color="neutral" variant="soft" />
          <code>
            {{ endpoint.path }}
          </code>
        </div>
        <p class="fx-type-caption">
          {{ endpoint.description }}
        </p>
      </UCard>
    </UPageGrid>
  </UCard>
</template>

<script setup lang="ts">
import type { MiseboxSolution } from '../../utils/miseboxSolutions'

defineProps<{
  dev: MiseboxSolution['dev']
}>()
</script>
