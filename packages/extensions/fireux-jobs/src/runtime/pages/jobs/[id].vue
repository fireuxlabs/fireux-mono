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
            <JobCardsProfile v-if="job" :card="jobCard" :job="job" />
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
                <h3 class="font-semibold">Workplace</h3>
              </template>
              <div v-if="job?.workplace_id" class="space-y-2">
                <KitchenPill v-if="job?.workplace_type === 'kitchen'" :id="job.workplace_id" />
                <p class="text-xs text-gray-500">Workplace ID: {{ job?.workplace_id }}</p>
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
                <CompanyPill :id="job.company_id" />
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
import { useCompanyFetch } from 'fireux-companies/runtime/composables/fireux/firestore/company/fetch/useCompanyFetch'
import { useCompanyInterface } from 'fireux-companies/runtime/composables/fireux/firestore/company/utils/view/useCompanyInterface'
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify'
import { useKitchenFetch } from 'fireux-kitchens/runtime/composables/fireux/firestore/kitchen/fetch/useKitchenFetch'
import { useKitchenInterface } from 'fireux-kitchens/runtime/composables/fireux/firestore/kitchen/utils/view/useKitchenInterface'
import { useHead } from 'nuxt/app'
import { computed, defineComponent, ref, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import JobCardsProfile from '../../components/organisms/Job/Cards/Profile.vue'
import { useJobFetch } from '../../composables/fireux/firestore/jobs/fetch/useJobFetch'
import { useJobUpdate } from '../../composables/fireux/firestore/jobs/mutations/useJobUpdate'
import { useJobInterface } from '../../composables/fireux/firestore/jobs/utils/view/useJobInterface'
import type { JobStatus } from '../../models/job.model'

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
const { card: jobCardFactory } = useJobInterface()

// Local components for Kitchen and Company pills
const KitchenPill = defineComponent({
  props: { id: String },
  setup(props) {
    const { kitchen } = useKitchenFetch();
    const kitchenData = computed(() => props.id ? kitchen(props.id).value : null);
    const kitchenInterface = useKitchenInterface();
    const kitchenCard = computed(() => kitchenInterface.card(kitchenData.value));
    return { kitchenCard };
  },
  template: `
    <div v-if="kitchenCard" class="pill">
      <UUser
        :name="kitchenCard.title"
        :description="kitchenCard.subtitle"
        :avatar="{ src: kitchenCard.avatarUrl, alt: kitchenCard.title }"
        size="sm"
      />
    </div>
  `
});

const CompanyPill = defineComponent({
  props: { id: String },
  setup(props) {
    const { company } = useCompanyFetch();
    const companyData = computed(() => props.id ? company(props.id).value : null);
    const companyInterface = useCompanyInterface();
    const companyCard = computed(() => companyInterface.card(companyData.value));
    return { companyCard };
  },
  template: `
    <div v-if="companyCard" class="pill">
      <UUser
        :name="companyCard.title"
        :description="companyCard.subtitle"
        :avatar="{ src: companyCard.avatarUrl, alt: companyCard.title }"
        size="sm"
      />
    </div>
  `
});

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

const jobCard = computed(() => job.value ? jobCardFactory(job.value) : null)

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
