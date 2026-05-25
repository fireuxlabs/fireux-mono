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
import { definePageMeta, useRouter } from '#imports'
import { computed } from 'vue'
import { useFireUXConfig } from '../../../composables/fireux/app/FireUXConfig'
import { useAppProfileView } from '../../../composables/fireux/firestore/core/app/utils/view/useAppProfileView'
import { useApp } from '../../../composables/fireux/firestore/core/app/useApp'

const { app, pending } = useApp()
const { model: appProfileModel } = useAppProfileView(app)
const fireux = useFireUXConfig()
const router = useRouter()

type AdminSurfaceMeta = {
  surface?: boolean
  key?: string
  label?: string
  description?: string
  icon?: string
  order?: number
  to?: string
  createTo?: string
  domain?: string
}

type AdminTool = {
  key: string
  label: string
  description: string
  icon: string
  to: string
  createTo?: string
  order: number
}

const adminTools = computed(() => {
  const seen = new Set<string>()
  const domainSet = new Set(
    fireux.domains.map((domain) => domain.trim().toLowerCase()).filter(Boolean)
  )

  return router
    .getRoutes()
    .filter((route) => !(route as { aliasOf?: unknown }).aliasOf)
    .map((route) => {
      const surface = (route.meta as { adminSurface?: AdminSurfaceMeta })
        .adminSurface

      if (surface?.surface !== true) return null
      const domain = surface.domain?.trim().toLowerCase()
      if (domain && !domainSet.has(domain)) return null

      const key = surface.key || String(route.name || route.path)
      if (seen.has(key)) return null
      seen.add(key)

      return {
        key,
        label: surface.label || key,
        description: surface.description || '',
        icon: surface.icon || 'i-lucide-settings',
        to: surface.to || route.path,
        createTo: surface.createTo,
        order: Number.isFinite(surface.order) ? Number(surface.order) : 1000,
      } satisfies AdminTool
    })
    .filter((tool): tool is AdminTool => tool !== null)
    .sort((a, b) => a.order - b.order || a.label.localeCompare(b.label))
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
