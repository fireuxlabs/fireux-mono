<template>
  <UPage>
    <UPageHeader
      title="Misebox Jobs"
      description="Browse open Misebox roles and manage your own postings."
    >
      <template #ctas>
        <JobsCreateButton />
      </template>
    </UPageHeader>

    <UPageBody class="space-y-4">
      <UAlert
        v-if="!appId"
        color="amber"
        variant="soft"
        title="Tenant configuration missing"
        description="Set an appId in FireUXConfig to surface Misebox jobs."
      />

      <template v-else>
        <div v-if="pending" class="space-y-3">
          <USkeleton class="h-20 rounded-xl" />
          <USkeleton class="h-20 rounded-xl" />
        </div>

        <div
          v-else-if="jobList.length === 0"
          class="space-y-2 text-sm text-gray-500"
        >
          <p>No Misebox jobs yet. Post the first shift to kick things off.</p>
          <p v-if="!hasAgentProfile" class="text-gray-400">
            Create your Misebox agent profile to unlock job posting tools.
          </p>
        </div>

        <UAlert
          v-else-if="!hasAgentProfile"
          color="blue"
          variant="soft"
          title="Ready to hire for Misebox?"
          description="Set up your Misebox agent profile from the dashboard to publish roles."
        />

        <ul v-else class="grid gap-4 md:grid-cols-2">
          <li v-for="job in jobList" :key="job.id">
            <UCard>
              <div class="flex items-start justify-between gap-3">
                <div>
                  <h3 class="font-semibold">{{ job.title }}</h3>
                  <p class="text-sm text-gray-500 line-clamp-2">
                    {{ job.description || 'No description yet' }}
                  </p>
                </div>
                <div class="flex flex-col items-end gap-2">
                  <UBadge
                    size="xs"
                    :color="badgeColor(job.status)"
                    variant="soft"
                  >
                    {{ job.status || 'draft' }}
                  </UBadge>
                  <UButton
                    variant="ghost"
                    icon="i-lucide-arrow-right"
                    :to="`/jobs/${job.id}`"
                  />
                </div>
              </div>
              <template #footer>
                <div class="text-xs text-gray-500">
                  {{ job.pay ? `Pay: ${job.pay}` : 'Pay: negotiable' }}
                </div>
              </template>
            </UCard>
          </li>
        </ul>
      </template>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/composables/core/config/FireUXConfig.ts'
import JobsCreateButton from '../../../../../../extensions/fireux-jobs/src/runtime/components/Organisms/Jobs/CreateButton.vue'
import { useAgent } from '../../composables/firestore/profiles/Agent/useAgent.ts'

definePageMeta({
  layout: 'default',
  nav: {
    key: 'misebox-jobs',
    label: 'Jobs',
    icon: 'i-lucide-briefcase',
    order: 60,
    desktop: true,
    mobile: true,
    layouts: ['default'],
  },
})

useHead({ title: 'Misebox Jobs' })

const { appId } = useFireUXConfig()
const { jobs, pending } = useJobCollection()
const { coreProfile, appProfile } = useAgent()

const jobList = computed(() => jobs.value ?? [])
const hasAgentProfile = computed(() =>
  Boolean(coreProfile.value ?? appProfile.value)
)

const badgeColor = (status?: string | null) => {
  if (status === 'open') return 'success'
  if (status === 'draft') return 'amber'
  return 'neutral'
}
</script>
