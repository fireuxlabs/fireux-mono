<template>
  <UPage>
    <UPageHeader
      title="Dev · Companies (Ext)"
      description="Collection-first view; filter by missing or extra fields (against the runtime Company model)."
    />

    <UPageBody class="space-y-10">
      <DevPane
        title="Company collection"
        description="Browse companies resolved for this runtime and filter by model drift."
      >
        <div class="flex flex-wrap items-center gap-2 text-xs text-gray-600">
          <span class="font-medium">Drift:</span>

          <UButton
            size="xs"
            :variant="driftKind === 'missing' ? 'solid' : 'ghost'"
            color="primary"
            @click="setDriftKind('missing')"
          >
            Missing
          </UButton>

          <UButton
            size="xs"
            :variant="driftKind === 'extra' ? 'solid' : 'ghost'"
            color="primary"
            @click="setDriftKind('extra')"
          >
            Extra
          </UButton>

          <span class="font-medium ml-2">Filter {{ driftKind }}:</span>

          <UButton
            v-for="option in filterOptions"
            :key="option.value"
            size="xs"
            :variant="selectedField === option.value ? 'solid' : 'ghost'"
            color="primary"
            @click="selectedField = option.value"
          >
            {{ option.label }}
          </UButton>

          <UButton
            size="xs"
            variant="outline"
            :disabled="copying"
            :icon="copying ? 'i-heroicons-arrow-path' : 'i-heroicons-clipboard-document-check'"
            @click="copyFiltered"
          >
            {{ copying ? 'Copying…' : 'Copy filtered drift' }}
          </UButton>
        </div>

        <UAlert
          v-if="!filteredCards.length"
          color="neutral"
          variant="soft"
          icon="i-lucide-inbox"
          title="No matching companies"
          description="Adjust filters or add company documents to Firestore."
        />

        <div v-else class="grid gap-3 md:grid-cols-2">
          <component
            :is="wrapperFor(card)"
            v-for="card in filteredCards"
            :key="card.id"
            v-bind="wrapperPropsFor(card)"
            class="block"
          >
            <CompanyCardsCell
              v-bind="card"
              :prop="taglineById.get(card.id) || ''"
            />
          </component>
        </div>
      </DevPane>

      <DevPane
        title="Companies (JSON)"
        description="Raw collection payload + drift map (copyable)."
        debug-title="Dev · Companies (Ext) · All data"
        :debug-data="allJsonPayload"
        :default-open="false"
      />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useDevClipboard } from 'fireux-core/runtime/composables/dev/useDevClipboard'
import { useDevDriftFilter } from 'fireux-core/runtime/composables/dev/useDevDriftFilter'
import { computed } from 'vue'
import { useCompanyFetch } from '../../composables/fireux/firestore/objects/company/fetch/useCompanyFetch'
import { useCompanyInterface } from '../../composables/fireux/firestore/objects/company/utils/view/useCompanyInterface'
import type { Company as CompanyModel } from '../../models/objects/company.model'
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

const { companies } = useCompanyFetch()
const { card: makeCard } = useCompanyInterface()
const { copyJSON, copying } = useDevClipboard()

const companyList = computed<CompanyModel[]>(() => companies.value ?? [])

const {
  driftKind,
  setDriftKind,
  selectedField,
  driftById,
  filterOptions,
  filteredCollection,
} = useDevDriftFilter({
  collection: companyList,
  runtimeModel: CompanyModelRuntime as unknown as Record<string, unknown>,
})

const filteredCards = computed(() =>
  filteredCollection.value
    .map((company) => makeCard(company))
    .filter((card): card is NonNullable<typeof card> => Boolean(card))
)

const taglineById = computed(() => {
  const map = new Map<string, string>()
  for (const card of filteredCards.value) {
    const drift = driftById.value.get(card.id)
    if (!drift) continue
    const list = driftKind.value === 'missing' ? drift.missing : drift.extra

    const selected = selectedField.value
    if (selected && list.includes(selected)) {
      map.set(card.id, `${driftKind.value === 'missing' ? 'Missing' : 'Extra'}: ${selected}`)
      continue
    }

    const first = list[0]
    if (first) {
      map.set(card.id, `${driftKind.value === 'missing' ? 'Missing' : 'Extra'}: ${first}`)
    }
  }
  return map
})

const filteredPayload = computed(() =>
  filteredCards.value.map((card) => {
    const drift = driftById.value.get(card.id) ?? { missing: [], extra: [] }
    return {
      id: card.id,
      name: card.name,
      website: card.website,
      drift,
    }
  })
)

const allJsonPayload = computed(() => ({
  totalCompanies: companyList.value.length,
  companies: companyList.value,
  driftById: Object.fromEntries(driftById.value),
}))

const copyFiltered = async () => {
  await copyJSON(
    {
      driftKind: driftKind.value,
      selectedField: selectedField.value || null,
      totalCompanies: companyList.value.length,
      companies: filteredPayload.value,
    },
    { label: 'Dev · Companies (Ext) · Filtered drift' }
  )
}

const wrapperFor = (card: { to?: string | null }) => (card.to ? 'NuxtLink' : 'div')
const wrapperPropsFor = (card: { to?: string | null }) => (card.to ? { to: card.to } : {})
</script>
