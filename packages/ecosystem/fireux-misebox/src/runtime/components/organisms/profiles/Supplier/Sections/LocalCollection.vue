<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between gap-2">
        <h2>App suppliers</h2>
        <UBadge variant="soft">{{ total }} total</UBadge>
      </div>
      <p class="text-sm opacity-70">
        Suppliers scoped to this tenant application.
      </p>
    </template>

    <div v-if="pills.length" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <OrganismsProfilesSupplierCardsPill
        v-for="pill in pills"
        :key="pillKey(pill)"
        :supplier="pill"
      />
    </div>

    <p v-else class="text-sm opacity-70">No tenant-scoped suppliers found.</p>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type {
  SupplierProfile,
  SupplierCard,
} from '../../../../../models/profiles/Supplier.model.ts'
import { useSupplierCollection } from '../../../../../composables/fireux/firestore/profiles/Supplier/main/useSupplierCollection.ts'
import {
  resolveSupplierPill,
  resolveSupplierPillKey,
} from '../../../../../composables/fireux/firestore/profiles/Supplier/main/useSupplierInterface.ts'

const { localSuppliers } = useSupplierCollection()

const total = computed(() => localSuppliers?.value?.length ?? 0)

const pills = computed<SupplierCard.Pill[]>(() =>
  (localSuppliers?.value ?? []).map((supplier: SupplierProfile) =>
    resolveSupplierPill(supplier)
  )
)

const pillKey = resolveSupplierPillKey
</script>
