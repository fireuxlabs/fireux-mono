<!-- FILE: packages/extensions/fireux-products/src/runtime/pages/products/create.vue -->
<template>
  <UPage>
    <UPageHeader
      title="Create Product"
      description="Add a new product to the catalog for this runtime."
    />

    <UPageBody class="pagebody">
      <div v-if="isChecking" class="space-y-3">
        <USkeleton v-for="n in 3" :key="n" class="h-20" />
      </div>

      <UAlert
        v-else-if="!isAllowed"
        color="amber"
        title="Admins only"
        description="Only admins can publish products for this runtime."
      />

      <OrganismsCreateShell
        v-else
        :loading="isCreating"
        submit-label="Create"
        @submit="handleCreate"
        @clear="handleClear"
      >
        <template #write>
          <OrganismsProductCreateWrite />
        </template>
        <template #preview>
          <OrganismsProductCreatePreview />
        </template>
      </OrganismsCreateShell>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useHead } from '#imports'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser.ts'
// Use Nuxt UI toast if available (auto-imported in app)
const useToastFn = (globalThis as any).useToast as undefined | (() => any)
const toast = useToastFn ? useToastFn() : undefined
import { useCreatePricesState } from '../../composables/fireux/firestore/objects/Product/Prices/useCreatePricesState'
import { useCreateProductState } from '../../composables/fireux/firestore/products/product/state/useCreateProductState'
import { useProductCreate } from '../../composables/fireux/firestore/objects/Product/useProductCreate'

definePageMeta({
  layout: 'default',
  nav: {
    key: 'products-create',
    label: 'Create product',
    icon: 'i-lucide-plus',
    order: 21,
    desktop: false,
    mobile: false,
    layouts: ['default'],
  },
  title: 'Create Product',
})

const { isAdmin, isLoading } = useUser()
const isChecking = computed(() => Boolean(isLoading.value))
const isAllowed = computed(() => isAdmin.value)

useHead({ title: 'Create Product' })

const isCreating = ref(false)
const { product, resetCreateProductState } = await useCreateProductState()
const { resetCreatePricesState } = useCreatePricesState()
const { createProduct } = await useProductCreate()

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
