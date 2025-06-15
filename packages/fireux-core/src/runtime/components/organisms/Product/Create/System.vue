<template>
  <div class="root-container">
    <UTabs v-model="selectedTab" :items="tabItems">
      <template #write>
        <FireOrganismsProductCreateWrite />
      </template>
      <template #preview>
        <FireOrganismsProductCreatePreview />
      </template>
    </UTabs>

    <div class="actions">
      <UButton
        :loading="isCreating"
        :disabled="isCreating"
        @click="handleCreate"
      >
        Create Product
      </UButton>
      <UButton variant="subtle" @click="handleClear"> Clear </UButton>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { useCreateProductState } from '../../../../composables/firestore/objects/Product/useCreateProductState'
import { useCreatePricesState } from '../../../../composables/firestore/objects/Product/Prices/useCreatePricesState'
import { useProductCreate } from '../../../../composables/firestore/objects/Product/useProductCreate'

const selectedTab = ref<'write' | 'preview'>('write')
const tabItems = [
  { label: 'Write', icon: 'i-lucide-pencil', value: 'write', slot: 'write' },
  { label: 'Preview', icon: 'i-lucide-eye', value: 'preview', slot: 'preview' },
]

const { product, resetCreateProductState } = await useCreateProductState()

const { resetCreatePricesState } = useCreatePricesState()

const { createProduct } = await useProductCreate()

const isCreating = ref(false)

async function handleCreate() {
  if (!product.value?.name?.trim()) {
    alert('❌ Product name is required')
    return
  }

  isCreating.value = true

  const response = await createProduct()

  if (!response.success) {
    alert(`❌ Failed to create product: ${response.error}`)
    isCreating.value = false
    return
  }

  // Success! Clear the form and show success message
  alert(`✅ Product created successfully!`)
  resetCreateProductState()
  resetCreatePricesState()
  selectedTab.value = 'write'
  isCreating.value = false
}

function handleClear() {
  if (confirm('Are you sure you want to clear the form?')) {
    resetCreateProductState()
    resetCreatePricesState()
    selectedTab.value = 'write'
  }
}
</script>
