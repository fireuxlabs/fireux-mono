<template>
  <section class="space-y-6">
    <UAlert
      v-if="!supplierCards.length"
      color="neutral"
      variant="soft"
      title="No live suppliers found"
      description="No live suppliers are currently available in this workspace."
    />

    <div v-else class="space-y-6">
      <div class="space-y-2">
        <div class="text-xs uppercase tracking-[0.16em] text-toned">Selected Supplier</div>

        <SupplierCardsPill
          v-if="activeSupplierPill"
          v-bind="activeSupplierPill"
          :link="false"
        />

        <p v-else class="text-sm text-dimmed">
          Choose a supplier below to load it into the console.
        </p>
      </div>

      <UCard>
        <template #header>
          <div class="space-y-1">
            <div class="text-sm font-semibold">Choose Supplier</div>
            <p class="text-sm text-dimmed">
              Select the live supplier you want to work on.
            </p>
          </div>
        </template>

        <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <UButton
            v-for="entry in supplierCards"
            :key="entry.id"
            color="neutral"
            :variant="entry.id === selectedId ? 'solid' : 'soft'"
            class="justify-start"
            @click="selectSupplier(entry.id)"
          >
            <span class="truncate">{{ entry.title }}</span>
          </UButton>
        </div>
      </UCard>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Supplier } from '../../../models/supplier/Supplier.model'
import { useSupplierCollection } from '../../../composables/fireux/firestore/supplier/fetch/useSupplierCollection'
import { useSupplierSelection } from '../../../composables/fireux/app/supplier-console/useSupplierSelection'
import { useSupplierInterface } from '../../../composables/fireux/firestore/supplier/utils/view/useSupplierInterface'
import { useSupplierConsole } from '../../../composables/fireux/app/supplier-console/useSupplierConsole'

const { activeSupplierPill } = useSupplierConsole()
const { selectedId, setRuntimeSupplier } = useSupplierSelection()
const { interface: toSupplierCard } = useSupplierInterface()
const { coreSuppliers: liveSuppliers } = useSupplierCollection()

type SupplierPill = NonNullable<ReturnType<typeof toSupplierCard>>

const supplierCards = computed(() =>
  liveSuppliers.value
    .map((entry) => toSupplierCard(entry as Supplier))
    .filter((entry): entry is SupplierPill => Boolean(entry))
)

const selectSupplier = (supplierId: string) => {
  setRuntimeSupplier({ supplierId })
}
</script>
