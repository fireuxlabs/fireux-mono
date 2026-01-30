<template>
  <UCard>
    <template #header>
      <div class="collection-manager__header">
        <div class="collection-manager__title">
          <div>Products</div>
          <p>Browse products available to this runtime.</p>
        </div>

        <div class="collection-manager__controls">
          <UInput
            v-model="query"
            size="xs"
            placeholder="Search products…"
          />

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

    <OrganismsEntitiesProductCollectionList
      v-if="cardsFiltered.length"
      :cards="cardsFiltered"
      :variant="variant"
    >
      <template #pill="{ card }">
        <NuxtLink :to="card.to">
          <ProductCardsPill v-bind="card" />
        </NuxtLink>
      </template>
      <template #cell="{ card }">
        <NuxtLink :to="card.to">
          <ProductCardsCell v-bind="card" />
        </NuxtLink>
      </template>
    </OrganismsEntitiesProductCollectionList>

    <p v-else>
      {{ query ? 'No products match your search.' : 'No products found.' }}
    </p>

    <div v-if="isDev">
      <DevJson
        :title="'Products (JSON)'"
        context="collection manager · products"
        :data="collection"
        :default-open="false"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { useCollectionSearch } from 'fireux-core/runtime/composables/shared/useCollectionSearch';
import { computed } from 'vue';
import { useProductInterface } from '../../../../../composables/fireux/firestore/objects/product/utils/view/useProductInterface';
import type { FirebaseProduct } from '../../../../../models/objects/product.model';

const props = defineProps<{ collection?: FirebaseProduct[] }>()

const collection = computed(() => props.collection ?? [])
const { card: makeCard, searchText } = useProductInterface()

const {
  query,
  variant,
  toggleVariant,
  cards: cardsFiltered,
  visibleCount,
} = useCollectionSearch<FirebaseProduct, ReturnType<typeof makeCard>>({
  items: collection,
  searchText: (product: FirebaseProduct) => searchText(product),
  makeCard: (product: FirebaseProduct) => makeCard(product),
})

const totalCount = computed(() => collection.value.length)
const isDev = import.meta.dev

</script>

