<template>
  <UCard class="section">
    <template #header>
      <div class="section__header">
        <div class="section__copy">
          <h2 class="text-base font-semibold">Professionals</h2>
          <p class="text-xs text-gray-500">Browse professionals available to this runtime.</p>
        </div>

        <div class="flex items-center gap-2">
          <UInput v-model="query" size="xs" placeholder="Search professionals…" class="w-44" />

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

    <p v-else class="section__empty">No professionals found.</p>

    <div v-if="showDebug" class="pt-3">
      <DevJson
        :title="'Professionals (JSON)'"
        :data="debugPayload"
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
const showDebug = import.meta.dev
const debugPayload = computed(() => ({
  totalProfessionals: collection.value.length,
  professionals: collection.value,
}))
</script>
