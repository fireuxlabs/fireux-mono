<template>
  <UPageCard
    v-if="supplierId"
    title="Selected Supplier"
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

const supplierName = computed(() =>
  String(props.supplier?.name || props.supplier?.slug || '').trim()
)
</script>
