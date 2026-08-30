<template>
  <div class="grid gap-4 md:grid-cols-2">
    <UCard>
      <template #header>Category</template>
      {{ job.category_id }}
    </UCard>
    <UCard>
      <template #header>Contract</template>
      {{ job.contract_type }}
    </UCard>
    <UCard>
      <template #header>Openings</template>
      {{ job.openings_count }}
    </UCard>
    <UCard>
      <template #header>Status</template>
      {{ job.status }}
    </UCard>
  </div>
</template>

<script setup lang="ts">
import type { Job } from '../../models/job.model'
defineProps<{ job: Job }>()
</script>
