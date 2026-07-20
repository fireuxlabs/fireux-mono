<!-- Concurrent edit — 2026-07-19 16:49 CEST — Repo Efficiency Pass 5 of 6: remove raw console debug label. -->
<template>
  <section class="space-y-2">
    <UPageCard
      v-if="supplierId"
      :title="selectedTitle"
      :description="supplierName || supplierId"
      variant="subtle"
    >
      <template #footer>
        <UButton
          color="neutral"
          variant="ghost"
          size="sm"
          icon="i-lucide-x"
          @click="emit('clear')"
        >
          Clear
        </UButton>
      </template>
    </UPageCard>

    <UPageCard
      v-else
      title="No selected Supplier"
      description="Choose a Supplier target to open selected Supplier console state."
      variant="subtle"
    />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { SupplierSurface } from '../../../../composables/fireux/firestore/supplier/utils/view/useSupplierInterface'

const props = defineProps<{
  supplier?: SupplierSurface | null
  supplierId?: string
}>()

const emit = defineEmits<{
  (event: 'clear'): void
}>()

// Supplier console selection displays the interface identity, not a raw `name` field.
const supplierName = computed(() =>
  String(
    props.supplier?.supplier_organization_name ||
      props.supplier?.slug ||
      props.supplier?.id ||
      ''
  ).trim()
)
const selectedTitle = 'Selected Supplier'
</script>
