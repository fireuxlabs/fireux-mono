<!-- FILE: packages/extensions/fireux-blogs/src/runtime/pages/dashboard/admin/blogs/index.vue -->
<template>
  <UDashboardPanel id="dashboard-admin-blogs">
    <template #header>
      <LayoutsDashboardNavbar :title="`Admin · ${pageTitle}`">
        <template #right>
          <UButton to="/dashboard/admin/blogs/create" color="primary">
            Create post
          </UButton>
        </template>
      </LayoutsDashboardNavbar>
    </template>

    <template #body>
      <div class="px-0 py-0 sm:px-4 sm:py-4 lg:px-6">
        <UPage>
          <UPageBody class="pagebody">
            <BlogCollectionManager />
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

const pageTitle = 'Blog'
definePageMeta({
  layout: 'dashboard',
  title: 'Admin Blog',
  adminSurface: {
    surface: true,
    key: 'blogs',
    label: 'Blog posts',
    description: 'Manage public posts and app updates.',
    icon: 'i-lucide-newspaper',
    order: 20,
    createTo: '/dashboard/admin/blogs/create',
  },
  requiresAuth: true,
  roles: ['admin'],
})

useHead({ title: `${appName} | ${pageTitle}` })
</script>
