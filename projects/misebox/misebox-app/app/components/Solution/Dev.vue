<template>
  <UCard variant="subtle">
    <template #header>
      <h2 class="text-lg font-semibold text-highlighted">
        Dev
      </h2>
    </template>

    <div class="grid gap-3 sm:grid-cols-2">
      <div
        v-for="endpoint in dev.endpoints"
        :key="endpoint.path"
        class="rounded-md border border-default bg-default p-3"
      >
        <div class="flex items-center gap-2">
          <UBadge
            :label="endpoint.method"
            color="neutral"
            variant="soft"
          />
          <code class="break-all text-sm text-highlighted">
            {{ endpoint.path }}
          </code>
        </div>
        <p class="mt-2 text-xs leading-5 text-muted">
          {{ endpoint.description }}
        </p>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { MiseboxSolution } from '../../utils/miseboxSolutions'

defineProps<{
  dev: MiseboxSolution['dev']
}>()
</script>
