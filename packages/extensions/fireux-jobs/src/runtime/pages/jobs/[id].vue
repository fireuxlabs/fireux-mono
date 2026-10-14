<template>
  <UPage>
    <UPageBody>
      <JobDetail v-if="job" :job="job" />
      <DiagnosticsDebugPanel
        title="Job detail acquisition"
        context="Canonical Job fetched by the detail route."
        object-origin="fetched"
        :objects="{ job }"
        :derived="{ jobId }"
        include-route
        launcher
      />
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
