<template>
  <UPage>
    <UPageHeader :title="jobTitle" :description="jobSubtitle">
      <template #ctas>
        <UButton
          size="xs"
          variant="ghost"
          color="neutral"
          icon="i-lucide-arrow-left"
          to="/jobs"
        >
          Back
        </UButton>
        <UButton
          v-if="jobId"
          size="xs"
          variant="soft"
          color="neutral"
          icon="i-lucide-pencil"
          :to="`/jobs/edit/${encodeURIComponent(jobId)}`"
        >
          Edit
        </UButton>
      </template>
    </UPageHeader>

    <UPageBody class="pagebody">
      <UAlert v-if="!job" title="Job not found" color="error" variant="soft" />

      <template v-else>
        <DevJson
          :title="'Job (Doc)'"
          context="Job detail page · jobs/[id] · job doc"
          :data="job"
          :default-open="false"
        />

        <div class="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div class="space-y-6">
            <JobCardsProfile
              v-if="job"
              :card="jobCard"
              :job="job"
              :company-card="companyCard"
            />
          </div>

          <div class="space-y-6">
            <UCard>
              <template #header>
                <h3 class="font-semibold">Manage</h3>
              </template>
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm text-gray-600">Current status</p>
                    <p class="text-sm font-semibold text-gray-900">
                      {{ job?.status || 'open' }}
                    </p>
                  </div>
                  <UBadge size="xs" variant="soft" :color="statusColor">
                    {{ job?.status || 'open' }}
                  </UBadge>
                </div>

                <div class="space-y-2">
                  <USelect
                    v-model="statusLocal"
                    :options="statusOptions"
                    size="sm"
                    class="min-w-[9rem]"
                  />
                  <UButton size="sm" :loading="saving" @click="saveStatus">
                    Save status
                  </UButton>
                </div>
              </div>
            </UCard>

            <UCard>
              <template #header>
                <h3 class="font-semibold">Workplace</h3>
              </template>
              <div v-if="job?.workplace_id" class="space-y-2">
                <KitchenPill
                  v-if="job?.workplace_type === 'kitchen'"
                  :id="job.workplace_id"
                />
                <p class="text-xs text-gray-500">
                  Workplace ID: {{ job?.workplace_id }}
                </p>
                <p v-if="job?.workplace_label" class="text-xs text-gray-500">
                  {{ job.workplace_label }}
                </p>
              </div>
              <p v-else class="text-sm text-gray-600">No workplace linked.</p>
            </UCard>

            <UCard>
              <template #header>
                <h3 class="font-semibold">Company</h3>
              </template>
              <div v-if="job?.company_id" class="space-y-2">
                <CompanyCardsPill
                  v-if="companyCard"
                  v-bind="companyCard"
                  :link="Boolean(companyCard.to)"
                />
                <p class="text-xs text-gray-500">
                  Company ID: {{ job?.company_id }}
                </p>
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
import { useCompanyFetch } from 'fireux-companies/runtime/composables/fireux/firestore/company/fetch/useCompanyFetch'
import { useCompanyInterface } from 'fireux-companies/runtime/composables/fireux/firestore/company/utils/view/useCompanyInterface'
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify'
import { useKitchenFetch } from 'fireux-kitchens/runtime/composables/fireux/firestore/kitchen/fetch/useKitchenFetch'
import { useKitchenInterface } from 'fireux-kitchens/runtime/composables/fireux/firestore/kitchen/utils/view/useKitchenInterface'
import { computed, defineComponent, ref, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import JobCardsProfile from '../../components/Job/Cards/Profile.vue'
import { useJobFetch } from '../../composables/fireux/firestore/jobs/fetch/useJobFetch'
import { useJobUpdate } from '../../composables/fireux/firestore/jobs/mutations/useJobUpdate'
import { useJobSeo } from '../../composables/fireux/firestore/jobs/utils/useJobSeo'
import { useJobInterface } from '../../composables/fireux/firestore/jobs/utils/view/useJobInterface'
import type { JobStatus } from '../../models/job.model'

const route = useRoute()
const jobId = computed(() => {
  const raw = route.params.id
  return Array.isArray(raw)
    ? (raw[0]?.toString() ?? null)
    : (raw?.toString() ?? null)
})

const { job } = useJobFetch(jobId)
const { updateJob } = useJobUpdate()
const { withToast } = useToastify()
const { profile: jobCardFactory } = useJobInterface()
const companyInterface = useCompanyInterface()

const KitchenPill = defineComponent({
  props: { id: String },
  setup(props) {
    const kitchenId = computed(() => String(props.id || '').trim())
    const { kitchen: kitchenData } = useKitchenFetch(kitchenId)
    const kitchenInterface = useKitchenInterface()
    const kitchenCard = computed(() => kitchenInterface.pill(kitchenData.value))
    return { kitchenCard }
  },
  template: `
    <div v-if="kitchenCard" class="pill">
      <UUser
        :name="kitchenCard.title"
        :description="kitchenCard.subtitle"
        :avatar="{ src: kitchenCard.imageUrl, alt: kitchenCard.title }"
        size="sm"
      />
    </div>
  `,
})

const jobTitle = computed(() => job.value?.title || 'Job Details')
const jobSubtitle = computed(() =>
  job.value?.status ? `Status: ${job.value.status}` : 'Job pipeline entry'
)
const statusColor = computed(() =>
  job.value?.status === 'open' ? 'emerald' : 'neutral'
)

const statusOptions = [
  { label: 'Open', value: 'open' },
  { label: 'Closed', value: 'closed' },
] as const

const statusLocal = ref<JobStatus>('open')
watchEffect(() => {
  statusLocal.value = (job.value?.status as JobStatus) ?? 'open'
})

const jobCard = computed(() => (job.value ? jobCardFactory(job.value) : null))
const jobCompanyId = computed(() => {
  const value = String(job.value?.company_id ?? '').trim()
  return value || null
})
const { company: companyData } = useCompanyFetch(jobCompanyId)
const companyCard = computed(() => companyInterface.pill(companyData.value))

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

useJobSeo(job)
</script>
