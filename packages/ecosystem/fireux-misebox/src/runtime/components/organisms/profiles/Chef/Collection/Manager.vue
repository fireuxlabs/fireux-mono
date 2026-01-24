<template>
  <UCard class="section">
    <template #header>
      <div class="section__header">
        <div class="section__copy">
          <h2 class="text-base font-semibold">Chefs</h2>
          <p class="text-xs text-gray-500">Browse chefs available to this runtime.</p>
        </div>

        <div class="flex items-center gap-2">
          <UInput v-model="query" size="xs" placeholder="Search chefs…" class="w-44" />

          <UButton size="xs" variant="ghost" @click="toggleVariant">
            {{ variant === 'pill' ? 'Cells' : 'Pills' }}
          </UButton>

          <UBadge variant="soft">{{ visibleCount }} / {{ totalCount }}</UBadge>
        </div>
      </div>
    </template>

    <OrganismsProfilesChefCollectionList
      v-if="cardsFiltered.length"
      :cards="cardsFiltered"
      :variant="variant"
    />

    <p v-else class="section__empty">No chefs found.</p>

    <div v-if="showDebug" class="pt-3">
      <DevJson
        :title="'Chefs (JSON)'"
        :data="debugPayload"
        :default-open="false"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { useCollectionSearch } from 'fireux-core/runtime/composables/shared/useCollectionSearch';
import { computed } from 'vue';
import { useChef } from '../../../../../composables/fireux/firestore/profiles/Chef/useChef';
import type { ChefCore } from '../../../../../models/profiles/Chef/Chef.model';

type ChefEntry = ChefCore & { user?: unknown }

const props = defineProps<{ collection?: ChefEntry[] }>()

const collection = computed(() => props.collection ?? [])
const { card: makeCard } = useChef()
const searchTextFor = (entry: ChefEntry) => {
  const displayName = (entry as any)?.user?.display_name ?? ''
  const title = (entry as any)?.title ?? ''
  const tagline = (entry as any)?.tagline ?? ''
  const organization = (entry as any)?.organization_name ?? ''
  return `${displayName} ${title} ${tagline} ${organization} ${entry.id ?? ''}`
    .trim()
    .toLowerCase()
}
const { query, variant, toggleVariant, cards: cardsFiltered, visibleCount } =
  useCollectionSearch<ChefEntry, ReturnType<typeof makeCard>>({
    items: collection,
    searchText: (entry) => searchTextFor(entry),
    makeCard: (entry) => makeCard(entry as ChefCore, (entry as any)?.user ?? null),
  })

const totalCount = computed(() => collection.value.length)
const showDebug = import.meta.dev
const debugPayload = computed(() => ({
  totalChefs: collection.value.length,
  chefs: collection.value,
}))
</script>
