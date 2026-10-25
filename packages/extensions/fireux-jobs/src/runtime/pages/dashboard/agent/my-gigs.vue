<template>
  <UDashboardPanel id="dashboard-agent-hiring">
    <template #header>
      <FireLayoutsDashboardNavbar title="Hiring" />
    </template>

    <template #body>
      <UAlert
        icon="i-lucide-users-round"
        color="neutral"
        title="Hiring pipeline"
        description="Review applications, make offers and finish temporary engagements."
      />

      <UAlert
        v-if="errorMessage"
        color="error"
        variant="soft"
        title="Hiring pipeline unavailable"
        :description="errorMessage"
      />

      <div v-if="pending" class="grid gap-4 xl:grid-cols-2">
        <USkeleton v-for="index in 2" :key="index" class="h-56 rounded-xl" />
      </div>

      <UAlert
        v-else-if="!items.length && !errorMessage"
        color="neutral"
        variant="soft"
        icon="i-lucide-inbox"
        title="No applications yet"
        description="Applications to your published jobs will appear here."
      >
        <template #actions>
          <UButton to="/jobs/manage" color="neutral" variant="soft">
            Manage jobs
          </UButton>
        </template>
      </UAlert>

      <div v-else class="grid gap-4 xl:grid-cols-2">
        <UCard v-for="item in items" :key="item.application.id">
          <template #header>
            <div class="flex items-start justify-between gap-3">
              <div class="flex min-w-0 items-center gap-3">
                <UAvatar
                  :src="item.candidate?.image || undefined"
                  :alt="candidateName(item)"
                  icon="i-lucide-user-round"
                />
                <div class="min-w-0">
                  <p class="truncate font-semibold text-highlighted">
                    {{ candidateName(item) }}
                  </p>
                  <NuxtLink
                    :to="`/jobs/${item.job.id}`"
                    class="text-xs text-muted hover:text-primary"
                  >
                    {{ item.job.title }}
                  </NuxtLink>
                </div>
              </div>
              <UBadge color="neutral" variant="soft">
                {{ label(item.application.status) }}
              </UBadge>
            </div>
          </template>

          <p
            v-if="item.application.message"
            class="whitespace-pre-line text-sm text-muted"
          >
            {{ item.application.message }}
          </p>
          <p v-else class="text-sm text-muted">
            The candidate applied using their Professional profile.
          </p>

          <div
            v-if="item.application.status === 'submitted'"
            class="mt-4 flex flex-wrap gap-2"
          >
            <UButton
              size="sm"
              icon="i-lucide-handshake"
              :loading="busyId === item.application.id"
              @click="applicationAction(item.application.id, 'offer')"
            >
              Make offer
            </UButton>
            <UButton
              size="sm"
              color="neutral"
              variant="soft"
              :disabled="Boolean(busyId)"
              @click="applicationAction(item.application.id, 'reject')"
            >
              Reject
            </UButton>
          </div>

          <div
            v-else-if="item.application.status === 'offered'"
            class="mt-4 flex flex-wrap gap-2"
          >
            <UButton
              size="sm"
              icon="i-lucide-refresh-cw"
              :loading="busyId === item.application.id"
              @click="applicationAction(item.application.id, 'offer')"
            >
              Update offer
            </UButton>
            <UButton
              size="sm"
              color="neutral"
              variant="soft"
              :disabled="Boolean(busyId)"
              @click="applicationAction(item.application.id, 'reject')"
            >
              Withdraw offer
            </UButton>
          </div>

          <div v-if="item.engagement" class="mt-4 border-t border-default pt-4">
            <div class="flex items-center justify-between gap-3">
              <div>
                <p
                  class="text-xs font-semibold uppercase tracking-wide text-muted"
                >
                  Engagement
                </p>
                <p class="mt-1 text-sm text-highlighted">
                  {{ label(item.engagement.status) }}
                  · {{ label(item.engagement.contract_type) }}
                </p>
              </div>
              <div class="flex flex-wrap justify-end gap-2">
                <UButton
                  v-if="item.engagement.status === 'accepted'"
                  size="sm"
                  :loading="busyId === item.engagement.id"
                  @click="engagementAction(item.engagement.id, 'start')"
                >
                  Start
                </UButton>
                <UButton
                  v-if="['accepted', 'active'].includes(item.engagement.status)"
                  size="sm"
                  color="neutral"
                  variant="soft"
                  :disabled="Boolean(busyId)"
                  @click="engagementAction(item.engagement.id, 'complete')"
                >
                  Complete
                </UButton>
                <UButton
                  v-if="['accepted', 'active'].includes(item.engagement.status)"
                  size="sm"
                  color="error"
                  variant="soft"
                  :disabled="Boolean(busyId)"
                  @click="engagementAction(item.engagement.id, 'cancel')"
                >
                  Cancel
                </UButton>
              </div>
            </div>
          </div>
        </UCard>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { watch } from 'vue'

