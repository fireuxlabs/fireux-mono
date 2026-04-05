<template>
  <UDashboardPanel id="console-projects-ecosystem">
    <template #header>
      <LayoutsConsoleNavbar title="Project Ecosystem" />
    </template>

    <template #body>
      <section class="space-y-6">
        <UAlert
          v-if="!runtime.id"
          color="neutral"
          variant="soft"
          title="No project selected"
          description="Select a project on /console/projects before viewing the project ecosystem."
          :actions="[
            {
              label: 'Go to projects',
              to: '/console/projects',
              icon: 'i-lucide-arrow-right',
            },
          ]"
        />

        <template v-else>
          <UCard>
            <template #header>
              <div class="flex flex-wrap items-center justify-between gap-3">
                <div class="space-y-1">
                  <div class="text-sm font-semibold">Ecosystem Context</div>
                  <p class="text-sm text-dimmed">
                    High-level view of the ecosystem around this demo project.
                  </p>
                </div>

                <UBadge color="neutral" variant="soft">
                  {{ modeLabel }} Mode
                </UBadge>
              </div>
            </template>

            <div class="space-y-3">
              <p class="text-sm text-dimmed">
                {{ introCopy }}
              </p>

              <div class="flex flex-wrap gap-2">
                <UBadge color="neutral" variant="soft">
                  {{ ecosystemRows.length }} ecosystem{{ ecosystemRows.length === 1 ? '' : 's' }}
                </UBadge>
                <UBadge color="neutral" variant="soft">
                  {{ totalAppCount }} app{{ totalAppCount === 1 ? '' : 's' }}
                </UBadge>
              </div>

              <UButton
                to="/ecosystems"
                icon="i-lucide-orbit"
                variant="ghost"
                color="neutral"
              >
                Open public index
              </UButton>
            </div>
          </UCard>

          <UAlert
            v-if="!ecosystemRows.length"
            color="neutral"
            variant="soft"
            :title="emptyTitle"
            :description="emptyDescription"
          />

          <UCard
            v-for="ecosystem in ecosystemRows"
            :key="ecosystem.id"
          >
            <template #header>
              <div class="flex items-start justify-between gap-3">
                <div class="space-y-1">
                  <div class="text-sm font-semibold">{{ ecosystem.name }}</div>
                  <p v-if="ecosystem.description" class="text-sm text-dimmed">
                    {{ ecosystem.description }}
                  </p>
                </div>
                <UBadge variant="soft">{{ ecosystem.appCount }} app{{ ecosystem.appCount === 1 ? '' : 's' }}</UBadge>
              </div>
            </template>

            <div class="space-y-3">
              <div class="space-y-1">
                <div class="text-xs uppercase tracking-[0.16em] text-toned">Focus</div>
                <div class="text-sm font-medium">{{ ecosystem.teamLabel }}</div>
              </div>

              <div class="space-y-2">
                <div class="text-xs uppercase tracking-[0.16em] text-toned">Connected Apps</div>

                <div v-if="ecosystem.appLabels.length" class="flex flex-wrap gap-2">
                  <UBadge
                    v-for="app in ecosystem.appLabels"
                    :key="app"
                    color="neutral"
                    variant="soft"
                  >
                    {{ app }}
                  </UBadge>
                </div>

                <p v-else class="text-sm text-dimmed">
                  No apps listed yet.
                </p>
              </div>
            </div>
          </UCard>
        </template>
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRuntimeProjectSelection } from '~/composables/console/project/state'
import { useRuntimeProject } from '~/composables/console/project/useRuntimeProject'

definePageMeta({
  layout: 'console',
  nav: {
    visibility: { ecosystems: ['fireux'] },
    key: 'console-projects-ecosystem',
    label: 'Ecosystem',
    icon: 'i-lucide-orbit',
    order: 20,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})

const runtime = useRuntimeProject()
const projectSelection = useRuntimeProjectSelection()

const normalizeString = (value: unknown): string => String(value || '').trim()
const labelize = (value: unknown): string =>
  normalizeString(value)
    .split(/[-_]+/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(' ')

const appNameById = computed(() =>
  new Map(
    (runtime.scenario.value?.apps ?? [])
      .map((entry) => {
        const id = normalizeString((entry as any).id)
        const name =
          normalizeString((entry as any).app_name) ||
          normalizeString((entry as any).app_short_name) ||
          labelize(id)

        return [id, name] as const
      })
      .filter(([id]) => Boolean(id))
  )
)

const ecosystemRows = computed(() =>
  (runtime.scenario.value?.ecosystems ?? []).map((entry) => {
    const id = normalizeString((entry as any).id)
    const name = normalizeString((entry as any).name) || id || 'Untitled ecosystem'
    const team = normalizeString((entry as any).team)
    const rawApps = Array.isArray((entry as any).apps) ? (entry as any).apps : []
    const description = normalizeString((entry as any).description)

    return {
      id,
      name,
      description,
      teamLabel: labelize(team) || 'Unassigned',
      appCount: rawApps.length,
      appLabels: rawApps
        .map((app) => {
          const appId = normalizeString(app)
          return appNameById.value.get(appId) || labelize(appId)
        })
        .filter(Boolean),
    }
  })
)

const totalAppCount = computed(() =>
  ecosystemRows.value.reduce((sum, ecosystem) => sum + ecosystem.appCount, 0)
)

const modeLabel = computed(() => {
  if (projectSelection.mode.value === 'live') return 'Real'
  if (projectSelection.mode.value === 'test') return 'Test'
  return 'Demo'
})

const introCopy = computed(() => {
  if (projectSelection.mode.value === 'live') {
    return 'Real project ecosystem data is still being aligned, so this area currently stays focused on the demo-friendly project shape.'
  }
  if (projectSelection.mode.value === 'test') {
    return 'Test project ecosystem data is still being aligned, so this area currently stays focused on the demo-friendly project shape.'
  }

  const projectName = normalizeString(runtime.project.value?.name) || 'This project'
  return `${projectName} currently spans ${ecosystemRows.value.length} ecosystem${ecosystemRows.value.length === 1 ? '' : 's'} and ${totalAppCount.value} connected app${totalAppCount.value === 1 ? '' : 's'}.`
})

const emptyTitle = computed(() => {
  if (projectSelection.mode.value === 'live') return 'Real ecosystem view is not wired yet'
  if (projectSelection.mode.value === 'test') return 'Test ecosystem view is not wired yet'
  return 'No ecosystem context found'
})

const emptyDescription = computed(() => {
  if (projectSelection.mode.value === 'live') {
    return 'We still need to align real project ecosystem data for this workspace.'
  }
  if (projectSelection.mode.value === 'test') {
    return 'We still need to align test project ecosystem data for this workspace.'
  }
  return 'This demo project does not currently define any ecosystem context.'
})
</script>
