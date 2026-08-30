<template>
  <JobApplyPanel :job-id="job.id" />
</template>

<script setup lang="ts">
import type { Job } from '../../models/job.model'
defineProps<{ job: Job }>()
</script>
