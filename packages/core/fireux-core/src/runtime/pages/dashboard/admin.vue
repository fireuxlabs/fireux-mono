<template>
  <UDashboardPanel id="app-admin">
    <template #header>
      <LayoutsDashboardNavbar title="Admin" />
    </template>

    <template #body>
      <div class="px-0 py-0 sm:px-4 sm:py-4 lg:px-6">
        <UPageCard v-if="pending" variant="subtle">
          <p class="text-sm text-dimmed">Loading app…</p>
        </UPageCard>

        <div v-else class="space-y-6">
          <UPageCard
            v-if="adminTools.length"
            title="Admin tools"
            description="Publishing and commercial tools for this app."
            variant="subtle"
          >
            <div class="grid gap-3 sm:grid-cols-2">
              <div
                v-for="tool in adminTools"
                :key="tool.key"
                class="flex flex-col gap-3 rounded-md border border-default bg-default p-4"
              >
                <div class="flex items-start gap-3">
                  <UIcon :name="tool.icon" class="mt-0.5 size-5 text-primary" />
                  <div class="min-w-0">
                    <h2 class="font-semibold text-highlighted">
                      {{ tool.label }}
                    </h2>
                    <p class="mt-1 text-sm leading-6 text-muted">
                      {{ tool.description }}
                    </p>
                  </div>
                </div>

                <div class="mt-auto flex flex-wrap gap-2">
                  <UButton
                    :to="tool.to"
                    color="primary"
                    variant="soft"
                    :icon="tool.icon"
                  >
                    Open
                  </UButton>
                  <UButton
                    v-if="tool.createTo"
                    :to="tool.createTo"
                    color="neutral"
                    variant="ghost"
                    icon="i-lucide-plus"
                  >
                    Create
                  </UButton>
                </div>
              </div>
            </div>
          </UPageCard>

          <UPageCard
            v-if="!app"
            title="App not available"
            description="No app data found for this environment."
            variant="subtle"
          >
            <UButton to="/" label="Go to Home" variant="soft" class="w-fit" />
          </UPageCard>

          <template v-else>
            <AppCardsProfile v-if="appProfileModel" :model="appProfileModel" />

            <AppEditSectionsInfo :app="app" />

            <AppEditAdmin :app="app" />
          </template>
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { definePageMeta, useRuntimeConfig } from '#imports'
import { computed } from 'vue'
import { useAppProfileView } from '../../composables/fireux/firestore/core/app/utils/view/useAppProfileView'
import { useApp } from '../../composables/fireux/firestore/core/app/useApp'

const { app, pending } = useApp()
const { model: appProfileModel } = useAppProfileView(app)
const runtimeConfig = useRuntimeConfig()

const fireuxConfig = computed(
  () => ((runtimeConfig.public as any)?.fireux ?? {}) as Record<string, any>
)

const adminTools = computed(() => {
  const tools: Array<{
    key: string
    label: string
    description: string
    icon: string
    to: string
    createTo?: string
  }> = []

  if (fireuxConfig.value.products?.enabled === true) {
    tools.push({
      key: 'products',
      label: 'Products',
      description: 'Manage public products, pricing, and product pages.',
      icon: 'i-lucide-package',
      to: '/admin/products',
      createTo: '/admin/products/create',
    })
  }

  if (fireuxConfig.value.blogs?.enabled === true) {
    tools.push({
      key: 'blogs',
      label: 'Blog',
      description: 'Manage public posts and app updates.',
      icon: 'i-lucide-newspaper',
      to: '/admin/blogs',
      createTo: '/admin/blogs/create',
    })
  }

  return tools
})

definePageMeta({
  layout: 'dashboard',
  nav: {
    key: 'dashboard-admin',
    label: 'Admin',
    icon: 'i-lucide-shield-check',
    position: 'middle',
    order: 10,
    desktop: true,
    layouts: ['dashboard'],
  },
  requiresAuth: true,
  roles: ['admin'],
})
</script>
