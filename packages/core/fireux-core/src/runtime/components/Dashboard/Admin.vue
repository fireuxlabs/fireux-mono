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

  <div v-else class="space-y-8">
    <UPageHeader
      :headline="`${fireux.appShortName} administration`"
      :title="`Run ${appDisplayName}`"
      :description="`Manage ${appDisplayName}’s public story, access and team from one place.`"
    >
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

    <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <UPageCard
        v-for="fact in adminFacts"
        :key="fact.label"
        variant="subtle"
      >
        <div class="flex items-start gap-3">
          <div
            class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-elevated"
          >
            <UIcon :name="fact.icon" class="size-5 text-primary" />
          </div>
          <div class="min-w-0">
            <p class="text-xs font-medium uppercase tracking-wide text-dimmed">
              {{ fact.label }}
            </p>
            <p class="mt-1 truncate font-semibold text-highlighted">
              {{ fact.value }}
            </p>
            <p class="mt-1 text-xs leading-5 text-muted">
              {{ fact.detail }}
            </p>
          </div>
        </div>
      </UPageCard>
    </div>

    <section v-if="adminTools.length" class="space-y-4">
      <div class="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 class="text-xl font-semibold text-highlighted">Admin tools</h2>
          <p class="mt-1 text-sm text-muted">
            Additional controls enabled for this app.
          </p>
        </div>
        <UBadge color="neutral" variant="soft">
          {{ adminTools.length }} available
        </UBadge>
      </div>

      <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <UPageCard
          v-for="tool in adminTools"
          :key="tool.key"
          variant="subtle"
          class="h-full"
        >
          <div class="flex h-full flex-col gap-4">
            <div class="flex items-start gap-3">
              <div
                class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10"
              >
                <UIcon :name="tool.icon" class="size-5 text-primary" />
              </div>
              <div class="min-w-0">
                <h3 class="font-semibold text-highlighted">
                  {{ tool.label }}
                </h3>
                <p class="mt-1 text-sm leading-6 text-muted">
                  {{ tool.description }}
                </p>
              </div>
            </div>

            <div class="mt-auto flex flex-wrap gap-2">
              <UButton
                :to="tool.to"
                label="Open"
                :icon="tool.icon"
                color="primary"
                variant="soft"
              />
              <UButton
                v-if="tool.createTo"
                :to="tool.createTo"
                label="Create"
                icon="i-lucide-plus"
                color="neutral"
                variant="ghost"
              />
            </div>
          </div>
        </UPageCard>
      </div>
    </section>

    <div
      class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem] xl:items-start"
    >
      <section class="space-y-4">
        <div>
          <UBadge color="primary" variant="soft">App operations</UBadge>
          <h2 class="mt-3 text-xl font-semibold text-highlighted">
            Public story and people
          </h2>
          <p class="mt-1 max-w-2xl text-sm leading-6 text-muted">
            Keep the app’s public copy current, review access requests and
            manage the team that runs it.
          </p>
        </div>

        <AppEditAdmin :app="appSnapshot" />
      </section>

      <aside class="space-y-4 xl:sticky xl:top-4">
        <UPageCard
          title="App identity"
          description="The app record these controls belong to."
          icon="i-lucide-app-window"
          variant="subtle"
        >
          <AppCardsPill
            v-if="appCard"
            v-bind="appCard"
            :link="Boolean(appCard.to)"
            class="block"
          />
        </UPageCard>

        <AppEditSectionsInfo :app="appSnapshot" />

        <UPageCard
          title="Admin scope"
          icon="i-lucide-shield-check"
          variant="subtle"
        >
          <p class="text-sm leading-6 text-muted">
            Changes here affect {{ appDisplayName }} and its members. Your
            personal public profile stays separate.
          </p>
        </UPageCard>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useFireUXConfig } from '../../composables/fireux/app/FireUXConfig'
import { useApp } from '../../app/composables/useApp'

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
  createTo: string | undefined
  order: number
}

const fireux = useFireUXConfig()
const router = useRouter()
const { app, outcome: appOutcome, pill: toAppCard } = useApp()

const appSnapshot = computed(() =>
  appOutcome.value === 'ready' ? app.value ?? null : null
)
const appCard = computed(() => toAppCard(appSnapshot.value))
const appDisplayName = computed(
  () => appCard.value?.displayName || fireux.appName
)

const humanize = (value: unknown, fallback: string) => {
  const text = String(value ?? '').trim()
  if (!text) return fallback
  return text
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
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

const adminFacts = computed(() => {
  const current = appSnapshot.value
  if (!current) return []

  return [
    {
      label: 'Status',
      value: humanize(current.status, 'Not set'),
      detail: 'Current app lifecycle.',
      icon: 'i-lucide-activity',
    },
    {
      label: 'App role',
      value: humanize(current.role || fireux.role, 'Not set'),
      detail: 'How this app serves its users.',
      icon: 'i-lucide-panels-top-left',
    },
    {
      label: 'Membership',
      value: current.self_join_enabled ? 'Self-join enabled' : 'Admin controlled',
      detail: current.self_join_enabled
        ? 'People can set up their own access.'
        : 'Admins control access to this app.',
      icon: 'i-lucide-users-round',
    },
    {
      label: 'Extra tools',
      value: adminTools.value.length ? String(adminTools.value.length) : 'None',
      detail: adminTools.value.length
        ? 'Configured admin surfaces.'
        : 'No additional surfaces enabled.',
      icon: 'i-lucide-wand-sparkles',
    },
  ]
})
</script>
