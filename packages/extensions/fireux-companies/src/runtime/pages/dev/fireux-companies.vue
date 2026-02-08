<template>
  <UPage>
    <UPageHeader
      title="Dev · Companies (Ext)"
      description="Model shape for Companies collection."
    />

    <UPageBody class="pagebody">
      <DevCompanyDummy />

      <DevModel
        :title="'Companies · Model'"
        :model="companyModelRuntime"
      />

      <UCard>
        <template #header>
          <div class="space-y-3">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Companies collection
              </p>
              <UBadge variant="soft">{{ visibleCompanies }} / {{ totalCompanies }}</UBadge>
            </div>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              Filter companies by model drift before browsing records.
            </p>
            <DevDriftToolbar
              :drift-kind="companiesDriftKind"
              :selected-field="companiesSelectedField"
              :filter-options="companiesFilterOptions"
              :copy-label="'Copy drift · Companies'"
              :copy-payload="companiesDriftCopyPayload"
              @update:drift-kind="setCompaniesDriftKind"
              @update:selected-field="updateCompaniesSelectedField"
            />
          </div>
        </template>
      </UCard>

      <CompanyCollectionManager :collection="filteredCompaniesResolved" />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useDevDriftFilter } from 'fireux-core/runtime/composables/dev/useDevDriftFilter'
import { computed } from 'vue'
import { useCompanyFetch } from '../../composables/fireux/firestore/objects/company/fetch/useCompanyFetch'
import { useCompanies } from '../../composables/fireux/firestore/objects/company/useCompanies'
import type { Company, CompanyView } from '../../models/objects/company.model'
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

const { collection } = useCompanies<Company>()
const { companies: hydratedCompanies } = useCompanyFetch()

const companiesCollection = computed(() => collection.value ?? [])

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


const hydratedById = computed(() => {
  const map = new Map<string, CompanyView>()
  for (const company of hydratedCompanies.value ?? []) {
    if (company?.id) map.set(String(company.id), company)
  }
  return map
})

const filteredCompaniesResolved = computed(() =>
  filteredCompanies.value
    .map((company) => hydratedById.value.get(String(company.id)))
    .filter(Boolean) as CompanyView[]
)

const totalCompanies = computed(() => companiesCollection.value.length)
const visibleCompanies = computed(() => filteredCompaniesResolved.value.length)

const filteredCompaniesDriftPayload = computed(() =>
  filteredCompanies.value.map((company) => {
    const drift = companiesDriftById.value.get(company.id) ?? { missing: [], extra: [] }
    const hydrated = hydratedById.value.get(company.id)
    return {
      id: company.id,
      name: hydrated?.name ?? '',
      drift,
    }
  })
)

const companiesDriftCopyPayload = computed(() => ({
  modelPath: 'packages/extensions/fireux-companies/src/runtime/models/objects/company.model.ts',
  driftKind: companiesDriftKind.value,
  selectedField: companiesSelectedField.value || null,
  totalCompanies: filteredCompanies.value.length,
  companies: filteredCompaniesDriftPayload.value,
}))

const updateCompaniesSelectedField = (value: string) => {
  companiesSelectedField.value = value
}
</script>
