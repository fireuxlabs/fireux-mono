<template>
  <UCard :ui="{ body: 'space-y-4' }">
    <template #header>
      <div class="flex items-center justify-between">
        <div>
          <div class="font-medium">Products</div>
          <p class="text-xs text-dimmed">Browse products available to this runtime.</p>
        </div>

        <div class="flex items-center gap-2">
          <UInput
            v-model="query"
            size="xs"
            placeholder="Search products…"
            class="w-44"
          />

          <UButton size="xs" variant="ghost" @click="toggleVariant">
            {{ variant === 'pill' ? 'Cells' : 'Pills' }}
          </UButton>
          <UBadge variant="soft">{{ visibleCount }} / {{ totalCount }}</UBadge>
        </div>
      </div>
    </template>

    <OrganismsEntitiesProductCollectionList
      v-if="cardsFiltered.length"
      :cards="cardsFiltered"
      :variant="variant"
    />

    <p v-else class="text-sm text-dimmed">
      {{ query ? 'No products match your search.' : 'No products found.' }}
    </p>

    <div v-if="isDev" class="pt-3">
      <DevJson
        :title="'Products (JSON)'"
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

