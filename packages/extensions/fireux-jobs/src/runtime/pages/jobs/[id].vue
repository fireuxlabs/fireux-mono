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
      <UAlert
        v-if="!job"
        title="Job not found"
        color="error"
        variant="soft"
      />

      <template v-else>
        <section class="fireux-page-hero">
          <div class="fireux-page-hero__grid">
            <div class="fireux-page-hero__content">
              <div class="fireux-page-hero__eyebrow">
                Job
              </div>

              <div class="space-y-3">
                <h2 class="fireux-page-hero__title">
                  {{ jobTitle }}
                </h2>
                <p class="fireux-page-hero__description">
                  {{ heroDescription }}
                </p>
              </div>

              <div class="fireux-page-hero__badges">
                <UBadge size="sm" variant="soft" :color="statusColor">
                  {{ job?.status || 'open' }}
                </UBadge>
                <UBadge
                  v-if="job?.job_type"
                  size="sm"
                  variant="soft"
                  color="neutral"
                >
                  {{ heroJobType }}
                </UBadge>
                <UBadge
                  v-if="job?.workplace_type"
                  size="sm"
                  variant="soft"
                  color="neutral"
                >
                  {{ workplaceTypeLabel }}
                </UBadge>
              </div>

              <div class="fireux-page-hero__actions">
                <UButton
                  v-if="job?.workplace_type === 'kitchen' && job?.workplace_id"
                  color="primary"
                  icon="i-lucide-utensils-crossed"
                  :to="`/kitchens/${encodeURIComponent(job.workplace_id)}`"
                >
                  View workplace
                </UButton>
                <UButton
                  v-if="job?.company_id"
                  variant="soft"
                  color="neutral"
                  icon="i-lucide-building-2"
                  :to="`/companies/${encodeURIComponent(job.company_id)}`"
                >
                  View company
                </UButton>
                <UButton
                  variant="ghost"
                  color="neutral"
                  icon="i-lucide-briefcase-business"
                  to="/jobs"
                >
                  Browse jobs
                </UButton>
              </div>

              <div class="fireux-page-hero__facts text-sm text-dimmed">
                <span v-if="job?.workplace_label">{{ job.workplace_label }}</span>
                <span v-if="job?.company_id">Company linked</span>
              </div>
            </div>

            <div class="space-y-4">
              <div class="fireux-page-hero__visual">
                <img
                  v-if="heroImageUrl"
                  :src="heroImageUrl"
                  :alt="jobTitle"
                >
                <div v-else class="flex h-full items-center justify-center text-sm text-dimmed">
                  Workplace imagery coming soon
                </div>
                <div class="fireux-page-hero__visual-overlay">
                  <div class="text-sm font-semibold">
                    {{ job?.workplace_label || jobSubtitle }}
                  </div>
                  <div class="text-xs opacity-80">
                    {{ heroVisualCaption }}
                  </div>
                </div>
              </div>

              <div class="fireux-page-hero__stats">
                <div class="fireux-page-hero__stat">
                  <div class="fireux-page-hero__stat-value">
                    {{ payLabel }}
                  </div>
                  <div class="fireux-page-hero__stat-label">
                    Compensation
                  </div>
                </div>
                <div class="fireux-page-hero__stat">
                  <div class="fireux-page-hero__stat-value">
                    {{ openingsLabel }}
                  </div>
                  <div class="fireux-page-hero__stat-label">
                    Open positions
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div class="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div class="space-y-6">
            <JobCardsProfile
              v-if="job"
              class="fireux-page-surface"
              :card="jobCard"
              :job="job"
            />
          </div>

          <div class="space-y-6">
            <UCard class="fireux-page-surface">
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

            <UCard class="fireux-page-surface">
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

            <UCard class="fireux-page-surface">
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
const jobId = computed(() => {
  const raw = route.params.id
  return Array.isArray(raw)
    ? raw[0]?.toString() ?? null
    : raw?.toString() ?? null
})

const { job } = useJobFetch(jobId)
const { updateJob } = useJobUpdate()
const { withToast } = useToastify()
const { card: jobCardFactory } = useJobInterface()

const KitchenPill = defineComponent({
  props: { id: String },
  setup(props) {
    const { kitchen } = useKitchenFetch()
    const kitchenData = computed(() => props.id ? kitchen(props.id).value : null)
    const kitchenInterface = useKitchenInterface()
    const kitchenCard = computed(() => kitchenInterface.card(kitchenData.value))
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

const CompanyPill = defineComponent({
  props: { id: String },
  setup(props) {
    const { company } = useCompanyFetch()
    const companyData = computed(() => props.id ? company(props.id).value : null)
    const companyInterface = useCompanyInterface()
    const companyCard = computed(() => companyInterface.card(companyData.value))
    return { companyCard }
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
  `,
})

const jobTitle = computed(() => job.value?.title || 'Job Details')
const jobSubtitle = computed(() =>
  job.value?.status ? `Status: ${job.value.status}` : 'Job pipeline entry'
)
const heroDescription = computed(() =>
  String(job.value?.description || '').trim() ||
  'A live FireUX role surface linking workplace, company, and hiring intent.'
)
const statusColor = computed(() =>
  job.value?.status === 'open' ? 'emerald' : 'neutral'
)
const heroImageUrl = computed(() => String(jobCard.value?.imageUrl || '').trim())
const payLabel = computed(() => {
  const current = job.value
  if (!current?.pay_rate) return 'Discuss'
  return `${current.pay_currency || 'CHF'} ${current.pay_rate}/${current.pay_unit || 'hour'}`
})
const openingsLabel = computed(() => {
  const count = Number(job.value?.openings_count || 0)
  return count > 0 ? `${count}` : 'Flexible'
})
const heroJobType = computed(() => {
  const value = String(job.value?.job_type || '').trim()
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : 'Role'
})
const workplaceTypeLabel = computed(() => {
  const value = String(job.value?.workplace_type || '').trim()
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : 'Workplace'
})
const heroVisualCaption = computed(() =>
  String(job.value?.workplace_type || '').trim() || 'Hiring surface'
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
