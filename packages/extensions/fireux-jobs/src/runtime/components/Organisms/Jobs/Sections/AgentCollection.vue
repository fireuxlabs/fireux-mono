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
                <p class="text-sm text-gray-500 line-clamp-2">
                  {{ job.description || 'No description provided.' }}
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

      <p v-else class="text-sm opacity-70">
        You have not created any jobs yet.
      </p>
    </template>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useJobCollection } from '../../../../composables/fireux/firestore/jobs/main/useJobCollection.ts'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser.ts'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth.ts'
import type { Job } from '../../../../models/job.model.ts'

const { jobs: allJobs, pending: isPending } = useJobCollection()
const { coreUser } = useUser()
const { uid: authUid } = useAuth()

const jobs = computed<Job[]>(() => {
  const ownerId =
    coreUser.value?.uid ?? coreUser.value?.id ?? authUid.value ?? null
  if (!ownerId) return []
  return (allJobs.value ?? []).filter((job) => job.created_by === ownerId)
})

const pending = computed<boolean>(() => isPending.value)
const total = computed(() => jobs.value.length)

const badgeColor = (status?: Job['status']) => {
  if (status === 'open') return 'success'
  if (status === 'draft') return 'amber'
  return 'neutral'
}
</script>
