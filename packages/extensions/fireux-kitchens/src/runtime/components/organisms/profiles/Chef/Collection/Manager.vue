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

    <ProfilesChefCollectionList
      v-if="cardsFiltered.length"
      :cards="cardsFiltered"
      :variant="variant"
    >
      <template #pill="{ card }">
        <NuxtLink :to="card.to">
          <ProfilesChefCardsPill v-bind="card" />
        </NuxtLink>
      </template>
      <template #cell="{ card }">
        <NuxtLink :to="card.to">
          <ProfilesChefCardsCell v-bind="card" />
        </NuxtLink>
      </template>
    </ProfilesChefCollectionList>

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
const { query, variant, toggleVariant, cards: cardsFiltered, visibleCount } =
  useCollectionSearch<ChefEntry, ReturnType<typeof makeCard>>({
    items: collection,
    searchText: (entry) => {
      const card = makeCard(entry as ChefCore, (entry as any)?.user ?? null)
      return card?.displayName.trim().toLowerCase() ?? ''
    },
    makeCard: (entry) => makeCard(entry as ChefCore, (entry as any)?.user ?? null),
  })

const totalCount = computed(() => collection.value.length)
const isDev = import.meta.dev
</script>
