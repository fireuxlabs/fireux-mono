<template>
  <UCard>
    <template #header>
      <div class="collection-manager__header">
        <div class="collection-manager__title">
          <h2>Chefs</h2>
          <p>Browse chefs available to this runtime.</p>
        </div>

        <div class="collection-manager__controls">
          <UInput v-model="query" size="xs" placeholder="Search chefs…" />

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
    >
      <template #pill="{ card }">
        <NuxtLink :to="card.to">
          <OrganismsProfilesChefCardsPill v-bind="card" />
        </NuxtLink>
      </template>
      <template #cell="{ card }">
        <NuxtLink :to="card.to">
          <OrganismsProfilesChefCardsCell v-bind="card" />
        </NuxtLink>
      </template>
    </OrganismsProfilesChefCollectionList>

    <p v-else>No chefs found.</p>

    <div v-if="isDev">
      <DevJson
        :title="'Chefs (JSON)'"
        context="collection manager · chefs"
        :data="collection"
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
const isDev = import.meta.dev
</script>
