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

          <MoleculesStateCard
            v-if="blogCollection.outcome === 'pending'"
            entity="Blog"
            kind="collection"
            loading
          />
          <MoleculesStateCard
            v-else-if="blogCollection.outcome === 'error'"
            entity="Blog"
            kind="collection"
            state="error"
          />
          <BlogCollection v-else :posts="blogCollection.collection" />
        </UPageBody>
      </UPage>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useBlogCollection } from '../../../../blog/composables/useBlogCollection'
const blogCollection = reactive(useBlogCollection())

import { useHead } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'

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
