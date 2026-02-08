<template>
  <UCard>
    <template #header>
      <div class="collection-manager__header">
        <div class="collection-manager__title">
          <h2>Agents</h2>
          <p>Browse {{ appName }} agents.</p>
        </div>

        <div class="collection-manager__controls">
          <UInput v-model="query" size="xs" placeholder="Search agents…" />

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

    <OrganismsProfilesAgentCollectionList
      v-if="cardsFiltered.length"
      :cards="cardsFiltered"
      :variant="variant"
    >
      <template #pill="{ card }">
        <NuxtLink :to="card.to">
          <OrganismsProfilesAgentCardsPill v-bind="card" />
        </NuxtLink>
      </template>
      <template #cell="{ card }">
        <NuxtLink :to="card.to">
          <OrganismsProfilesAgentCardsCell v-bind="card" />
        </NuxtLink>
      </template>
    </OrganismsProfilesAgentCollectionList>

    <p v-else>No agents found.</p>

    <div v-if="isDev">
      <DevJson
        :title="'Agents (JSON)'"
        context="collection manager · agents"
        :data="collection"
        :default-open="false"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { useCollectionSearch } from 'fireux-core/runtime/composables/shared/useCollectionSearch';
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig';
import { computed } from 'vue';
import { useAgentInterface } from '../../../../../composables/fireux/firestore/profiles/Agent/utils/view/useAgentInterface';
import type { AgentCore } from '../../../../../models/profiles/Agent/Agent.model';

type AgentEntry = AgentCore & { user?: unknown }

const props = defineProps<{ collection?: AgentEntry[] }>()
const { appName } = useFireUXConfig()

const collection = computed(() => props.collection ?? [])
const { card: makeCard } = useAgentInterface()
const { query, variant, toggleVariant, cards: cardsFiltered, visibleCount } =
  useCollectionSearch<AgentEntry, ReturnType<typeof makeCard>>({
    items: collection,
    searchText: (entry) => {
      const card = makeCard(entry as any)
      return card?.displayName.trim().toLowerCase() ?? ''
    },
    makeCard: (entry) => makeCard(entry as any),
  })

const totalCount = computed(() => collection.value.length)
const isDev = import.meta.dev
</script>
