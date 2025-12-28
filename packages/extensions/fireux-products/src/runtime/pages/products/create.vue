<!-- FILE: packages/extensions/fireux-products/src/runtime/pages/products/create.vue -->
<template>
  <UPage>
    <UPageHeader
      title="Create Product"
      description="Add a new product to the catalog for this runtime."
    />

    <UPageBody class="pagebody">
      <div v-if="permissionsPending?.value" class="space-y-3">
        <USkeleton v-for="n in 3" :key="n" class="h-20" />
      </div>

      <UAlert
        v-else-if="!canPublishProduct"
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
import { ref } from 'vue'
import { useHead } from '#imports'
import { useProductPermissions } from '../../composables/useProductPermissions'
// Use Nuxt UI toast if available (auto-imported in app)
const useToastFn = (globalThis as any).useToast as undefined | (() => any)
const toast = useToastFn ? useToastFn() : undefined
import {
  useCreateProductState,
  useCreatePricesState,
  useProductCreateSubmit,
} from '../../composables/fireux/firestore/objects/product/useProduct'

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

const { canPublishProduct, pending: permissionsPending } =
  useProductPermissions()

useHead({ title: 'Create Product' })

const isCreating = ref(false)
const { product, resetCreateProductState } = await useCreateProductState()
const { resetCreatePricesState } = useCreatePricesState()
const { submit } = useProductCreateSubmit()

async function handleCreate() {
  isCreating.value = true
  try {
    await submit()

    if (toast)
      toast.add({
        title: 'Created',
        description: 'Product created successfully',
        icon: 'i-heroicons-check-circle',
        color: 'green',
      })
    resetCreateProductState()
    resetCreatePricesState()
  } catch (error) {
    if (toast)
      toast.add({
        title: 'Create failed',
        description:
          error instanceof Error ? error.message : 'Unable to create product',
        icon: 'i-heroicons-x-circle',
        color: 'red',
      })
    return
  } finally {
    isCreating.value = false
  }
}

function handleClear() {
  if (confirm('Are you sure you want to clear the form?')) {
    resetCreateProductState()
    resetCreatePricesState()
  }
}
</script>
