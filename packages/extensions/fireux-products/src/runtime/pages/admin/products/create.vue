<!-- FILE: packages/extensions/fireux-products/src/runtime/pages/admin/products/create.vue -->
<template>
  <UPage>
    <UPageHeader
      title="Create Product"
      description="Add a new product to the catalog for this runtime."
    />

    <UPageBody class="pagebody">
      <div v-if="permissionsPending" class="space-y-3">
        <USkeleton v-for="n in 3" :key="n" class="h-20" />
      </div>

      <UAlert
        v-else-if="!canManageProducts"
        color="amber"
        title="Admins only"
        description="Only admins can publish products for this runtime."
      />

      <MoleculesCreateShell
        v-else
        :loading="isCreating"
        submit-label="Create"
        @submit="handleCreate"
        @clear="handleClear"
      >
        <template #write>
          <ProductCreateWrite />
        </template>
        <template #preview>
          <ProductCreatePreview />
        </template>
      </MoleculesCreateShell>

      <div v-if="isDev" class="mt-6">
        <DevJson
          :title="'Create Product (JSON)'"
          context="admin/products/create"
          :data="devCreateJson"
          :default-open="false"
        />
      </div>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useStorage } from '@vueuse/core'
import { computed, ref } from 'vue'
import { useHead, useRouter } from '#imports'
import { useProductPermissions } from '../../../composables/useProductPermissions'
// Use Nuxt UI toast if available (auto-imported in app)
const useToastFn = (globalThis as any).useToast as undefined | (() => any)
const toast = useToastFn ? useToastFn() : undefined
import {
  useCreateProductState,
  useCreatePricesState,
  useProductCreateSubmit,
} from '../../../composables/fireux/firestore/objects/product/useProduct'

definePageMeta({
  layout: 'dashboard',
  title: 'Create Product',
  requiresAuth: true,
  roles: ['admin'],
})

const { canManageProducts, pending: permissionsPending } =
  useProductPermissions()

useHead({ title: 'Create Product' })

const isCreating = ref(false)
const { product, resetCreateProductState } = await useCreateProductState()
const { prices, defaultPrice, resetCreatePricesState } = useCreatePricesState()
const { submit } = useProductCreateSubmit()
const mainImageData = useStorage<string>('createProductMainImageData', '')
const isDev = import.meta.dev
const router = useRouter()
const devCreateJson = computed(() => ({
  product: product.value,
  prices: prices.value,
  defaultPrice: defaultPrice.value,
  mainImageDataLength: mainImageData.value?.length || 0,
}))

async function handleCreate() {
  if (import.meta.dev) {
    console.info('[products/create] click:create', {
      name: product.value?.name,
      slug: product.value?.slug,
      product_type: product.value?.product_type,
      pricesCount: prices.value?.length || 0,
      defaultPrice: defaultPrice.value,
    })
  }

  isCreating.value = true
  try {
    if (import.meta.dev) {
      console.info('[products/create] submit:start')
    }
    await submit()
    if (import.meta.dev) {
      console.info('[products/create] submit:success')
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
    if (import.meta.dev) {
      console.info('[products/create] navigate:/admin/products')
    }
    await router.push('/admin/products')
  } catch (error) {
    if (import.meta.dev) {
      console.error('[products/create] submit:error', error)
    }
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
    if (import.meta.dev) {
      console.info('[products/create] submit:done', {
        isCreating: isCreating.value,
      })
    }
  }
}

function handleClear() {
  if (confirm('Are you sure you want to clear the form?')) {
    resetCreateProductState()
    resetCreatePricesState()
  }
}
</script>
