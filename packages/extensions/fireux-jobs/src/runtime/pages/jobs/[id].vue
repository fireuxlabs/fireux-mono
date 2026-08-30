<template>
  <UPage>
    <UPageBody>
      <JobDetail v-if="job" :job="job" />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import { useJobDetail } from '../../job/composables/useJobDetail'

definePageMeta({
  layout: 'default',
  title: 'Job',
  description: 'View Job details.',
})

const jobId = useRouteParam('id')
const { job, ready } = useJobDetail(jobId)
await ready
</script>
