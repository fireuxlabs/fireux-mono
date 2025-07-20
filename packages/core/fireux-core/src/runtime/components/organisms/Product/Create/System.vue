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
            <FireOrganismsProductCreateWrite />
          </template>
          <template #preview>
            <FireOrganismsProductCreatePreview />
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
import { useCreatePricesState } from '../../../../composables/firestore/objects/Product/Prices/useCreatePricesState'
import { useCreateProductState } from '../../../../composables/firestore/objects/Product/useCreateProductState'
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
  console.log('🎬 [handleCreate] Create button clicked')

  // Validate required fields
  if (!product.value?.name?.trim()) {
    console.warn('⚠️ Product name is required')
    alert('❌ Product name is required')
    return
  }

  isCreating.value = true
  console.log('⏳ Starting product creation...')

  const response = await createProduct()

  if (!response.success) {
    console.error('❌ Product creation failed:', response.error)
    alert(`❌ Failed to create product: ${response.error}`)
    isCreating.value = false
    return
  }

  // Success! Clear the form and show success message
  console.log('🎉 Product created successfully!')
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
