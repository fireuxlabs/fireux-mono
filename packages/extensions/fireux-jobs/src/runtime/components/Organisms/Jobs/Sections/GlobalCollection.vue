<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between gap-2">
        <h2>Network jobs</h2>
        <UBadge variant="soft">{{ total }}</UBadge>
      </div>
      <p class="text-sm opacity-70">
        Open roles published across this runtime.
      </p>
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
        No jobs published yet. Check back soon.
      </p>
    </template>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useJobCollection } from '../../../../composables/fireux/firestore/jobs/main/useJobCollection.ts'
import type { Job } from '../../../../models/job.model.ts'

const { tenantJobs, pending: isPending } = useJobCollection()

const jobs = computed<Job[]>(() => tenantJobs.value ?? [])
const pending = computed<boolean>(() => isPending.value)
const total = computed(() => jobs.value.length)

const badgeColor = (status?: Job['status']) => {
  if (status === 'open') return 'success'
  if (status === 'draft') return 'amber'
  return 'neutral'
}
</script>
