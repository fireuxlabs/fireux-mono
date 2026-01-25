<template>
  <UCard>
    <template #header>
      <div class="collection-manager__header">
        <div class="collection-manager__title">
          <h2>Suppliers</h2>
          <p>Browse suppliers available to this runtime.</p>
        </div>

        <div class="collection-manager__controls">
          <UInput v-model="query" size="xs" placeholder="Search suppliers…" />

          <UButton size="xs" variant="ghost" @click="toggleVariant">
            {{ variant === 'pill' ? 'Cells' : 'Pills' }}
          </UButton>

          <UBadge variant="soft">{{ visibleCount }} / {{ totalCount }}</UBadge>
        </div>
      </div>
    </template>

    <OrganismsProfilesSupplierCollectionList
      v-if="cardsFiltered.length"
      :cards="cardsFiltered"
      :variant="variant"
    >
      <template #pill="{ card }">
        <NuxtLink :to="card.to">
          <OrganismsProfilesSupplierCardsPill v-bind="card" />
        </NuxtLink>
      </template>
      <template #cell="{ card }">
        <NuxtLink :to="card.to">
          <OrganismsProfilesSupplierCardsCell v-bind="card" />
        </NuxtLink>
      </template>
    </OrganismsProfilesSupplierCollectionList>

    <p v-else>No suppliers found.</p>

    <div v-if="isDev">
      <DevJson
        :title="'Suppliers (JSON)'"
        :data="collection"
        :default-open="false"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { useCollectionSearch } from 'fireux-core/runtime/composables/shared/useCollectionSearch';
import { computed } from 'vue';
import { useSupplier } from '../../../../../composables/fireux/firestore/profiles/Supplier/useSupplier';
import type { SupplierCore } from '../../../../../models/profiles/Supplier/Supplier.model';

type SupplierEntry = SupplierCore & { user?: unknown }

const props = defineProps<{ collection?: SupplierEntry[] }>()

const collection = computed(() => props.collection ?? [])
const { card: makeCard } = useSupplier()
const searchTextFor = (entry: SupplierEntry) => {
  const displayName = (entry as any)?.user?.display_name ?? ''
  const title = (entry as any)?.title ?? ''
  const tagline = (entry as any)?.tagline ?? ''
  return `${displayName} ${title} ${tagline} ${entry.id ?? ''}`
    .trim()
    .toLowerCase()
}
const { query, variant, toggleVariant, cards: cardsFiltered, visibleCount } =
  useCollectionSearch<SupplierEntry, ReturnType<typeof makeCard>>({
    items: collection,
    searchText: (entry) => searchTextFor(entry),
    makeCard: (entry) => makeCard(entry as SupplierCore, (entry as any)?.user ?? null),
  })

const totalCount = computed(() => collection.value.length)
const isDev = import.meta.dev
</script>
