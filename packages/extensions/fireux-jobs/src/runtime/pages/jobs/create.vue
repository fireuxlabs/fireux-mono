<template>
  <UPage>
    <UPageHeader
      title="Create Job"
      description="Draft a new job posting to share with professionals."
    />

    <UPageBody class="space-y-6">
      <OrganismsProfilesAgentCTA v-if="!canCreate" />
      <OrganismsJobsCreate v-else />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAgent } from '../../composables/firestore/profiles/Agent/useAgent.ts'
import { useAgentComputed } from '../../composables/firestore/profiles/Agent/main/useAgentComputed.ts'

definePageMeta({
  layout: 'default',
  nav: {
    key: 'jobs-create',
    label: 'Create job',
    icon: 'i-lucide-plus',
    order: 61,
    desktop: false,
    mobile: false,
    layouts: ['default'],
  },
})

useHead({ title: 'Create Job' })

const { profile } = useAgent()
const { activeProfile } = useAgentComputed(profile)
const canCreate = computed(() => Boolean(activeProfile.value))
</script>
