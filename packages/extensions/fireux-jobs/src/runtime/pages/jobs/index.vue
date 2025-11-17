<template>
  <UPage>
    <UPageHeader
      title="Jobs"
      description="Browse jobs available across this tenant."
    >
      <template #ctas>
        <OrganismsJobsCreateButton />
      </template>
    </UPageHeader>

    <UPageBody class="space-y-4">
      <UAlert
        v-if="!appId"
        color="amber"
        variant="soft"
        title="No tenant app detected"
        description="Set an appId in FireUXConfig to list jobs."
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
          <p>No jobs yet. Check back soon.</p>
          <p v-if="!hasEmployerProfile" class="text-gray-400">
            Want to post one? Create your employer profile from the dashboard to
            publish jobs.
          </p>
        </div>

        <UAlert
          v-else-if="!hasEmployerProfile"
          color="blue"
          variant="soft"
          title="Ready to hire?"
          description="Set up your employer profile from the dashboard to create job postings."
        />

        <ul v-else class="grid gap-4 md:grid-cols-2">
          <li v-for="job in jobList" :key="job.id">
            <UCard>
              <div class="flex items-start justify-between gap-3">
                <div>
                  <h3 class="font-semibold">{{ job.title }}</h3>
                  <p class="text-sm text-gray-500 line-clamp-2">
                    {{ job.description || 'No description' }}
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
import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'
import { useJobCollection } from '../../composables/firestore/jobs/main/useJobCollection.ts'
import { useEmployer } from '../../composables/firestore/profiles/Employer/useEmployer.ts'

definePageMeta({
  layout: 'default',
  nav: {
    key: 'jobs',
    label: 'Jobs',
    icon: 'i-lucide-briefcase',
    order: 60,
    desktop: true,
    mobile: true,
    layouts: ['default'],
  },
})

useHead({ title: 'Jobs' })

const { appId } = useFireUXConfig()
const { jobs, pending } = useJobCollection()
const { coreProfile, appProfile } = useEmployer()

const jobList = computed(() => jobs.value ?? [])
const hasEmployerProfile = computed(() =>
  Boolean(coreProfile.value ?? appProfile.value)
)

const badgeColor = (status?: string | null) => {
  if (status === 'open') return 'success'
  if (status === 'draft') return 'amber'
  return 'neutral'
}
</script>
