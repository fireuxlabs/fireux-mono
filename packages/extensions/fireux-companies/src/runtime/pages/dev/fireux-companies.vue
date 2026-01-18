<template>
  <UPage>
    <UPageHeader
      title="Dev · Companies (Ext)"
      description="Model shape for Companies collection."
    />

    <UPageBody class="space-y-6">
      <UCard>
        <DevModel
          :title="'Companies · Model'"
          :model="companyModelRuntime"
        />
      </UCard>

      <UCard>
        <template #header>
          <div class="flex items-start justify-between gap-3">
            <div class="space-y-3">
              <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Companies collection
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                Browse companies resolved for this runtime and filter by model drift.
              </p>
              <DevDriftToolbar
                :drift-kind="companiesDriftKind"
                :selected-field="companiesSelectedField"
                :filter-options="companiesFilterOptions"
                :copy-label="copying ? 'Copying…' : 'Copy drift · Companies'"
                :copy-icon="copying ? 'i-heroicons-arrow-path' : 'i-heroicons-clipboard-document-check'"
                :copy-disabled="copying"
                @update:drift-kind="setCompaniesDriftKind"
                @update:selected-field="updateCompaniesSelectedField"
                @copy="copyCompaniesDrift"
              />
            </div>
          </div>
        </template>

        <template #footer>
          <DevJson
            :title="'Companies (JSON)'"
            :data="allCompaniesJsonPayload"
            :default-open="false"
          />
        </template>

        <CompanyCollectionManager :cards="cards" />
      </UCard>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useDevClipboard } from 'fireux-core/runtime/composables/dev/useDevClipboard'
import { useDevDriftFilter } from 'fireux-core/runtime/composables/dev/useDevDriftFilter'
import { computed } from 'vue'
import { useCompanyFetch } from '../../composables/fireux/firestore/objects/company/fetch/useCompanyFetch'
import { useCompanyInterface } from '../../composables/fireux/firestore/objects/company/utils/view/useCompanyInterface'
import { Company as CompanyModelRuntime } from '../../models/objects/company.model'

definePageMeta({
  layout: 'dev',
  nav: {
    key: 'dev-ext-companies',
    label: 'Companies (Ext)',
    icon: 'i-lucide-building-2',
    desktop: true,
    group: 'ext',
    layouts: ['dev'],
  },
})

const companyModelRuntime = CompanyModelRuntime

const { companies } = useCompanyFetch()
const { card: makeCard } = useCompanyInterface()

const companiesCollection = computed(() => companies.value ?? [])

const {
  driftKind: companiesDriftKind,
  setDriftKind: setCompaniesDriftKind,
  selectedField: companiesSelectedField,
  driftById: companiesDriftById,
  filterOptions: companiesFilterOptions,
  filteredCollection: filteredCompanies,
} = useDevDriftFilter({
  collection: companiesCollection,
  runtimeModel: companyModelRuntime,
})

const cards = computed(() =>
  filteredCompanies.value
    .map((company) => makeCard(company))
    .filter((c): c is NonNullable<typeof c> => Boolean(c))
)

const allCompaniesJsonPayload = computed(() => ({
  totalCompanies: companiesCollection.value.length,
  companies: companiesCollection.value,
}))

const filteredCompaniesDriftPayload = computed(() =>
  cards.value.map((card) => {
    const drift = companiesDriftById.value.get(card.id) ?? { missing: [], extra: [] }
    return {
      id: card.id,
      name: card.name,
      drift,
    }
  })
)

const { copyJSON, copying } = useDevClipboard()

const copyCompaniesDrift = async () => {
  await copyJSON(
    {
      modelPath: 'packages/extensions/fireux-companies/src/runtime/models/objects/company.model.ts',
      driftKind: companiesDriftKind.value,
      selectedField: companiesSelectedField.value || null,
      totalCompanies: cards.value.length,
      companies: filteredCompaniesDriftPayload.value,
    },
    { label: 'Dev · Companies · Filtered drift' }
  )
}

const updateCompaniesSelectedField = (value: string) => {
  companiesSelectedField.value = value
}
</script>
