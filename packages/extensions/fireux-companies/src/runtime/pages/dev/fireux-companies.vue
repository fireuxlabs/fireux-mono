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
          <OrganismsObjectsCompanyCardsCell
            v-for="card in filteredCards"
            :key="card.id"
            :to="card.to"
            :name="card.name"
            :website="card.website"
            :badges="card.badges"
            :avatar-url="card.avatarUrl"
            :prop="taglineById.get(card.id) || ''"
          />
        </div>
      </DevPane>

      <div class="flex justify-end">
        <UButton
          size="xs"
          variant="outline"
          :disabled="copying"
          :icon="copying ? 'i-heroicons-arrow-path' : 'i-heroicons-clipboard-document'"
          @click="copyAll"
        >
          {{ copying ? 'Copying…' : 'Copy all (JSON)' }}
        </UButton>
      </div>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useCompanyFetch } from '../../composables/fireux/firestore/objects/company/fetch/useCompanyFetch'
import { useCompanyInterface } from '../../composables/fireux/firestore/objects/company/utils/view/useCompanyInterface'
import { useDevClipboard } from 'fireux-core/runtime/composables/dev/useDevClipboard'
import {
  humanizeDriftPath,
  resolveDriftFromModel,
  type DriftKind,
  type ModelDrift,
} from 'fireux-core/runtime/composables/dev/useModelDrift'
import { Company as CompanyModelRuntime } from '../../models/objects/company.model'
import type { Company as CompanyModel } from '../../models/objects/company.model'

definePageMeta({
  layout: 'dev',
  alias: ['/dev/fireux-companies'],
  nav: {
    key: 'dev-ext-companies',
    label: 'Companies (Ext)',
    icon: 'i-lucide-building-2',
    desktop: true,
    group: 'ext',
    layouts: ['dev'],
  },
})

const { copyJSON, copying } = useDevClipboard()
const { companies } = useCompanyFetch()
const { card: makeCard } = useCompanyInterface()

const companyList = computed<CompanyModel[]>(() => companies.value ?? [])

const companyCards = computed(() =>
  companyList.value
    .map((c) => makeCard(c))
    .filter((card): card is NonNullable<typeof card> => Boolean(card))
)

type DriftById = Map<string, ModelDrift>

const driftKind = ref<DriftKind>('missing')
const selectedField = ref<string>('')

const setDriftKind = (kind: DriftKind) => {
  driftKind.value = kind
}

watch(driftKind, () => {
  selectedField.value = ''
})

const driftById = computed<DriftById>(() => {
  const map = new Map<string, ModelDrift>()
  for (const company of companyList.value) {
    if (!company?.id) continue
    const drift = resolveDriftFromModel(
      CompanyModelRuntime as unknown as Record<string, unknown>,
      company as unknown as Record<string, unknown>
    )
    map.set(company.id, drift)
  }
  return map
})

const fieldOptions = computed(() => {
  const counts = new Map<string, number>()
  for (const drift of driftById.value.values()) {
    const list = driftKind.value === 'missing' ? drift.missing : drift.extra
    for (const field of list) counts.set(field, (counts.get(field) ?? 0) + 1)
  }

  return [...counts.entries()]
    .map(([key, count]) => ({ key, count, label: `${humanizeDriftPath(key)} (${count})` }))
    .sort((a, b) => a.label.localeCompare(b.label))
})

const filterOptions = computed(() => [
  { label: 'All', value: '' },
  ...fieldOptions.value.map((o) => ({ label: o.label, value: o.key })),
])

const filteredCards = computed(() => {
  if (!selectedField.value) return companyCards.value

  return companyCards.value.filter((card) => {
    const drift = driftById.value.get(card.id)
    if (!drift) return false
    const list = driftKind.value === 'missing' ? drift.missing : drift.extra
    return list.includes(selectedField.value)
  })
})

const taglineById = computed(() => {
  const map = new Map<string, string>()
  for (const card of companyCards.value) {
    const drift = driftById.value.get(card.id)
    if (!drift) continue
    const list = driftKind.value === 'missing' ? drift.missing : drift.extra

    const selected = selectedField.value
    if (selected && list.includes(selected)) {
      map.set(card.id, `${driftKind.value === 'missing' ? 'Missing' : 'Extra'}: ${humanizeDriftPath(selected)}`)
      continue
    }

    const first = list[0]
    if (first) {
      map.set(card.id, `${driftKind.value === 'missing' ? 'Missing' : 'Extra'}: ${humanizeDriftPath(first)}`)
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

const copyAll = async () => {
  await copyJSON(
    {
      totalCompanies: companyList.value.length,
      companies: companyList.value,
      driftById: Object.fromEntries(driftById.value),
    },
    { label: 'Dev · Companies (Ext)' }
  )
}
</script>
