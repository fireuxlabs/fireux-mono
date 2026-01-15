<template>
  <UCard class="fx-section">
    <template #header>
      <div class="fx-section__header">
        <div class="fx-section__copy">
          <h2 class="text-base font-semibold">Agents</h2>
          <p class="text-xs text-gray-500">Browse agents available to this runtime.</p>
        </div>

        <div class="flex items-center gap-2">
          <UInput v-model="query" size="xs" placeholder="Search agents…" class="w-44" />

          <UButton size="xs" variant="ghost" @click="toggleVariant">
            {{ variant === 'pill' ? 'Cells' : 'Pills' }}
          </UButton>

          <UBadge variant="soft">{{ visibleCount }} / {{ totalCount }}</UBadge>
        </div>
      </div>
    </template>

    <OrganismsProfilesAgentCollectionList
      v-if="cardsFiltered.length"
      :cards="cardsFiltered"
      :variant="variant"
    />

    <p v-else class="fx-section__empty">No agents found.</p>
  </UCard>
</template>

<script setup lang="ts">
import { useCollectionSearch } from 'fireux-core/runtime/composables/shared/useCollectionSearch';
import { computed } from 'vue';
import type { AgentCard } from '../../../../../composables/fireux/firestore/profiles/Agent/useAgent';

const props = defineProps<{ cards: AgentCard.Card[]; total?: number }>()

const { query, variant, toggleVariant, cards: cardsFiltered, visibleCount } =
  useCollectionSearch<AgentCard.Card, AgentCard.Card>({
    items: computed(() => props.cards ?? []),
    searchText: (card) =>
      `${card.displayName} ${card.tagline} ${card.id}`.trim().toLowerCase(),
    makeCard: (card) => card,
  })

const totalCount = computed(() => props.total ?? props.cards.length)
</script>
