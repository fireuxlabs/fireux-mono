<template>
  <article class="space-y-8">
    <JobDetailHeader :job="job" />
    <JobDetailContent :job="job" />
    <div class="grid gap-4 md:grid-cols-2">
      <JobDetailCompany :job="job" />
      <JobDetailPlace :job="job" />
    </div>
    <JobDetailAdmin :job="job" />
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Job } from '../models/job.model'
import { useJobSeo } from '../composables/useJobSeo'
const props = defineProps<{ job: Job }>()
useJobSeo(computed(() => props.job))
</script>
