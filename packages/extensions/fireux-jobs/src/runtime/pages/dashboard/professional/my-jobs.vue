<template>
  <UDashboardPanel id="dashboard-professional-my-work">
    <template #header>
      <LayoutsDashboardNavbar title="Applications & work" />
    </template>

    <template #body>
      <UAlert
        icon="i-lucide-briefcase"
        color="neutral"
        title="Applications and work"
        description="Track applications, accept direct-employment offers and follow active work."
      />

      <UAlert
        v-if="errorMessage"
        color="error"
        variant="soft"
        title="Applications & work unavailable"
        :description="errorMessage"
      />

      <div v-if="pending" class="grid gap-4 lg:grid-cols-2">
        <USkeleton v-for="index in 2" :key="index" class="h-48 rounded-xl" />
      </div>

      <UAlert
        v-else-if="!items.length && !errorMessage"
        color="neutral"
        variant="soft"
        icon="i-lucide-inbox"
        title="No applications yet"
        description="Browse open jobs and apply when you find the right role."
      >
        <template #actions>
          <UButton to="/jobs" color="neutral" variant="soft">
            Browse jobs
          </UButton>
        </template>
      </UAlert>

      <div v-else class="grid gap-4 lg:grid-cols-2">
        <UCard v-for="item in items" :key="item.application.id">
          <template #header>
            <div class="flex items-start justify-between gap-3">
              <div>
                <NuxtLink
                  :to="`/jobs/${item.job.id}`"
                  class="font-semibold text-highlighted hover:text-primary"
                >
                  {{ item.job.title }}
                </NuxtLink>
                <p class="mt-1 text-xs text-muted">
                  {{ contractLabel(item.job.contract_type) }}
                </p>
              </div>
              <UBadge color="neutral" variant="soft">
                {{ statusLabel(item.application.status) }}
              </UBadge>
            </div>
          </template>

          <p
            v-if="item.application.message"
            class="whitespace-pre-line text-sm text-muted"
          >
            {{ item.application.message }}
          </p>

          <UAlert
            v-if="item.application.status === 'offered'"
            class="mt-4"
            color="primary"
            variant="soft"
            title="The employer has made an offer"
            description="Before accepting, review the job terms. The named employer—not the platform—will employ and pay you directly."
          />

          <div
            v-if="item.application.status === 'offered'"
            class="mt-4 space-y-3"
          >
            <UCheckbox
              v-model="acceptedTerms[item.application.id]"
              label="I understand that the employer will employ and pay me directly."
            />
            <div class="flex flex-wrap gap-2">
              <UButton
                size="sm"
                icon="i-lucide-handshake"
                :disabled="!acceptedTerms[item.application.id]"
                :loading="busyId === item.application.id"
                @click="act(item.application.id, 'accept')"
              >
                Accept offer
              </UButton>
              <UButton
                size="sm"
                color="neutral"
                variant="soft"
                :disabled="Boolean(busyId)"
                @click="act(item.application.id, 'withdraw')"
              >
                Withdraw
              </UButton>
            </div>
          </div>

          <div v-else-if="item.application.status === 'submitted'" class="mt-4">
            <UButton
              size="sm"
              color="neutral"
              variant="soft"
              :loading="busyId === item.application.id"
              @click="act(item.application.id, 'withdraw')"
            >
              Withdraw application
            </UButton>
          </div>

          <div v-if="item.engagement" class="mt-4 border-t border-default pt-4">
            <p class="text-xs font-semibold uppercase tracking-wide text-muted">
              Engagement
            </p>
            <p class="mt-1 text-sm text-highlighted">
              {{ statusLabel(item.engagement.status) }}
            </p>
          </div>
        </UCard>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import {
  fetchJobApplications,
  mutateJobApplicationRequest,
} from '../../../job/composables/hiring/jobHiringClient'
import type { JobApplicationAction } from '../../../job/models/job-application.model.ts'
import type { JobApplicationView } from '../../../job/models/job-hiring.model.ts'

const items = ref<JobApplicationView[]>([])
const pending = ref(true)
const busyId = ref('')
const errorMessage = ref('')
const acceptedTerms = reactive<Record<string, boolean>>({})

function label(value: string): string {
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase())
}

const statusLabel = label
const contractLabel = label

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

async function load() {
  pending.value = true
  errorMessage.value = ''
  try {
    const response = await fetchJobApplications('candidate')
    items.value = response.items
  } catch (error) {
    errorMessage.value = requestError(error)
  } finally {
    pending.value = false
  }
}

async function act(id: string, action: JobApplicationAction) {
  if (busyId.value) return
  busyId.value = id
  errorMessage.value = ''
  try {
    await mutateJobApplicationRequest(id, {
      action,
      ...(action === 'accept'
        ? { accept_direct_employment_terms: acceptedTerms[id] === true }
        : {}),
    })
    await load()
  } catch (error) {
    errorMessage.value = requestError(error)
  } finally {
    busyId.value = ''
  }
}

onMounted(load)

definePageMeta({
  layout: 'dashboard',
  nav: {
    visibility: { modules: ['fireux-jobs'], profiles: ['professional'] },
    key: 'dashboard-professional-my-work',
    label: 'Applications & work',
    icon: 'i-lucide-briefcase-business',
    position: 'middle',
    desktop: false,
    mobile: false,
    group: 'professional',
    profileId: 'professional',
  },
  requiresAuth: true,
})
</script>
