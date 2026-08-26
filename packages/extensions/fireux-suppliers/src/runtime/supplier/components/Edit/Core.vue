<template>
  <ClientOnly>
    <div v-if="supplier" class="space-y-6">
      <UCard>
        <div class="space-y-4">
          <MoleculesFormsEditableArrayOfStrings
            label="Delivery Areas"
            :value="deliveryAreas"
            item-placeholder="Delivery area"
            new-item-placeholder="Add delivery area"
            :update="handleDeliveryAreas"
          />
        </div>
      </UCard>
    </div>

    <MoleculesStateCard
      v-else
      entity="supplier record"
      kind="document"
      loading
    />
  </ClientOnly>
</template>

<script setup lang="ts">
// Concurrent edit — 2026-07-20 22:24 CEST — Both-Entity Authority — Supplier: target canonical writes by the supplied entity id.
import { useToastify } from 'fireux-core/runtime/composables/ui/useToastify'
import { computed } from 'vue'
import { useSupplierUpdate } from '../../composables/firestore/mutations/useSupplierUpdate'
import type { Supplier } from '../../models/Supplier.model.ts'

const props = defineProps<{ supplier: Supplier | null }>()

const supplier = computed(() => props.supplier ?? null)
const { updateDeliveryAreas } = useSupplierUpdate()

const toast = useToastify()

const deliveryAreas = computed(() =>
  Array.isArray(supplier.value?.delivery_areas)
    ? supplier.value?.delivery_areas
    : []
)
const mutationOptions = () => ({ id: String(supplier.value?.id ?? '').trim() })

const wrap = async (
  fn: () => Promise<void>,
  okTitle: string,
  failTitle: string
) => {
  try {
    await fn()
    toast.add({ title: okTitle, icon: 'i-heroicons-check-circle' })
    return 'success'
  } catch (error) {
    const description =
      error instanceof Error ? error.message : 'Please try again.'
    toast.add({
      title: failTitle,
      description,
      color: 'warning',
      icon: 'i-heroicons-exclamation-triangle',
    })
    throw error
  }
}

const handleDeliveryAreas = async (value: string[]) =>
  wrap(
    () => updateDeliveryAreas(value, mutationOptions()),
    'Delivery areas updated',
    'Failed to update delivery areas'
  )
</script>
