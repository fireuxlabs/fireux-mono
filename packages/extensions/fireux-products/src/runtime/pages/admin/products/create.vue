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
    submit-label="Create product"
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
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useProductPermissions } from '../../../composables/useProductPermissions'
// Use Nuxt UI toast if available (auto-imported in app)
const useToastFn = (globalThis as any).useToast as undefined | (() => any)
const toast = useToastFn ? useToastFn() : undefined
import { useProductCreate } from '../../../composables/fireux/firestore/product/mutations/useProductCreate'
import { useCreatePricesState } from '../../../composables/fireux/app/product-create/useCreatePricesState'
import { useCreateProductState } from '../../../composables/fireux/app/product-create/useCreateProductState'
import type { StripePriceInput } from '../../../models/product.model'

definePageMeta({
  layout: 'console',
  title: 'Create Product',
  requiresAuth: true,
  roles: ['admin'],
})

const { canManageProducts, pending: permissionsPending } = useProductPermissions()

useHead({ title: 'Create Product' })

const isCreating = ref(false)
const { product, resetCreateProductState } = await useCreateProductState()
const { prices, defaultPrice, resetCreatePricesState } = useCreatePricesState()
const { createProductFromInput } = useProductCreate()
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
  if (isCreating.value) return
  isCreating.value = true
  try {
    const isBlankPayload =
      !product.value?.name && !product.value?.slug && !product.value?.id
    const hasNoPrices = !prices.value?.length

    if (isDev && isBlankPayload && hasNoPrices) {
      let demoList: any[] = []
      try {
        const mod = await import(
          '../../../../../../../../demo/product.demo'
        )
        demoList = Array.isArray(mod?.demoProductList)
          ? mod.demoProductList
          : []
      } catch (error) {
        throw new Error('Demo module list not found for bulk create')
      }

      if (!demoList.length) {
        throw new Error('No demo products found for bulk create')
      }

      const results = await Promise.all(
        demoList.map(async (demo) => {
          const priceInputs = Array.isArray(demo?.prices)
            ? demo.prices.map(({ id: _id, ...rest }: any) => rest)
            : []
          return createProductFromInput({
            payload: demo as any,
            priceInputs: priceInputs as StripePriceInput[],
          })
        })
      )

      const successCount = results.filter((result) => result.success).length
      const failed = results.filter((result) => !result.success)

      if (toast) {
        toast.add({
          title: 'Bulk create complete',
          description: `${successCount}/${demoList.length} created`,
          icon:
            failed.length > 0
              ? 'i-heroicons-exclamation-triangle'
              : 'i-heroicons-check-circle',
          color: failed.length > 0 ? 'amber' : 'green',
        })
      }

      if (successCount > 0) {
        await router.push('/admin/products')
      }

      if (failed.length) {
        console.error('[fireux-products] bulk create failures', failed)
      }

      return
    }

    const result = await createProductFromInput({
      payload: product.value as any,
      priceInputs: prices.value as StripePriceInput[],
    })

    if (!result.success) {
      if (toast)
        toast.add({
          title: 'Create failed',
          description: result.error || 'Unknown error',
          icon: 'i-heroicons-x-circle',
          color: 'red',
        })
      return
    }

    if (toast)
      toast.add({
        title: 'Product created',
        description: result.id ? `Created: ${result.id}` : 'Product created',
        icon: 'i-heroicons-check-circle',
        color: 'green',
      })
    await router.push('/admin/products')
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
