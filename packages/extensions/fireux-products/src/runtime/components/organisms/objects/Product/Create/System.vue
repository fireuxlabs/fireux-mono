<template>
  <OrganismsCreateShell
    :loading="isCreating"
    submit-label="Create"
    @submit="handleCreate"
    @clear="handleClear"
  >
    <template #write>
      <OrganismsObjectsProductCreateWrite />
    </template>
    <template #preview>
      <OrganismsObjectsProductCreatePreview />
    </template>
  </OrganismsCreateShell>
</template>
<script setup lang="ts">
import { ref } from 'vue'
// Use Nuxt UI toast if available (auto-imported in app)
const useToastFn = (globalThis as any).useToast as undefined | (() => any)
const toast = useToastFn ? useToastFn() : undefined
import { useCreatePricesState } from '../../../../../composables/fireux/firestore/objects/product/Prices/useCreatePricesState'
import { useCreateProductState } from '../../../../../composables/fireux/firestore/objects/product/state/useCreateProductState'
import { useProductCreate } from '../../../../../composables/fireux/firestore/objects/product/useProductCreate'

const { product, resetCreateProductState } = await useCreateProductState()

const { resetCreatePricesState } = useCreatePricesState()

const { createProduct } = await useProductCreate()

const isCreating = ref(false)

async function handleCreate() {
  // Validate required fields
  if (!product.value?.name?.trim()) {
    if (toast)
      toast.add({
        title: 'Missing name',
        description: 'Product name is required',
        icon: 'i-heroicons-exclamation-circle',
        color: 'amber',
      })
    return
  }

  isCreating.value = true

  const response = await createProduct()

  if (!response.success) {
    if (toast)
      toast.add({
        title: 'Create failed',
        description: String(response.error || 'Unknown error'),
        icon: 'i-heroicons-x-circle',
        color: 'red',
      })
    isCreating.value = false
    return
  }

  // Success! Clear the form and show success message
  if (toast)
    toast.add({
      title: 'Created',
      description: 'Product created successfully',
      icon: 'i-heroicons-check-circle',
      color: 'green',
    })
  resetCreateProductState()
  resetCreatePricesState()
  isCreating.value = false
}

function handleClear() {
  if (confirm('Are you sure you want to clear the form?')) {
    resetCreateProductState()
    resetCreatePricesState()
  }
}
</script>
