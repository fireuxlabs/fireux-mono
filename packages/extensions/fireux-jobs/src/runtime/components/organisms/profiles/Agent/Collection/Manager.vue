<template>
  <UCard>
    <template #header>
      <div class="collection-manager__header">
        <div class="collection-manager__title">
          <h2>Agents</h2>
          <p>Browse agents available to this runtime.</p>
        </div>

        <div class="collection-manager__controls">
          <UInput v-model="query" size="xs" placeholder="Search agents…" />

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
    >
      <template #pill="{ card }">
        <component :is="card.to ? 'NuxtLink' : 'div'" :to="card.to || undefined">
          <OrganismsProfilesAgentCardsPill v-bind="card" />
        </component>
      </template>
      <template #cell="{ card }">
        <component :is="card.to ? 'NuxtLink' : 'div'" :to="card.to || undefined">
          <OrganismsProfilesAgentCardsCell v-bind="card" />
        </component>
      </template>
    </OrganismsProfilesAgentCollectionList>

    <p v-else>No agents found.</p>

    <div v-if="isDev">
      <DevJson
        :title="'Agents (JSON)'"
        :data="collection"
        :default-open="false"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { useCollectionSearch } from 'fireux-core/runtime/composables/shared/useCollectionSearch';
import { computed } from 'vue';
import { useAgentsInterface, type AgentDirectoryEntry } from '../../../../../composables/fireux/firestore/profiles/Agent/utils/view/useAgentsInterface';

const props = defineProps<{ collection?: AgentDirectoryEntry[] }>()

const collection = computed(() => props.collection ?? [])
const { card: makeCard, searchText } = useAgentsInterface()
const { query, variant, toggleVariant, cards: cardsFiltered, visibleCount } =
  useCollectionSearch<AgentDirectoryEntry, ReturnType<typeof makeCard>>({
    items: collection,
    searchText: (entry) => searchText(entry),
    makeCard: (entry) => makeCard(entry),
  })

const totalCount = computed(() => collection.value.length)
const isDev = import.meta.dev
</script>
