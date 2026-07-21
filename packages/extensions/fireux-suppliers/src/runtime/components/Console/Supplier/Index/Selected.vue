<!-- Concurrent edit — 2026-07-19 16:49 CEST — Repo Efficiency Pass 5 of 6: remove raw console debug label. -->
<!-- Concurrent edit — 2026-07-21 21:23 CEST — Console index parity: delegate selected-target chrome to Core. -->
<template>
  <ConsoleSelectedTarget
    label="Supplier"
    :selected-id="supplierId"
    :description="supplierName"
    @clear="emit('clear')"
  />
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
</script>
