<template>
  <UCard>
    <template #header>
      <div>
        <div>
          <h2>Professionals</h2>
          <p>Browse professionals available to this runtime.</p>
        </div>

        <div>
          <UInput v-model="query" size="xs" placeholder="Search professionals…" />

          <UButton size="xs" variant="ghost" @click="toggleVariant">
            {{ variant === 'pill' ? 'Cells' : 'Pills' }}
          </UButton>

          <UBadge variant="soft">{{ visibleCount }} / {{ totalCount }}</UBadge>
        </div>
      </div>
    </template>

    <OrganismsProfilesProfessionalCollectionList
      v-if="cardsFiltered.length"
      :cards="cardsFiltered"
      :variant="variant"
    />

    <p v-else>No professionals found.</p>

    <div v-if="isDev">
      <DevJson
        :title="'Professionals (JSON)'"
        :data="collection"
        :default-open="false"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { useCollectionSearch } from 'fireux-core/runtime/composables/shared/useCollectionSearch';
import { computed } from 'vue';
import { useProfessional } from '../../../../../composables/fireux/firestore/profiles/Professional/useProfessional';
import type { ProfessionalCore } from '../../../../../models/profiles/Professional/Professional.model';

type ProfessionalEntry = ProfessionalCore & { user?: unknown }

const props = defineProps<{ collection?: ProfessionalEntry[] }>()

const collection = computed(() => props.collection ?? [])
const { card: makeCard } = useProfessional()
const searchTextFor = (entry: ProfessionalEntry) => {
  const displayName = (entry as any)?.user?.display_name ?? ''
  const title = (entry as any)?.title ?? ''
  const tagline = (entry as any)?.tagline ?? ''
  return `${displayName} ${title} ${tagline} ${entry.id ?? ''}`
    .trim()
    .toLowerCase()
}
const { query, variant, toggleVariant, cards: cardsFiltered, visibleCount } =
  useCollectionSearch<ProfessionalEntry, ReturnType<typeof makeCard>>({
    items: collection,
    searchText: (entry) => searchTextFor(entry),
    makeCard: (entry) => makeCard(entry as ProfessionalCore, (entry as any)?.user ?? null),
  })

const totalCount = computed(() => collection.value.length)
const isDev = import.meta.dev
</script>
