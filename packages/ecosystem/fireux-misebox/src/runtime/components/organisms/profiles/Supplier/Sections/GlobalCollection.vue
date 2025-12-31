<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between gap-2">
        <h2>Global suppliers</h2>
        <UBadge variant="soft">{{ total }} total</UBadge>
      </div>
      <p class="text-sm opacity-70">
        Suppliers available across the FireUX network.
      </p>
    </template>

    <div v-if="cards.length" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <OrganismsProfilesSupplierCardsPill
        v-for="card in cards"
        :key="cardKey(card)"
        :supplier="card"
      />
    </div>

    <p v-else class="text-sm opacity-70">No global suppliers found.</p>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { SupplierCore } from '../../../../../models/profiles/Supplier/Supplier.model.ts'
import type { SupplierCard } from '../../../../../composables/fireux/firestore/profiles/Supplier/main/useSupplierInterface.ts'
import { useSupplierCollection } from '../../../../../composables/fireux/firestore/profiles/Supplier/main/useSupplierCollection.ts'
import { useSupplier } from '../../../../../composables/fireux/firestore/profiles/Supplier/useSupplier'

const { globalSuppliers } = useSupplierCollection()
const { card } = useSupplier()

const total = computed(() => globalSuppliers.value?.length ?? 0)

const cards = computed<SupplierCard.Card[]>(() =>
  (globalSuppliers.value ?? []).map((supplier: SupplierCore) => card(supplier))
)

const cardKey = (payload: SupplierCard.Card) => payload.id || payload.to || payload.title
</script>
