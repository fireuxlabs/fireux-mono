<template>
  <UCard :ui="{ body: 'space-y-4' }">
    <template #header>
      <div class="flex items-center justify-between">
        <div>
          <div class="font-medium">Companies</div>
          <p class="text-xs text-dimmed">Browse companies available to this runtime.</p>
        </div>

        <div class="flex items-center gap-2">
          <UInput
            v-model="query"
            size="xs"
            placeholder="Search companies…"
            class="w-44"
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
    />

    <p v-else class="text-sm text-dimmed">
      {{ query ? 'No companies match your search.' : 'No companies found.' }}
    </p>

    <div v-if="isDev" class="pt-3">
      <DevJson
        :title="'Companies (JSON)'"
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
