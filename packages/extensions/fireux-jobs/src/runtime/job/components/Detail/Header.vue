<template>
  <UPageHeader :title="job.title" :description="job.description">
    <template #headline>Job</template>
    <template #links>
      <UButton
        to="/jobs"
        label="All Jobs"
        icon="i-lucide-arrow-left"
        color="neutral"
        variant="ghost"
      />
    </template>
  </UPageHeader>
</template>

<script setup lang="ts">
import type { Job } from '../../models/job.model'
defineProps<{ job: Job }>()
</script>
