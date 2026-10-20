<template>
  <section
    aria-label="Services summary"
    class="rounded-xl border border-default p-4"
  >
    <NuxtLink
      to="/workspace/kitchen/food-and-drink/services"
      class="font-semibold hover:underline"
      >Services</NuxtLink
    >
    <p v-if="pending" role="status" class="mt-3 text-sm text-muted">
      Loading services…
    </p>
    <p v-else-if="failed" role="alert" class="mt-3 text-sm text-muted">
      Services could not be loaded.
    </p>
    <dl
      v-else-if="rows.length"
      class="mt-3 grid gap-x-8 gap-y-2 sm:grid-cols-2"
    >
      <div
        v-for="row in rows"
        :key="row.key"
        class="flex flex-wrap justify-between gap-x-4 text-sm"
      >
        <dt>{{ row.name }}</dt>
        <dd
          :class="
            row.open
              ? 'text-success'
              : row.needsSetup
                ? 'text-warning'
                : 'text-muted'
          "
        >
          {{ row.label }}
        </dd>
      </div>
    </dl>
    <p v-else class="mt-3 text-sm text-muted">No services enabled.</p>
  </section>
</template>
<script setup lang="ts">
import type { foodServiceSummary } from '../../../utils/food-service-summary'
defineProps<{
  rows: ReturnType<typeof foodServiceSummary>
  pending: boolean
  failed: boolean
}>()
</script>
