<template>
  <UCard>
    <template #header>
      <div class="collection-manager__header">
        <div class="collection-manager__title">
          <div>Companies</div>
          <p>Browse {{ appName }} companies.</p>
        </div>

        <div class="collection-manager__controls">
          <UInput
            v-model="query"
            size="xs"
            placeholder="Search companies…"
          />

          <UButton
            size="xs"
            variant="ghost"
            :icon="variant === 'pill' ? 'i-lucide-list' : 'i-lucide-layout-grid'"
            :aria-label="variant === 'pill' ? 'Switch to list view' : 'Switch to grid view'"
            @click="toggleVariant"
          />
          <UBadge variant="soft">{{ visibleCount }} / {{ totalCount }}</UBadge>
        </div>
      </div>
    </template>

    <CompanyCollectionList
      v-if="cardsFiltered.length"
      :cards="cardsFiltered"
      :variant="variant"
    >
      <template #pill="{ card }">
        <NuxtLink :to="card.to">
          <CompanyCardsPill v-bind="card" />
        </NuxtLink>
      </template>
      <template #cell="{ card }">
        <NuxtLink :to="card.to">
          <CompanyCardsCell v-bind="card" />
        </NuxtLink>
      </template>
    </CompanyCollectionList>

    <p v-else>
      {{ query ? 'No companies match your search.' : 'No companies found.' }}
    </p>

    <div v-if="isDev">
      <DevJson
        :title="'Companies (JSON)'"
        context="collection manager · companies"
        :data="collection"
        :default-open="false"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useCollectionSearch } from 'fireux-core/runtime/composables/shared/useCollectionSearch'
import { computed } from 'vue'
import { useCompanyInterface } from '../../../../composables/fireux/firestore/company/utils/view/useCompanyInterface'
import type { CompanyView } from '../../../../models/company.model'

const props = defineProps<{ collection?: CompanyView[] }>()
const { appName } = useFireUXConfig()

const collection = computed(() => props.collection ?? [])
const { card: makeCard, searchText } = useCompanyInterface()

const {
  query,
  variant,
  toggleVariant,
  cards: cardsFiltered,
  visibleCount,
} = useCollectionSearch<CompanyView, ReturnType<typeof makeCard>>({
  items: collection,
  searchText: (company: CompanyView) => searchText(company),
  makeCard: (company: CompanyView) => makeCard(company),
})
const totalCount = computed(() => collection.value.length)
const isDev = import.meta.dev
</script>
