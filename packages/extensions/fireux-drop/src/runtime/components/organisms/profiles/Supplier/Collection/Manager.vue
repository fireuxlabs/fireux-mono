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

    <ProfilesSupplierCollectionList
      v-if="cardsFiltered.length"
      :cards="cardsFiltered"
      :variant="variant"
    >
      <template #pill="{ card }">
        <NuxtLink :to="card.to">
          <ProfilesSupplierCardsPill v-bind="card" />
        </NuxtLink>
      </template>
      <template #cell="{ card }">
        <NuxtLink :to="card.to">
          <ProfilesSupplierCardsCell v-bind="card" />
        </NuxtLink>
      </template>
    </ProfilesSupplierCollectionList>

    <p v-else>No suppliers found.</p>

    <div v-if="isDev">
      <DevJson
        :title="'Suppliers (JSON)'"
        context="collection manager · suppliers"
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
const { query, variant, toggleVariant, cards: cardsFiltered, visibleCount } =
  useCollectionSearch<SupplierEntry, ReturnType<typeof makeCard>>({
    items: collection,
    searchText: (entry) => {
      const card = makeCard(entry as SupplierCore, (entry as any)?.user ?? null)
      return card?.displayName.trim().toLowerCase() ?? ''
    },
    makeCard: (entry) => makeCard(entry as SupplierCore, (entry as any)?.user ?? null),
  })

const totalCount = computed(() => collection.value.length)
const isDev = import.meta.dev
</script>
