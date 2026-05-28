<template>
  <UCard
    v-if="dev"
    variant="subtle"
  >
    <template #header>
      <h2 class="text-lg font-semibold text-highlighted">
        Dev
      </h2>
    </template>

    <div class="space-y-4">
      <div
        v-if="dev.endpoints?.length"
        class="grid gap-3 sm:grid-cols-2"
      >
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

      <div
        v-for="example in dev.examples"
        :key="example.title"
        class="overflow-hidden rounded-md border border-default bg-elevated"
      >
        <div class="border-b border-default px-4 py-2 text-xs font-medium uppercase text-muted">
          {{ example.title }}
        </div>
        <pre class="overflow-x-auto p-4 text-sm leading-6"><code>{{ example.code }}</code></pre>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { GoQrSolution } from '../utils/goQrSolutions'

defineProps<{
  dev?: GoQrSolution['dev']
}>()
</script>
