<template>
  <UCard>
    <template #header>Place</template>
    {{ job.place_id }}
  </UCard>
</template>

<script setup lang="ts">
import type { Job } from '../../models/job.model'
defineProps<{ job: Job }>()
</script>
