<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between gap-2">
        <h2>Your job postings</h2>
        <UBadge variant="soft">{{ total }}</UBadge>
      </div>
      <p class="text-sm opacity-70">Manage jobs created by your account.</p>
    </template>

    <div v-if="pending" class="space-y-3">
      <USkeleton class="h-20 rounded-xl" />
      <USkeleton class="h-20 rounded-xl" />
    </div>

    <template v-else>
      <ul v-if="jobs.length" class="grid gap-4 md:grid-cols-2">
        <li v-for="job in jobs" :key="job.id">
          <UCard>
            <div class="flex items-start justify-between gap-3">
              <div class="space-y-1">
                <h3 class="font-semibold leading-tight">{{ job.title }}</h3>
                <p class="text-xs uppercase tracking-wide text-gray-400">
                  {{ job.source_app_id || 'App unknown' }}
                </p>
              </div>
              <div class="flex flex-col items-end gap-2">
                <UBadge
                  size="xs"
                  :color="badgeColor(job.status)"
                  variant="soft"
                >
                  {{ job.status || 'open' }}
                </UBadge>
                <UButton
                  variant="ghost"
                  icon="i-lucide-arrow-right"
                  :to="`/jobs/${job.id}`"
                />
              </div>
            </div>
          </UCard>
        </li>
      </ul>

      <p v-else class="text-sm opacity-70">
        You have not created any jobs yet.
      </p>
    </template>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useJobCollection } from '../../../composables/fireux/firestore/jobs/fetch/useJobCollection.ts'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import type { Job } from '../../../models/job.model'

const { jobs: allJobs, pending: isPending } = useJobCollection()
const { coreUser } = useUser()
const { uid: authUid } = useAuth()

const jobs = computed<Job[]>(() => {
  const ownerId = coreUser.value?.id ?? authUid.value ?? null
  if (!ownerId) return []
  return (allJobs.value ?? []).filter((job) => job.created?.by === ownerId)
})

const pending = computed<boolean>(() => isPending.value)
const total = computed(() => jobs.value.length)

const badgeColor = (status?: Job['status']) => {
  if (status === 'open') return 'success'
  return 'neutral'
}
</script>
