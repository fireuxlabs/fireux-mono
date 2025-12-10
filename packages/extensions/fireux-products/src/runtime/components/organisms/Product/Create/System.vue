<template>
  <div class="component">
    <main>
      <UCard>
        <div class="card-header">
          <UButton
            variant="ghost"
            size="sm"
            icon="i-heroicons-trash"
            @click="handleClear"
            class="clear-button"
          />
        </div>
        <UTabs v-model="selectedTab" :items="tabItems">
          <template #write>
            <OrganismsProductCreateWrite />
          </template>
          <template #preview>
            <OrganismsProductCreatePreview />
          </template>
        </UTabs>
        <div class="actions">
          <UButton :loading="isCreating" @click="handleCreate">
            <UIcon name="i-heroicons-plus" />
            Create
          </UButton>
        </div>
      </UCard>
    </main>

    <div v-if="isCreating">
      <UCard>
        <div>
          <UIcon name="i-heroicons-arrow-path" />
          <span>Creating product...</span>
        </div>
      </UCard>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
// Use Nuxt UI toast if available (auto-imported in app)
const useToastFn = (globalThis as any).useToast as undefined | (() => any)
const toast = useToastFn ? useToastFn() : undefined
import { useCreatePricesState } from '../../../../composables/fireux/firestore/objects/Product/Prices/useCreatePricesState'
import { useCreateProductState } from '../../../../composables/fireux/firestore/products/product/state/useCreateProductState'
import { useProductCreate } from '../../../../composables/fireux/firestore/objects/Product/useProductCreate'

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
  console.log('🎬 [handleCreate] Create button clicked')

  // Validate required fields
  if (!product.value?.name?.trim()) {
    console.warn('⚠️ Product name is required')
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
  console.log('⏳ Starting product creation...')

  const response = await createProduct()

  if (!response.success) {
    console.error('❌ Product creation failed:', response.error)
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
  console.log('🎉 Product created successfully!')
  if (toast)
    toast.add({
      title: 'Created',
      description: 'Product created successfully',
      icon: 'i-heroicons-check-circle',
      color: 'green',
    })
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

<style scoped>
.card-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1rem;
}

.clear-button {
  margin-left: auto;
}

footer,
.actions {
  display: flex;
  justify-content: center;
  margin-top: 1rem;
}
</style>
