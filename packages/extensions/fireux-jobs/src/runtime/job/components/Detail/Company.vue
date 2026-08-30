<template>
  <UCard>
    <template #header>Company</template>
    {{ job.company_id }}
  </UCard>
</template>

<script setup lang="ts">
import type { Job } from '../../models/job.model'
defineProps<{ job: Job }>()
</script>
