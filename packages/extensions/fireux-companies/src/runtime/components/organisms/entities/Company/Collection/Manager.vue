<template>
  <UCard>
    <template #header>
      <div class="collection-manager__header">
        <div class="collection-manager__title">
          <div>Companies</div>
          <p>Browse companies available to this runtime.</p>
        </div>

        <div class="collection-manager__controls">
          <UInput
            v-model="query"
            size="xs"
            placeholder="Search companies…"
          />

          <UButton size="xs" variant="ghost" @click="toggleVariant">
            {{ variant === 'pill' ? 'Cells' : 'Pills' }}
          </UButton>
          <UBadge variant="soft">{{ visibleCount }} / {{ totalCount }}</UBadge>
        </div>
      </div>
    </template>

    <OrganismsEntitiesCompanyCollectionList
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
    </OrganismsEntitiesCompanyCollectionList>

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
import { useCollectionSearch } from 'fireux-core/runtime/composables/shared/useCollectionSearch';
import { computed } from 'vue';
import { useCompanyInterface } from '../../../../../composables/fireux/firestore/objects/company/utils/view/useCompanyInterface';
import type { Company } from '../../../../../models/objects/company.model';

const props = defineProps<{ collection?: Company[] }>()

const collection = computed(() => props.collection ?? [])
const { card: makeCard, searchText } = useCompanyInterface()

const {
  query,
  variant,
  toggleVariant,
  cards: cardsFiltered,
  visibleCount,
} = useCollectionSearch<Company, ReturnType<typeof makeCard>>({
  items: collection,
  searchText: (company: Company) => searchText(company),
  makeCard: (company: Company) => makeCard(company),
})
const totalCount = computed(() => collection.value.length)
const isDev = import.meta.dev
</script>
