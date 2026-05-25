<!-- FILE: packages/extensions/fireux-jobs/src/runtime/components/Jobs/Create/Preview.vue -->
<!-- NOTE for Copilot:
  - This is the PREVIEW surface for job creation.
  - It renders the SAME shape as useJobCreate().form.
  - This card will later mirror the pipeline/job list UI.
-->

<template>
  <UCard>
    <template #header>
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="space-y-1">
          <p class="text-xs uppercase tracking-wide text-gray-400">Preview</p>
          <h3 class="text-base font-semibold text-gray-900">
            {{ title }}
          </h3>

          <div class="flex flex-wrap items-center gap-2">
            <UBadge size="xs" variant="soft" color="primary">{{
              statusLabel
            }}</UBadge>
            <UBadge v-if="workplaceId" size="xs" variant="soft" color="neutral">
              Workplace: {{ workplaceId }}
            </UBadge>
            <UBadge v-if="companyId" size="xs" variant="soft" color="neutral">
              Company: {{ companyId }}
            </UBadge>
          </div>
        </div>

        <div v-if="agentCard" class="min-w-[220px]">
          <p class="text-xs uppercase tracking-wide text-gray-400">Posted by</p>
          <AgentCardsPill
            v-bind="agentCard"
            :badges="agentCard?.badges ?? []"
            :show-subtitle="false"
            :link="Boolean(agentCard.to)"
            class="block"
          />
        </div>
      </div>
    </template>

    <div class="space-y-4 text-sm text-gray-600">
      <div class="rounded-lg border border-gray-100 bg-gray-50/60 p-4">
        <div class="grid gap-4 md:grid-cols-2">
          <div class="space-y-2">
            <p class="text-xs uppercase tracking-wide text-gray-400">
              Workplace
            </p>
            <KitchenPill
              v-if="workplaceType === 'kitchen' && workplaceId"
              :id="workplaceId"
            />
            <p v-else-if="workplaceLabel" class="text-sm text-gray-700">
              {{ workplaceLabel }}
            </p>
            <p v-else class="text-sm text-gray-700">Not selected</p>
          </div>
          <div class="space-y-2">
            <p class="text-xs uppercase tracking-wide text-gray-400">Company</p>
            <CompanyPill v-if="companyId" :id="companyId" />
            <p v-else class="text-sm text-gray-700">Not set</p>
          </div>
        </div>
      </div>

      <div class="rounded-lg border border-gray-100 bg-gray-50/60 p-4">
        <p class="text-xs uppercase tracking-wide text-gray-400">Description</p>
        <p class="whitespace-pre-line text-sm text-gray-700">
          {{ description || 'No description yet.' }}
        </p>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { useCompanyFetch } from 'fireux-companies/runtime/composables/fireux/firestore/company/fetch/useCompanyFetch'
import { useCompanyInterface } from 'fireux-companies/runtime/composables/fireux/firestore/company/utils/view/useCompanyInterface'
import { useKitchenCollection } from 'fireux-kitchens/runtime/composables/fireux/firestore/kitchen/fetch/useKitchenCollection'
import { useKitchenFetch } from 'fireux-kitchens/runtime/composables/fireux/firestore/kitchen/fetch/useKitchenFetch'
import { useKitchenInterface } from 'fireux-kitchens/runtime/composables/fireux/firestore/kitchen/utils/view/useKitchenInterface'
import { computed, defineComponent } from 'vue'
import { useAgent } from '../../../../composables/fireux/firestore/profiles/Agent/useAgent'

import type { JobCreateForm } from '../../../../composables/fireux/firestore/jobs/mutations/useJobCreate'

// Local components for Kitchen and Company pills
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

const CompanyPill = defineComponent({
  props: { id: String },
  setup(props) {
    const { company } = useCompanyFetch()
    const companyData = computed(() =>
      props.id ? company(props.id).value : null
    )
    const companyInterface = useCompanyInterface()
    const companyCard = computed(() => companyInterface.pill(companyData.value))
    return { companyCard }
  },
  template: `
    <div v-if="companyCard" class="pill">
      <UUser
        :name="companyCard.title"
        :description="companyCard.subtitle"
        :avatar="{ src: companyCard.imageUrl, alt: companyCard.title }"
        size="sm"
      />
    </div>
  `,
})

const props = defineProps<{
  form: JobCreateForm
}>()

const { coreProfile, pill: agentInterface } = useAgent()
const agentCard = computed(() =>
  coreProfile.value ? agentInterface(coreProfile.value) : null
)

const title = computed(() => props.form.title.trim() || 'Untitled job')
const description = computed(() => props.form.description.trim())
const workplaceId = computed(() => props.form.workplace_id.trim())
const workplaceType = computed(() => props.form.workplace_type.trim())
const workplaceLabel = computed(() => props.form.workplace_label.trim())
const companyId = computed(() => props.form.company_id.trim())
const statusLabel = computed(() =>
  props.form.status === 'closed' ? 'Closed' : 'Open'
)

const { kitchens } = useKitchenCollection()
const { companies } = useCompanyFetch()

const selectedKitchen = computed(() =>
  (kitchens.value ?? []).find(
    (kitchen) => String(kitchen.id) === workplaceId.value
  )
)

const selectedCompany = computed(() =>
  (companies.value ?? []).find(
    (company) => String(company.id) === companyId.value
  )
)
</script>
