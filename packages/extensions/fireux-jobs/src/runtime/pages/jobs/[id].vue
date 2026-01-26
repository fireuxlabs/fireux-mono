<template>
  <UPage>
    <UPageHeader :title="jobTitle" :description="jobSubtitle">
      <template #ctas>
        <USelect
          v-model="statusLocal"
          :options="statusOptions"
          size="xs"
          class="min-w-[9rem]"
        />
        <UButton size="xs" :loading="saving" @click="saveStatus">
          Save
        </UButton>
      </template>
    </UPageHeader>

    <UPageBody class="pagebody">
      <UAlert
        v-if="!job"
        title="Job not found"
        color="error"
        variant="soft"
      />

      <template v-else>
        <div class="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div class="space-y-6">
            <UCard>
              <template #header>
                <div class="flex items-center justify-between gap-3">
                  <h3 class="font-semibold">Job overview</h3>
                  <UBadge size="xs" variant="soft" :color="statusColor">
                    {{ job?.status || 'open' }}
                  </UBadge>
                </div>
              </template>

              <div class="space-y-4">
                <div class="flex items-start gap-4">
                  <UAvatar
                    :src="job?.kitchen?.place_image || undefined"
                    :alt="job?.title || 'Job'"
                    size="lg"
                  />
                  <div class="space-y-1">
                    <p class="text-base font-semibold text-gray-900">
                      {{ job?.title || 'Untitled job' }}
                    </p>
                    <p class="text-sm text-gray-600">
                      {{ job?.kitchen?.formatted_address || 'Location pending' }}
                    </p>
                  </div>
                </div>

                <div class="grid gap-3 sm:grid-cols-2 text-sm text-gray-600">
                  <div>
                    <p class="text-xs uppercase tracking-wide text-gray-400">Job ID</p>
                    <p class="font-medium text-gray-900">{{ job?.id }}</p>
                  </div>
                  <div>
                    <p class="text-xs uppercase tracking-wide text-gray-400">Created by</p>
                    <p class="font-medium text-gray-900">
                      {{ job?.creator_id || '—' }}
                    </p>
                  </div>
                  <div>
                    <p class="text-xs uppercase tracking-wide text-gray-400">App</p>
                    <p class="font-medium text-gray-900">
                      {{ (job as any)?.app_id || '—' }}
                    </p>
                  </div>
                  <div>
                    <p class="text-xs uppercase tracking-wide text-gray-400">Company</p>
                    <p class="font-medium text-gray-900">
                      {{ companyCard?.title || job?.company_id || '—' }}
                    </p>
                  </div>
                </div>
              </div>
            </UCard>

            <UCard>
              <template #header>
                <div class="flex items-center justify-between">
                  <h3 class="font-semibold">Description</h3>
                </div>
              </template>
              <div class="whitespace-pre-line text-sm text-gray-700">
                {{ job?.description || 'No description provided.' }}
              </div>
            </UCard>

            <UCard>
              <template #header>
                <div class="flex items-center justify-between">
                  <h3 class="font-semibold">Debug JSON</h3>
                </div>
              </template>
              <pre class="max-h-96 overflow-auto rounded-lg bg-gray-900/5 p-4 text-xs text-gray-600">
                {{ jobJson }}
              </pre>
            </UCard>
          </div>

          <div class="space-y-6">
            <UCard>
              <template #header>
                <h3 class="font-semibold">Status</h3>
              </template>
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-gray-600">Current</p>
                  <p class="text-sm font-semibold text-gray-900">
                    {{ job?.status || 'open' }}
                  </p>
                </div>
                <UBadge size="xs" variant="soft" :color="statusColor">
                  {{ job?.status || 'open' }}
                </UBadge>
              </div>
            </UCard>

            <UCard>
              <template #header>
                <h3 class="font-semibold">Location</h3>
              </template>
              <div v-if="kitchenCard" class="space-y-2">
                <KitchenCardsPill v-bind="kitchenCard" :link="Boolean(kitchenCard.to)" />
                <p class="text-xs text-gray-500">Kitchen ID: {{ job?.kitchen_id }}</p>
              </div>
              <p v-else class="text-sm text-gray-600">No kitchen linked.</p>
            </UCard>

            <UCard>
              <template #header>
                <h3 class="font-semibold">Company</h3>
              </template>
              <div v-if="companyCard" class="space-y-2">
                <CompanyCardsPill v-bind="companyCard" :link="Boolean(companyCard.to)" />
                <p class="text-xs text-gray-500">Company ID: {{ job?.company_id }}</p>
              </div>
              <p v-else class="text-sm text-gray-600">No company linked.</p>
            </UCard>
          </div>
        </div>
      </template>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useCompanyFetch } from 'fireux-companies/runtime/composables/fireux/firestore/objects/company/fetch/useCompanyFetch'
import { useCompanyInterface } from 'fireux-companies/runtime/composables/fireux/firestore/objects/company/utils/view/useCompanyInterface'
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify'
import { useKitchenInterface } from 'fireux-kitchens/runtime/composables/fireux/firestore/objects/kitchen/utils/view/useKitchenInterface'
import { useHead } from 'nuxt/app'
import { computed, ref, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import { useJobFetch } from '../../composables/fireux/firestore/jobs/fetch/useJobFetch'
import { useJobUpdate } from '../../composables/fireux/firestore/jobs/mutations/useJobUpdate'
import type { JobStatus } from '../../models/objects/job.model'

const route = useRoute()
const paramId = route.params.id
const jobId = computed(() =>
  Array.isArray(paramId)
    ? paramId[0]?.toString() ?? null
    : paramId?.toString() ?? null
)

const { job } = useJobFetch(jobId)
const { updateJob } = useJobUpdate()
const { withToast } = useToastify()
const { card: kitchenCardFactory } = useKitchenInterface()
const { companies } = useCompanyFetch()
const { card: companyCardFactory } = useCompanyInterface()

const jobTitle = computed(() => job.value?.title || 'Job Details')
const jobSubtitle = computed(() =>
  job.value?.status ? `Status: ${job.value.status}` : 'Job pipeline entry'
)
const statusColor = computed(() =>
  job.value?.status === 'open' ? 'success' : 'neutral'
)

const statusOptions = [
  { label: 'Open', value: 'open' },
  { label: 'Closed', value: 'closed' },
] as const

const statusLocal = ref<JobStatus>('open')
watchEffect(() => {
  statusLocal.value = (job.value?.status as JobStatus) ?? 'open'
})

const jobJson = computed(() => JSON.stringify(job.value ?? null, null, 2))

const kitchenCard = computed(() =>
  job.value?.kitchen ? kitchenCardFactory(job.value.kitchen as any) : null
)

const companyCard = computed(() => {
  const id = String(job.value?.company_id ?? '').trim()
  if (!id) return null
  const found = (companies.value ?? []).find((company) => String(company.id) === id)
  return found ? companyCardFactory(found) : null
})

const saving = ref(false)
const saveStatus = withToast(
  async () => {
    const current = job.value
    if (!current?.id) {
      throw new Error('Job not ready to update')
    }
    saving.value = true
    try {
      await updateJob(current.id, { status: statusLocal.value })
    } finally {
      saving.value = false
    }
  },
  { ok: 'Status updated', fail: 'Failed to update status' }
)

definePageMeta({
  layout: 'default',
})

useHead(() => ({ title: jobTitle.value }))
</script>
