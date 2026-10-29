<!-- FILE: packages/extensions/fireux-products/src/runtime/pages/dashboard/admin/products/index.vue -->
<!-- Concurrent edit — 2026-07-21 17:00 CEST — Dashboard Family pass: give Product administration a task-led browse surface. -->
<template>
  <UDashboardPanel id="dashboard-admin-products">
    <template #header>
      <FireLayoutsDashboardNavbar :title="`Admin · ${pageTitle}`" />
    </template>

    <template #body>
      <UPage>
        <UPageBody class="pagebody">
          <UPageHeader
            headline="Catalogue"
            title="Products"
            description="Browse product records available to this app and create a new catalogue item when needed."
          >
            <template #links>
              <UButton
                to="/dashboard/admin/products/create"
                label="Create product"
                icon="i-lucide-plus"
              />
            </template>
          </UPageHeader>

          <FireStateCard
            v-if="productCollection.outcome === 'pending'"
            entity="Product"
            kind="collection"
            loading
          />
          <FireStateCard
            v-else-if="productCollection.outcome === 'error'"
            entity="Product"
            kind="collection"
            state="error"
          />
          <ProductCollection v-else :products="productCollection.products" />
        </UPageBody>
      </UPage>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useProductCollection } from '../../../../product/composables/useProductCollection'
const productCollection = reactive(useProductCollection({ admin: true }))

import { useHead } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'

const { appName } = useFireUXConfig()

const pageTitle = 'Products'
definePageMeta({
  layout: 'dashboard',
  title: 'Admin Products',
  adminSurface: {
    surface: true,
    key: 'products',
    label: 'Products',
    description: 'Browse product records and create products with pricing.',
    icon: 'i-lucide-package',
    order: 10,
    createTo: '/dashboard/admin/products/create',
  },
  requiresAuth: true,
  roles: ['admin'],
})

useHead({ title: `${appName} | ${pageTitle}` })
</script>
