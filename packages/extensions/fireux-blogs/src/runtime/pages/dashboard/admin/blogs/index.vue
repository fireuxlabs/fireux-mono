<!-- FILE: packages/extensions/fireux-blogs/src/runtime/pages/dashboard/admin/blogs/index.vue -->
<!-- Concurrent edit — 2026-07-21 17:00 CEST — Dashboard Family pass: give Blog administration a task-led browse surface. -->
<template>
  <UDashboardPanel id="dashboard-admin-blogs">
    <template #header>
      <LayoutsDashboardNavbar :title="`Admin · ${pageTitle}`" />
    </template>

    <template #body>
      <UPage>
        <UPageBody class="pagebody">
          <UPageHeader
            headline="Publishing"
            title="Blog posts"
            description="Browse this app’s blog records and create the next post when you are ready to publish."
          >
            <template #links>
              <UButton
                to="/dashboard/admin/blogs/create"
                label="Create post"
                icon="i-lucide-plus"
              />
            </template>
          </UPageHeader>

          <BlogCollectionManager />
        </UPageBody>
      </UPage>
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
    description: 'Browse blog records and publish new posts.',
    icon: 'i-lucide-newspaper',
    order: 20,
    createTo: '/dashboard/admin/blogs/create',
  },
  requiresAuth: true,
  roles: ['admin'],
})

useHead({ title: `${appName} | ${pageTitle}` })
</script>
