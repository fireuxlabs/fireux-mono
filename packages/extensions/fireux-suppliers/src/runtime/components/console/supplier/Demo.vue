<template>
  <section class="space-y-4">
    <ConsoleRootSelectionStatus
      :has-selection="Boolean(activeSupplierPill)"
      :has-options="demoSupplierPills.length > 0"
      select-title="Select a demo supplier"
      empty-title="No demo suppliers"
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

    <div v-if="demoSupplierPills.length" class="space-y-2">
      <SupplierCardsPill
        v-for="item in demoSupplierPills"
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
import { useRuntimeSupplierSelection } from '../../../composables/fireux/app/supplier-console/state'
import { useSupplierInterface } from '../../../composables/fireux/firestore/supplier/utils/view/useSupplierInterface'
import { useRuntimeSupplierConsole } from '../../../composables/fireux/app/supplier-console/useRuntimeSupplierConsole'

const normalizeString = (value: unknown): string => String(value || '').trim()

const { runtime, scenarios } = useRuntimeSupplierConsole()
const supplierSelection = useRuntimeSupplierSelection()
const { interface: toSupplierCard } = useSupplierInterface()

type SupplierPill = NonNullable<ReturnType<typeof toSupplierCard>>

const buildSupplierPill = (
  target?: Supplier | null,
  imageUrl?: unknown
): SupplierPill | null => {
  const pill = toSupplierCard(target as Supplier | null)
  if (!pill) return null
  return {
    ...pill,
    avatarUrl: normalizeString(imageUrl) || pill.avatarUrl,
  }
}

const demoSupplierPills = computed(() =>
  scenarios.value
    .map((entry) =>
      buildSupplierPill(entry.supplier as Supplier, entry.image_url)
    )
    .filter((entry): entry is SupplierPill => Boolean(entry))
)

const activeSupplierPill = computed(
  () =>
    demoSupplierPills.value.find((item) => item.id === runtime.id.value) ??
    buildSupplierPill(
      runtime.supplier.value as Supplier | null,
      runtime.scenario.value?.image_url
    )
)

const selectSupplier = (supplierId: string) => {
  const resolvedId = normalizeString(supplierId)
  if (!resolvedId) return
  supplierSelection.setRuntimeSupplier({
    supplierId: resolvedId,
    mode: 'demo',
  })
}
</script>