import { useLiveAsyncData } from 'fireux-core/runtime/composables/fireux/firestore/useLiveAsyncData'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { onMounted, ref } from 'vue'
import {
  fetchJobApplications,
  useJobHiringCommands,
} from '../../../job/composables/hiring/jobHiringClient'
import type { JobApplicationAction } from '../../../job/models/job-application.model.ts'
import type { JobEngagementAction } from '../../../job/models/job-engagement.model.ts'
import type { JobApplicationView } from '../../../job/models/job-hiring.model.ts'

const items = ref<JobApplicationView[]>([])
const pending = ref(true)
const { mutateJobApplicationRequest, mutateJobEngagementRequest, captureIntent, scopeEpoch } = useJobHiringCommands()
const busyId = ref('')
const errorMessage = ref('')
watch(scopeEpoch, () => { busyId.value = ''; errorMessage.value = '' }, { flush: 'sync' })

function label(value: string): string {
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase())
}

function candidateName(item: JobApplicationView): string {
  return item.candidate?.title || item.candidate?.subtitle || 'Professional'
}

function requestError(error: unknown): string {
  if (!error || typeof error !== 'object') return 'Please try again.'
  const candidate = error as {
    data?: { statusMessage?: unknown; message?: unknown }
    statusMessage?: unknown
    message?: unknown
  }
  return String(
    candidate.data?.statusMessage ??
      candidate.statusMessage ??
      candidate.data?.message ??
      candidate.message ??
      'Please try again.'
  )
}

const { currentUser: liveUser } = useAuth()
const liveApplications = useLiveAsyncData(
  computed(() => `job-applications:employer:${liveUser.value?.uid || ''}`),
  (liveFetch) => fetchJobApplications('employer', liveFetch),
  { server: false }
)
watch(liveApplications.data, (value) => {
  items.value = value?.items || []
})
watch(liveApplications.error, (value) => {
  if (value) errorMessage.value = requestError(value)
})

async function load() {
  const isCurrent = captureIntent()
  pending.value = true
  errorMessage.value = ''
  try {
    await liveApplications.refresh()
    if (!isCurrent()) return
    if (liveApplications.error.value) throw liveApplications.error.value
    items.value = liveApplications.data.value?.items || []
  } catch (error) {
    if (isCurrent()) errorMessage.value = requestError(error)
  } finally {
    if (isCurrent()) pending.value = false
  }
}

async function applicationAction(id: string, action: JobApplicationAction) {
  if (busyId.value) return
  const isCurrent = captureIntent()
  busyId.value = id
  errorMessage.value = ''
  try {
    await mutateJobApplicationRequest(id, { action })
    if (isCurrent()) await load()
  } catch (error) {
    if (isCurrent()) errorMessage.value = requestError(error)
  } finally {
    if (isCurrent()) busyId.value = ''
  }
}

async function engagementAction(id: string, action: JobEngagementAction) {
  if (busyId.value) return
  const isCurrent = captureIntent()
  busyId.value = id
  errorMessage.value = ''
  try {
    await mutateJobEngagementRequest(id, { action })
    if (isCurrent()) await load()
  } catch (error) {
    if (isCurrent()) errorMessage.value = requestError(error)
  } finally {
    if (isCurrent()) busyId.value = ''
  }
}

onMounted(load)

definePageMeta({
  layout: 'dashboard',
  nav: {
    visibility: { modules: ['fireux-jobs'], profiles: ['agent'] },
    key: 'dashboard-agent-my-gigs',
    label: 'Hiring',
    icon: 'i-lucide-users-round',
    position: 'middle',
    desktop: false,
    mobile: false,
    group: 'agent',
    profileId: 'agent',
  },
  requiresAuth: true,
})
</script>
