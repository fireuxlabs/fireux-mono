<template>
  <UPage>
    <UPageHeader
      title="Create Job"
      description="Draft a new job posting to share with professionals."
    />

    <UPageBody class="pagebody">
      <div v-if="isChecking" class="space-y-3">
        <USkeleton v-for="n in 3" :key="n" class="h-20" />
      </div>
      <OrganismsProfilesAgentCTA v-else-if="!canCreate" />
      <OrganismsJobsCreate v-else />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useHead } from '#imports'
import { useAgent } from '../../composables/fireux/firestore/profiles/Agent/useAgent.ts'

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

// Keep this in sync with /jobs index: coreProfile gates job features.
const { coreProfile, pending } = useAgent()

const isChecking = computed(() => Boolean(pending?.value))

// Allow creation if we have an Agent core profile.
// Extend later to allow admins without an Agent profile if needed.
const canCreate = computed(() => Boolean(coreProfile?.value))
</script>
