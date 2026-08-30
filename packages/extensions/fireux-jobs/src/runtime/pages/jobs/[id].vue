<template>
  <UPage>
    <UPageBody>
      <JobDetail v-if="job" :job="job" />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useJobDetail } from '../../job/composables/useJobDetail'

definePageMeta({ layout: 'default' })

const route = useRoute()
const jobId = computed(() => {
  const raw = route.params.id
  return Array.isArray(raw)
    ? (raw[0]?.toString() ?? null)
    : (raw?.toString() ?? null)
})
const { job, ready } = useJobDetail(jobId)
await ready
</script>
