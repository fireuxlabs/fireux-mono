<!-- FILE: packages/extensions/fireux-jobs/src/runtime/pages/jobs/index.vue -->
<template>
  <UPage>
    <UPageHeader title="Jobs" description="Browse Misebox jobs." />
    <UPageBody class="pagebody">
      <div v-if="pending" class="space-y-3">
        <USkeleton v-for="n in 3" :key="n" class="h-20" />
      </div>

      <template v-else>
        <!-- CTA only when agent profile exists -->
        <OrganismsJobsCTA v-if="hasAgentProfile" />
        <!-- Jobs managed by this agent (local to the current agent) -->
        <OrganismsJobsSectionsAgentCollection v-if="hasAgentProfile" />
        <!-- Global jobs resolved for this runtime (ecosystem-wide) -->
        <OrganismsJobsSectionsGlobalCollection />
      </template>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useHead } from '#imports'
import { useAgent } from '../../composables/fireux/firestore/profiles/Agent/useAgent'

definePageMeta({
  nav: {
    key: 'jobs',
    label: 'Jobs',
    icon: 'i-lucide-briefcase',
    order: 60,
    desktop: true,
    mobile: true,
    layouts: ['default'],
  },
  title: 'Jobs',
  description: 'Jobs resolved for this runtime.',
  layout: 'default',
  name: 'JobsIndexPage',
})

const { coreProfile } = useAgent()

const pending = computed(() => coreProfile.value === undefined)
const hasAgentProfile = computed(() => Boolean(coreProfile.value))

useHead({ title: 'Jobs' })
</script>
