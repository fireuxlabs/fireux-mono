<template>
  <UCard>
    <template #header>Business</template>
    {{ job.business_id }}
  </UCard>
</template>

<script setup lang="ts">
import type { Job } from '../../models/job.model'
defineProps<{ job: Job }>()
</script>
