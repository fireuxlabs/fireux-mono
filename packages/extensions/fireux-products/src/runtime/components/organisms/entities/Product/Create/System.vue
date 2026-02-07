<template>
  <MoleculesCreateShell
    :loading="isCreating"
    submit-label="Create"
    @submit="handleCreate"
    @clear="requestClear"
  >
    <template #write>
      <ProductCreateWrite />
    </template>
    <template #preview>
      <ProductCreatePreview />
    </template>
  </MoleculesCreateShell>

  <UModal
    v-model="isClearConfirmOpen"
    title="Clear product draft?"
    description="This will remove unsaved product and pricing changes."
  >
    <template #body>
      <div class="flex justify-end gap-2">
        <UButton
          variant="ghost"
          color="neutral"
          @click="isClearConfirmOpen = false"
        >
          Cancel
        </UButton>
        <UButton color="error" @click="confirmClear">
          Clear draft
        </UButton>
      </div>
    </template>
  </UModal>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify'
import { useCreatePricesState } from '../../../../../composables/fireux/firestore/objects/product/Prices/useCreatePricesState'
import { useCreateProductState } from '../../../../../composables/fireux/firestore/objects/product/state/useCreateProductState'
import { useProductCreate } from '../../../../../composables/fireux/firestore/objects/product/useProductCreate'

const { product, resetCreateProductState } = await useCreateProductState()

const { resetCreatePricesState } = useCreatePricesState()

const { createProduct } = await useProductCreate()
const toast = useToastify()

const isCreating = ref(false)
const isClearConfirmOpen = ref(false)

function clearDraftState() {
  resetCreateProductState()
  resetCreatePricesState()
}

async function handleCreate() {
  if (isCreating.value) return

  // Validate required fields
  if (!product.value?.name?.trim()) {
    toast.add({
      title: 'Missing name',
      description: 'Product name is required',
      color: 'amber',
    })
    return
  }

  isCreating.value = true
  try {
    const response = await createProduct()

    if (!response.success) {
      toast.add({
        title: 'Create failed',
        description: String(response.error || 'Unknown error'),
        color: 'red',
      })
      return
    }

    toast.add({
      title: 'Created',
      description: 'Product created successfully',
      color: 'green',
    })
    clearDraftState()
  } catch (error: any) {
    toast.add({
      title: 'Create failed',
      description: String(error?.message || 'Unknown error'),
      color: 'red',
    })
  } finally {
    isCreating.value = false
  }
}

function requestClear() {
  if (isCreating.value) return
  isClearConfirmOpen.value = true
}

function confirmClear() {
  clearDraftState()
  isClearConfirmOpen.value = false
}
</script>
