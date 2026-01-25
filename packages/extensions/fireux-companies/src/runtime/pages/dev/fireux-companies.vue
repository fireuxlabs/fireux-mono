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
                :copy-label="'Copy drift · Companies'"
                :copy-payload="companiesDriftCopyPayload"
                @update:drift-kind="setCompaniesDriftKind"
                @update:selected-field="updateCompaniesSelectedField"
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

        <CompanyCollectionManager :collection="filteredCompaniesResolved" />
      </UCard>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useDevDriftFilter } from 'fireux-core/runtime/composables/dev/useDevDriftFilter'
import { computed } from 'vue'
import { useCompanyFetch } from '../../composables/fireux/firestore/objects/company/fetch/useCompanyFetch'
import { useCompanies } from '../../composables/fireux/firestore/objects/company/useCompanies'
import type { Company, CompanyOverlay } from '../../models/objects/company.model'
import { CompanyOverlay as CompanyModelRuntime } from '../../models/objects/company.model'

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

const { collection } = useCompanies<CompanyOverlay>()
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

const allCompaniesJsonPayload = computed(() => ({
  totalCompanies: companiesCollection.value.length,
  companies: companiesCollection.value,
}))

const hydratedById = computed(() => {
  const map = new Map<string, Company>()
  for (const company of hydratedCompanies.value ?? []) {
    if (company?.id) map.set(String(company.id), company)
  }
  return map
})

const filteredCompaniesResolved = computed(() =>
  filteredCompanies.value
    .map((company) => hydratedById.value.get(String(company.id)))
    .filter(Boolean) as Company[]
)

const filteredCompaniesDriftPayload = computed(() =>
  filteredCompanies.value.map((company) => {
    const drift = companiesDriftById.value.get(company.id) ?? { missing: [], extra: [] }
    return {
      id: company.id,
      name: company.name,
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
