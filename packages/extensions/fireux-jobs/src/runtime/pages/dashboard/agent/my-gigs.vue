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

      <FireState v-if="pending" outcome="pending" />

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

      <UPageGrid v-else>
        <UCard v-for="item in items" :key="item.application.id">
          <template #header>
            <div class="card__header">
              <div>
                <UAvatar
                  :src="item.candidate?.image || undefined"
                  :alt="candidateName(item)"
                  icon="i-lucide-user-round"
                />
                <div>
                  <p>
                    {{ candidateName(item) }}
                  </p>
                  <NuxtLink :to="`/jobs/${item.job.id}`">
                    {{ item.job.title }}
                  </NuxtLink>
                </div>
              </div>
              <UBadge color="neutral" variant="soft">
                {{ label(item.application.status) }}
              </UBadge>
            </div>
          </template>

          <p v-if="item.application.message" class="whitespace-pre-line">
            {{ item.application.message }}
          </p>
          <p v-else>The candidate applied using their Professional profile.</p>

          <div v-if="item.application.status === 'submitted'">
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

          <div v-else-if="item.application.status === 'offered'">
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

          <div v-if="item.engagement">
            <div class="card__header">
              <div>
                <p>Engagement</p>
                <p>
                  {{ label(item.engagement.status) }}
                  · {{ label(item.engagement.contract_type) }}
                </p>
              </div>
              <div>
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
      </UPageGrid>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { useAsyncData } from 'nuxt/app'

import { watch } from 'vue'

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
const {
  mutateJobApplicationRequest,
  mutateJobEngagementRequest,
  captureIntent,
  scopeEpoch,
} = useJobHiringCommands()
const busyId = ref('')
const errorMessage = ref('')
watch(
  scopeEpoch,
  () => {
    busyId.value = ''
    errorMessage.value = ''
  },
  { flush: 'sync' }
)

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
const liveApplications = useAsyncData(
  computed(() => `job-applications:employer:${liveUser.value?.uid || ''}`),
  async (_nuxtApp, { signal }) => {
    const fetchRead = $fetch.create({ signal, cache: 'no-store' })
    return fetchJobApplications('employer', fetchRead)
  },
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
