<!-- FILE: packages/extensions/fireux-jobs/src/runtime/components/Organisms/Jobs/Create/Preview.vue -->
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
            <UBadge size="xs" variant="soft" color="primary">{{ statusLabel }}</UBadge>
            <UBadge v-if="kitchenId" size="xs" variant="soft" color="neutral">
              Kitchen: {{ kitchenId }}
            </UBadge>
            <UBadge v-if="companyId" size="xs" variant="soft" color="neutral">
              Company: {{ companyId }}
            </UBadge>
          </div>
        </div>

        <div v-if="agentCard" class="min-w-[220px]">
          <p class="text-xs uppercase tracking-wide text-gray-400">
            Posted by
          </p>
          <OrganismsProfilesAgentCardsPill
            v-bind="agentCard"
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
            <p class="text-xs uppercase tracking-wide text-gray-400">Location</p>
            <KitchenCardsPill
              v-if="kitchenCard"
              :avatar-url="kitchenCard.avatarUrl"
              :title="kitchenCard.title"
              :subtitle="kitchenCard.subtitle"
              :badges="kitchenCard.badges"
            />
            <p v-else class="text-sm text-gray-700">Not selected</p>
          </div>
          <div class="space-y-2">
            <p class="text-xs uppercase tracking-wide text-gray-400">Company</p>
            <CompanyCardsPill
              v-if="companyCard"
              :avatar-url="companyCard.avatarUrl"
              :title="companyCard.title"
              :subtitle="companyCard.subtitle"
              :badges="companyCard.badges"
            />
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
import { computed } from 'vue';
import { useAgent } from '../../../../../composables/fireux/firestore/profiles/Agent/useAgent';
import { useKitchenFetch } from 'fireux-kitchens/runtime/composables/fireux/firestore/objects/kitchen/fetch/useKitchenFetch'
import { useKitchenInterface } from 'fireux-kitchens/runtime/composables/fireux/firestore/objects/kitchen/utils/view/useKitchenInterface'
import { useCompanyFetch } from 'fireux-companies/runtime/composables/fireux/firestore/objects/company/fetch/useCompanyFetch'
import { useCompanyInterface } from 'fireux-companies/runtime/composables/fireux/firestore/objects/company/utils/view/useCompanyInterface'

import type { JobCreateForm } from '../../../../../composables/fireux/firestore/jobs/mutations/useJobCreate';

const props = defineProps<{
  form: JobCreateForm
}>()

const { coreProfile, card } = useAgent()
const agentCard = computed(() => (coreProfile.value ? card(coreProfile.value) : null))

const title = computed(() => props.form.title.trim() || 'Untitled job')
const description = computed(() => props.form.description.trim())
const kitchenId = computed(() => props.form.kitchen_id.trim())
const companyId = computed(() => props.form.company_id.trim())
const statusLabel = computed(() => (props.form.status === 'closed' ? 'Closed' : 'Open'))

const { kitchens } = useKitchenFetch()
const { card: kitchenCardFactory } = useKitchenInterface()
const { companies } = useCompanyFetch()
const { card: companyCardFactory } = useCompanyInterface()

const selectedKitchen = computed(() =>
  (kitchens.value ?? []).find((kitchen) => String(kitchen.id) === kitchenId.value)
)

const selectedCompany = computed(() =>
  (companies.value ?? []).find((company) => String(company.id) === companyId.value)
)

const kitchenCard = computed(() =>
  selectedKitchen.value ? kitchenCardFactory(selectedKitchen.value as any) : null
)

const companyCard = computed(() =>
  selectedCompany.value ? companyCardFactory(selectedCompany.value as any) : null
)

</script>
