<template>
  <UPage>
    <UPageHeader
      title="Dev · Companies (Ext)"
      description="Model shape for Companies collection."
    />

    <UPageBody class="pagebody">
      <div class="space-y-4">
        <UCard>
          <div class="flex items-center justify-between gap-3">
            <div class="text-sm font-semibold">Demo</div>
            <UButton
              variant="ghost"
              size="xs"
              @click="toggleSection('demo')"
            >
              {{ openSections.demo ? 'Hide' : 'Show' }}
            </UButton>
          </div>
          <div v-show="openSections.demo" class="mt-4">
            <DevCompanyDemo />
          </div>
        </UCard>

        <UCard>
          <div class="flex items-center justify-between gap-3">
            <div class="text-sm font-semibold">Model</div>
            <UButton
              variant="ghost"
              size="xs"
              @click="toggleSection('model')"
            >
              {{ openSections.model ? 'Hide' : 'Show' }}
            </UButton>
          </div>
          <div v-show="openSections.model" class="mt-4">
            <DevModel
              :title="'Companies · Model'"
              :model="companyModelRuntime"
            />
          </div>
        </UCard>

        <UCard>
          <div class="flex items-center justify-between gap-3">
            <div class="text-sm font-semibold">Collection</div>
            <UButton
              variant="ghost"
              size="xs"
              @click="toggleSection('collection')"
            >
              {{ openSections.collection ? 'Hide' : 'Show' }}
            </UButton>
          </div>
          <div v-show="openSections.collection" class="mt-4">
            <UCard>
              <template #header>
                <div class="space-y-3">
                  <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Companies collection
                  </p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    Filter companies by model drift (extra fields) before browsing records.
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
          </div>
        </UCard>
      </div>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useDevDriftFilter } from 'fireux-core/runtime/composables/dev/useDevDriftFilter'
import { computed, reactive } from 'vue'
import type { CompanyHydrated } from '../../composables/fireux/firestore/company/fetch/types'
import { useCompanyFetch } from '../../composables/fireux/firestore/company/fetch/useCompanyFetch'
import { useCompanies } from '../../composables/fireux/firestore/company/useCompanies'
import type { Company } from '../../models/company.model'
import { CompanyModel as CompanyModelRuntime } from '../../models/company.model'

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

const openSections = reactive({
  demo: false,
  model: false,
  collection: false,
})

const toggleSection = (key: keyof typeof openSections) => {
  openSections[key] = !openSections[key]
}

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
  const map = new Map<string, CompanyHydrated>()
  for (const company of hydratedCompanies.value ?? []) {
    if (company?.id) map.set(String(company.id), company)
  }
  return map
})

const filteredCompaniesResolved = computed(() =>
  filteredCompanies.value
    .map((company) => hydratedById.value.get(String(company.id)))
    .filter(Boolean) as CompanyHydrated[]
)

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
  modelPath: 'packages/extensions/fireux-companies/src/runtime/models/company.model.ts',
  driftKind: companiesDriftKind.value,
  selectedField: companiesSelectedField.value || null,
  totalCompanies: filteredCompanies.value.length,
  companies: filteredCompaniesDriftPayload.value,
}))

const updateCompaniesSelectedField = (value: string) => {
  companiesSelectedField.value = value
}
</script>
