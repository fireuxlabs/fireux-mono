<template>
  <section class="space-y-4">
    <ConsoleRootSelectionStatus
      :has-selection="Boolean(activeSupplierPill)"
      :has-options="liveSupplierPills.length > 0"
      select-title="Select a real supplier"
      empty-title="No real suppliers"
    >
      <template #selected>
        <UAlert
          color="primary"
          variant="soft"
          :title="activeSupplierPill?.title || ''"
          :description="activeSupplierPill?.subtitle || ''"
        />
      </template>
    </ConsoleRootSelectionStatus>

    <div v-if="liveSupplierPills.length" class="space-y-2">
      <SupplierCardsPill
        v-for="item in liveSupplierPills"
        :key="item.id"
        v-bind="item"
        :link="false"
        :action="true"
        :show-badges="false"
        class="cursor-pointer"
        @action="selectSupplier(item.id)"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Supplier } from '../../../models/supplier/Supplier.model'
import { useSupplierCollection } from '../../../composables/fireux/firestore/supplier/fetch/useSupplierCollection'
import { useRuntimeSupplierSelection } from '../../../composables/fireux/app/supplier-console/state'
import { useSupplierInterface } from '../../../composables/fireux/firestore/supplier/utils/view/useSupplierInterface'
import { useRuntimeSupplierConsole } from '../../../composables/fireux/app/supplier-console/useRuntimeSupplierConsole'

const { runtime } = useRuntimeSupplierConsole()
const supplierSelection = useRuntimeSupplierSelection()
const { interface: toSupplierCard } = useSupplierInterface()
const { coreSuppliers: liveSuppliers } = useSupplierCollection()

type SupplierPill = NonNullable<ReturnType<typeof toSupplierCard>>

const buildSupplierPill = (target?: Supplier | null): SupplierPill | null => {
  const pill = toSupplierCard(target as Supplier | null)
  return pill ? { ...pill } : null
}

const liveSupplierPills = computed(() =>
  liveSuppliers.value
    .map((entry) => buildSupplierPill(entry as Supplier))
    .filter((entry): entry is SupplierPill => Boolean(entry))
)

const activeSupplierPill = computed(
  () =>
    liveSupplierPills.value.find((item) => item.id === runtime.id.value) ??
    buildSupplierPill(runtime.supplier.value as Supplier | null)
)

const selectSupplier = (supplierId: string) => {
  const resolvedId = String(supplierId || '').trim()
  if (!resolvedId) return
  supplierSelection.setRuntimeSupplier({
    supplierId: resolvedId,
    mode: 'live',
  })
}
</script>
