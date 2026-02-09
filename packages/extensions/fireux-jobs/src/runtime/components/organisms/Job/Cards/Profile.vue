<template>
  <UCard v-if="card || job">
    <div>
      <div v-if="card">
        <!-- Company pill only (workplace is implicit via subtitle/image) -->
        <CompanyPill v-if="card.companyId" :id="card.companyId" />

        <div>
          <div>
            <div>{{ card.title }}</div>
            <UBadge
              v-if="card.status"
            >
              {{ card.status === 'open' ? 'Open' : card.status }}
            </UBadge>
          </div>

          <div v-if="card.subtitle">
            {{ card.subtitle }}
          </div>

          <div v-if="card.description">
            {{ card.description }}
          </div>

          <div v-if="card.badges?.length">
            <UBadge
              v-for="badge in card.badges"
              :key="badge"
            >
              {{ badge }}
            </UBadge>
          </div>
        </div>
      </div>

      <div v-if="job">
        <h3>Job payload</h3>

        <div>
          <div
            v-for="field in jobFields"
            :key="field.key"
          >
            <div>{{ field.label }}</div>
            <div>{{ field.value }}</div>
          </div>
        </div>

        <div>
          <div>Raw</div>
          <pre>{{ jobJson }}</pre>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { useCompanyFetch } from 'fireux-companies/runtime/composables/fireux/firestore/company/fetch/useCompanyFetch';
import { useCompanyInterface } from 'fireux-companies/runtime/composables/fireux/firestore/company/utils/view/useCompanyInterface';
import { computed, defineComponent } from 'vue';
import type { JobCard } from '../../../../composables/fireux/firestore/jobs/utils/view/useJobInterface';
import type { JobResolved } from '../../../../../models/job.model';

const props = defineProps<{ card?: JobCard.Card; job?: JobResolved | null }>()

const formatValue = (value: unknown): string => {
  if (value === null || value === undefined) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  return JSON.stringify(value, null, 2)
}

const jobFields = computed(() => {
  const job = props.job
  if (!job) return [] as Array<{ key: string; label: string; value: string }>
  return [
    { key: 'id', label: 'id', value: formatValue(job.id) },
    { key: 'company_id', label: 'company_id', value: formatValue(job.company_id) },
    { key: 'workplace_type', label: 'workplace_type', value: formatValue(job.workplace_type) },
    { key: 'workplace_id', label: 'workplace_id', value: formatValue(job.workplace_id) },
    { key: 'workplace_label', label: 'workplace_label', value: formatValue(job.workplace_label) },
    { key: 'job_type', label: 'job_type', value: formatValue(job.job_type) },
    { key: 'openings_count', label: 'openings_count', value: formatValue(job.openings_count) },
    { key: 'pay_currency', label: 'pay_currency', value: formatValue(job.pay_currency) },
    { key: 'pay_rate', label: 'pay_rate', value: formatValue(job.pay_rate) },
    { key: 'pay_unit', label: 'pay_unit', value: formatValue(job.pay_unit) },
    { key: 'start_at', label: 'start_at', value: formatValue(job.start_at) },
    { key: 'end_at', label: 'end_at', value: formatValue(job.end_at) },
    { key: 'title', label: 'title', value: formatValue(job.title) },
    { key: 'description', label: 'description', value: formatValue(job.description) },
    { key: 'status', label: 'status', value: formatValue(job.status) },
    { key: 'app_id', label: 'app_id', value: formatValue(job.app_id) },
    { key: 'creator_id', label: 'creator_id', value: formatValue(job.creator_id) },
    { key: 'created_at', label: 'created_at', value: formatValue(job.created_at) },
    { key: 'updated_at', label: 'updated_at', value: formatValue(job.updated_at) },
    { key: 'workplace', label: 'workplace', value: formatValue((job as any).workplace) },
  ]
})

const jobJson = computed(() => (props.job ? JSON.stringify(props.job, null, 2) : ''))

const CompanyPill = defineComponent({
  props: { id: String },
  setup(props) {
    const { company } = useCompanyFetch()
    const companyData = computed(() => (props.id ? company(props.id).value : null))
    const companyInterface = useCompanyInterface()
    const companyCard = computed(() => companyInterface.card(companyData.value))
    return { companyCard }
  },
  template: `
    <div v-if="companyCard">
      <UUser
        :name="companyCard.title"
        :description="companyCard.subtitle"
        :avatar="{ src: companyCard.avatarUrl, alt: companyCard.title }"
      />
    </div>
  `,
})
</script>
