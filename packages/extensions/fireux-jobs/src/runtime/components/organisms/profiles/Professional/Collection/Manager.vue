<template>
  <UCard>
    <template #header>
      <div class="collection-manager__header">
        <div class="collection-manager__title">
          <h2>Professionals</h2>
        </div>

        <div class="collection-manager__controls">
          <UInput v-model="query" size="xs" placeholder="Search professionals…" />

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

    <OrganismsProfilesProfessionalCollectionList
      v-if="cardsFiltered.length"
      :cards="cardsFiltered"
      :variant="variant"
    >
      <template #pill="{ card }">
        <NuxtLink :to="card.to">
          <OrganismsProfilesProfessionalCardsPill v-bind="card" />
        </NuxtLink>
      </template>
      <template #cell="{ card }">
        <NuxtLink :to="card.to">
          <OrganismsProfilesProfessionalCardsCell v-bind="card" />
        </NuxtLink>
      </template>
    </OrganismsProfilesProfessionalCollectionList>

    <p v-else>No professionals found.</p>

    <div v-if="isDev">
      <DevJson
        :title="'Professionals (JSON)'"
        context="collection manager · professionals · hydrated"
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
const { query, variant, toggleVariant, cards: cardsFiltered, visibleCount } =
  useCollectionSearch<ProfessionalEntry, ReturnType<typeof makeCard>>({
    items: collection,
    searchText: (entry) => {
      const card = makeCard(entry as ProfessionalCore, (entry as any)?.user ?? null)
      return card?.displayName.trim().toLowerCase() ?? ''
    },
    makeCard: (entry) => makeCard(entry as ProfessionalCore, (entry as any)?.user ?? null),
  })

const totalCount = computed(() => collection.value.length)
const isDev = import.meta.dev
</script>
