<template>
  <UCard class="section">
    <template #header>
      <div class="section__header">
        <div class="section__copy">
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

    <p v-else class="section__empty">No agents found.</p>

    <div v-if="isDev" class="pt-3">
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
