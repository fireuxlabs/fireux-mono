<template>
  <div aria-label="Services summary">
    <p v-if="pending" role="status" class="text-sm text-muted">
      Loading services…
    </p>
    <p v-else-if="failed" role="alert" class="text-sm text-muted">
      Services could not be loaded.
    </p>
    <dl
      v-else-if="rows.length"
      class="grid gap-x-8 gap-y-2 sm:grid-cols-2"
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
          <template v-if="row.issues.length">
            {{ row.issues.join(' · ') }}
          </template>
          <template v-else>{{ row.label }}</template>
        </dd>
      </div>
    </dl>
    <p v-else class="text-sm text-muted">No services enabled.</p>
  </div>
</template>
<script setup lang="ts">
import type { foodServiceSummary } from '../../../utils/food-service-summary'
defineProps<{
  rows: ReturnType<typeof foodServiceSummary>
  pending: boolean
  failed: boolean
}>()
</script>
