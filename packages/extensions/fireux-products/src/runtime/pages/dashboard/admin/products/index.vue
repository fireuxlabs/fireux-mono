<!-- FILE: packages/extensions/fireux-products/src/runtime/pages/dashboard/admin/products/index.vue -->
<template>
  <UDashboardPanel id="dashboard-admin-products">
    <template #header>
      <LayoutsDashboardNavbar :title="`Admin · ${pageTitle}`">
        <template #right>
          <UButton to="/dashboard/admin/products/create" color="primary">
            Create product
          </UButton>
        </template>
      </LayoutsDashboardNavbar>
    </template>

    <template #body>
      <div class="px-0 py-0 sm:px-4 sm:py-4 lg:px-6">
        <UPage>
          <UPageBody class="pagebody">
            <ProductCollectionManager />
          </UPageBody>
        </UPage>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'

const { appName } = useFireUXConfig()

const pageTitle = 'Products'
definePageMeta({
  layout: 'dashboard',
  title: 'Admin Products',
  adminSurface: {
    surface: true,
    key: 'products',
    label: 'Products',
    description: 'Manage public products, pricing, and product pages.',
    icon: 'i-lucide-package',
    order: 10,
    createTo: '/dashboard/admin/products/create',
  },
  requiresAuth: true,
  roles: ['admin'],
})

useHead({ title: `${appName} | ${pageTitle}` })
</script>
