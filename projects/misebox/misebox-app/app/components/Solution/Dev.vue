<template>
  <UCard variant="subtle">
    <template #header>
      <h2 class="fx-type-section-title">Dev</h2>
    </template>

    <div class="grid gap-3 sm:grid-cols-2">
      <UCard v-for="endpoint in dev.endpoints" :key="endpoint.path">
        <div class="flex items-center gap-2">
          <UBadge :label="endpoint.method" color="neutral" variant="soft" />
          <code class="break-all">
            {{ endpoint.path }}
          </code>
        </div>
        <p class="mt-2 fx-type-caption">
          {{ endpoint.description }}
        </p>
      </UCard>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { MiseboxSolution } from '../../utils/miseboxSolutions'

defineProps<{
  dev: MiseboxSolution['dev']
}>()
</script>
