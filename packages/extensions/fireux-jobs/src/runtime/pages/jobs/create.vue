<template>
  <UPage>
    <UPageHeader
      title="Create Job"
      description="Draft a new job posting to share with professionals."
    />

    <UPageBody class="pagebody">
      <USkeleton v-if="isChecking" class="h-40 rounded-2xl" />
      <OrganismsProfilesAgentCTA v-else-if="!canCreate" />
      <OrganismsJobsCreate v-else />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAgent } from '../../composables/fireux/firestore/profiles/Agent/useAgent.ts'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser.ts'

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

const { activeProfile, hasCoreProfile, hasAppProfile, pending } = useAgent()
const { profileKeys, hasProfile, pending: userPending } = useUser()

const isChecking = computed(
  () => Boolean(pending?.value) || Boolean(userPending?.value)
)

const hasAgentProfile = computed(() => {
  if (hasProfile('agent')) return true
  if (profileKeys.value.includes('agent')) return true
  return Boolean(hasCoreProfile?.value || hasAppProfile?.value)
})

// Allow creation if we have any agent profile presence or the user is tagged as agent.
const canCreate = computed(
  () => Boolean(activeProfile?.value) || hasAgentProfile.value
)
</script>
