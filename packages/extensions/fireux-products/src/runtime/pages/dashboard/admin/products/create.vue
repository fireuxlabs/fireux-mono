<!-- FILE: packages/extensions/fireux-products/src/runtime/pages/dashboard/admin/products/create.vue -->
<!-- Concurrent edit — 2026-07-20 11:44 CEST — Root Efficiency Pass 4 of 4: use the Products-owned Product fixture. -->
<!-- Concurrent edit — 2026-07-20 17:17 CEST — Demo Data Spine pass: remove blank-form demo bulk writes to canonical Products. -->
<!-- Concurrent edit — 2026-07-21 17:00 CEST — Dashboard Family pass: clarify the Product creation task and use shared notifications. -->
<template>
  <UDashboardPanel id="dashboard-admin-products-create">
    <template #header>
      <LayoutsDashboardNavbar title="Admin · Create Product" />
    </template>

    <template #body>
      <UPage>
        <UPageBody class="pagebody">
          <UPageHeader
            headline="Products"
            title="Create a product"
            description="Set the product details and prices, review the preview, then create the catalogue record."
          >
            <template #links>
              <UButton
                to="/dashboard/admin/products"
                label="Back to products"
                icon="i-lucide-arrow-left"
                color="neutral"
                variant="soft"
              />
            </template>
          </UPageHeader>

          <div v-if="permissionsPending" class="space-y-3">
            <USkeleton v-for="n in 3" :key="n" class="h-20" />
          </div>

          <UAlert
            v-else-if="!canManageProducts"
            color="warning"
            title="Admins only"
            description="Only app admins can create products."
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

          <div class="mt-6">
<DevDebugPanel
  object-origin="fetched"
              launcher
              include-route
              :title="'Create Product (JSON)'"
              context="dashboard/admin/products/create"
              :objects="devCreateJson"
  :derived="{}"
              :default-open="false"
            />
          </div>
        </UPageBody>
      </UPage>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { useStorage } from '@vueuse/core'
import { computed, ref } from 'vue'
import { useHead, useRouter } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useToastify } from 'fireux-core/runtime/composables/ui/useToastify'
import { useProductPermissions } from '../../../../product/composables/useProductPermissions'
import { useProductCreate } from '../../../../product/composables/firestore/mutations/useProductCreate'
import { useCreatePricesState } from '../../../../product/composables/create/useCreatePricesState'
import { useCreateProductState } from '../../../../product/composables/create/useCreateProductState'
import type { StripePriceInput } from '../../../../product/models/product.model.ts'

definePageMeta({
  layout: 'dashboard',
  title: 'Create Product',
  requiresAuth: true,
  roles: ['admin'],
})

const { canManageProducts, pending: permissionsPending } = useProductPermissions()
const { appName } = useFireUXConfig()
const toast = useToastify()

useHead({ title: `${appName} | Create Product` })

const isCreating = ref(false)
const { product, resetCreateProductState } = await useCreateProductState()
const { prices, defaultPrice, resetCreatePricesState } = useCreatePricesState()
const { createProductFromInput } = useProductCreate()
const mainImageData = useStorage<string>('createProductMainImageData', '')
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
    const result = await createProductFromInput({
      payload: product.value as any,
      priceInputs: prices.value as StripePriceInput[],
    })

    if (!result.success) {
      toast.error(
        `Product was not created: ${result.error || 'Please try again.'}`
      )
      return
    }

    toast.success(
      result.id ? `Product created: ${result.id}` : 'Product created.'
    )
    await router.push('/dashboard/admin/products')
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
