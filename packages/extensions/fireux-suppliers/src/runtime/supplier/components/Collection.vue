<template>
  <section class="entity-collection supplier-collection">
    <CollectionHeader title="Suppliers" description="Find suppliers and explore their identities, catalogues and delivery areas.">
      <template #controls>
        <UInput v-if="suppliers.length > 15" v-model="query" placeholder="Search suppliers…" aria-label="Search suppliers" icon="i-lucide-search" class="entity-collection__search" />
        <span class="entity-collection__count">{{ visibleCount }} suppliers</span>
      </template>
    </CollectionHeader>
    <SupplierCollectionList :cards="cards" />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCollectionSearch } from 'fireux-core/runtime/composables/shared/useCollectionSearch'
import type { SupplierSurface } from '../composables/firestore/utils/view/useSupplierInterface'
import { useSupplierInterface, type SupplierCard } from '../composables/firestore/utils/view/useSupplierInterface'
const props = defineProps<{
  suppliers: SupplierSurface[]
}>()
const suppliers = computed(() => props.suppliers)
const { cell } = useSupplierInterface()
const { query, visibleItems, visibleCount } = useCollectionSearch({ items: suppliers, makeCard: cell, initialVariant: 'cell' })
const cards = computed<SupplierCard.Card[]>(() =>
  visibleItems.value.flatMap((supplier) => {
    const card = cell(supplier)
    return card ? [card] : []
  })
)
</script>
