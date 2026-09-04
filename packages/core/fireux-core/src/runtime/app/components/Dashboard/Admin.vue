<!-- Concurrent edit — 2026-07-21 16:25 CEST — Dashboard Admin pass: shape the shared app control room around real App and AppUser authority. -->
<template>
  <MoleculesStateCard
    v-if="appOutcome === 'idle' || appOutcome === 'pending'"
    entity="app administration"
    kind="document"
    loading
  />

  <MoleculesStateCard
    v-else-if="appOutcome === 'error'"
    entity="app administration"
    kind="document"
    state="error"
  />

  <MoleculesStateCard
    v-else-if="appOutcome === 'missing' || !appSnapshot"
    entity="app"
    kind="document"
    state="missing"
  />

  <div v-else class="space-y-6">
    <UPageHeader :title="appDisplayName">
      <template #links>
        <UButton
          v-if="appCard?.to"
          :to="appCard.to"
          label="View app"
          icon="i-lucide-external-link"
          color="neutral"
          variant="soft"
        />
      </template>
    </UPageHeader>

    <section
      v-for="group in adminToolGroups"
      :key="group.owner"
      class="space-y-2"
    >
      <h2 class="text-sm font-semibold text-muted">{{ group.label }}</h2>
      <div class="divide-y divide-default">
        <div
          v-for="tool in group.tools"
          :key="tool.key"
          class="flex items-center gap-4 py-4 first:pt-0"
        >
          <UIcon :name="tool.icon" class="size-5 shrink-0 text-primary" />
          <div class="min-w-0 flex-1">
            <h3 class="font-medium text-highlighted">{{ tool.label }}</h3>
            <p v-if="tool.description" class="text-sm text-muted">
              {{ tool.description }}
            </p>
          </div>
          <UButton :to="tool.to" label="Open" color="neutral" variant="soft" />
        </div>
      </div>
    </section>

    <details class="rounded-lg border border-default">
      <summary class="cursor-pointer px-4 py-3 font-medium text-highlighted">
        FireUX App settings and access
      </summary>
      <div class="border-t border-default p-4 sm:p-6">
        <AppEditAdmin :app="appSnapshot" />
      </div>
    </details>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useFireUXConfig } from '../../composables/config/FireUXConfig'
import { useApp } from '../../composables/useApp'
import { useAppInterface } from '../../composables/useAppInterface'

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
  owner?: 'app' | 'ecosystem'
}

type AdminTool = {
  key: string
  label: string
  description: string
  icon: string
  to: string
  createTo: string | undefined
  order: number
  owner: 'app' | 'ecosystem'
}

const fireux = useFireUXConfig()
const router = useRouter()
const { read: { data: app, pending: appPending, error: appError } } = useApp()
const { pill: toAppCard } = useAppInterface(app)
const appOutcome = computed(() => {
  if (appPending.value) return 'pending'
  if (appError.value) return 'error'
  return app.value ? 'ready' : 'missing'
})

const appSnapshot = computed(() =>
  appOutcome.value === 'ready' ? (app.value ?? null) : null
)
const appCard = computed(() => toAppCard(appSnapshot.value))
const appDisplayName = computed(
  () => appCard.value?.displayName || fireux.appName
)

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
        owner: surface.owner === 'ecosystem' ? 'ecosystem' : 'app',
      } satisfies AdminTool
    })
    .filter((tool): tool is AdminTool => tool !== null)
    .sort((a, b) => a.order - b.order || a.label.localeCompare(b.label))
})

const adminToolGroups = computed(() => {
  const groups = [
    {
      owner: 'app' as const,
      label: appDisplayName.value,
      tools: adminTools.value.filter((tool) => tool.owner === 'app'),
    },
    {
      owner: 'ecosystem' as const,
      label: fireux.ecosystem || 'Ecosystem',
      tools: adminTools.value.filter((tool) => tool.owner === 'ecosystem'),
    },
  ]
  return groups.filter((group) => group.tools.length > 0)
})
</script>
