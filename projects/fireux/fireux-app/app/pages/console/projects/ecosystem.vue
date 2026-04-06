<template>
  <UDashboardPanel id="console-projects-ecosystem">
    <template #header>
      <LayoutsConsoleNavbar title="Project Ecosystems" />
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

        <ConsoleProjectEcosystem
          v-else
          :is-live="isLiveMode"
          :pending="pending"
          :error="resolvedError"
          :mode-label="modeLabel"
          :intro-copy="introCopy"
          :empty-title="emptyTitle"
          :empty-description="emptyDescription"
          :ecosystem-rows="ecosystemRows"
          :database-rows="databaseRows"
          :total-app-count="totalAppCount"
          :project-summary="projectSummary"
          :debug-data="debugData"
          @refresh="refresh()"
        />
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
    label: 'Ecosystems',
    icon: 'i-lucide-orbit',
    order: 20,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})

type FireuxConsoleEcosystem = {
  id: string
  name: string
  slug: string
  description: string
  image_url?: string
  team: string
  status: string
  apps: string[]
}

type FireuxConsolePayload = {
  project: {
    id: string
    main_app_id: string
    main_ecosystem_id: string
  }
  project_meta?: {
    name?: string
    slug?: string
    description?: string
    image_url?: string
    ecosystem_id?: string
  }
  ecosystem_apps?: Array<{
    id: string
    name: string
    slug: string
    ecosystem_id: string
  }>
  ecosystems?: FireuxConsoleEcosystem[]
  databases: Array<{
    name: string
    apps: Array<{
      id: string
      name: string
      slug: string
    }>
  }>
}

const runtime = useRuntimeProject()
const projectSelection = useRuntimeProjectSelection()
const isLiveMode = computed(() => runtime.mode.value === 'live')

const normalizeString = (value: unknown): string => String(value || '').trim()
const labelize = (value: unknown): string =>
  normalizeString(value)
    .split(/[-_]+/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(' ')
const deriveEcosystemTeam = (value: unknown): string => {
  const raw = normalizeString(value)
  if (!raw) return ''
  return normalizeString(raw.split('-')[0])
}

const resolveConsoleEndpoint = () => {
  const raw =
    normalizeString((runtime.project.value as any)?.console_endpoint_url) ||
    normalizeString((runtime.project.value as any)?.source_url)

  if (!raw) return ''

  try {
    const url = new URL(raw)
    if (url.pathname === '' || url.pathname === '/') {
      url.pathname = '/api/fireux-console'
    }
    return url.toString()
  } catch {
    return ''
  }
}

const endpointKey = computed(
  () => `${runtime.mode.value}:${runtime.id.value}:${resolveConsoleEndpoint()}`
)

const {
  data: liveEcosystemData,
  pending,
  error: liveEcosystemError,
  refresh,
} = await useAsyncData(
  'console-project-ecosystem',
  async () => {
    if (!isLiveMode.value) return null

    const consoleEndpoint = resolveConsoleEndpoint()
    if (!consoleEndpoint) {
      throw new Error('Project console endpoint is missing')
    }

    return await $fetch<FireuxConsolePayload>(consoleEndpoint)
  },
  {
    server: false,
    default: () => null,
    watch: [endpointKey],
  }
)

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

const liveAppNameById = computed(() => {
  const map = new Map<string, string>()

  for (const app of liveEcosystemData.value?.ecosystem_apps ?? []) {
    map.set(
      normalizeString(app.id),
      normalizeString(app.name) || labelize(app.slug || app.id)
    )
  }

  for (const database of liveEcosystemData.value?.databases ?? []) {
    for (const app of database.apps ?? []) {
      map.set(
        normalizeString(app.id),
        normalizeString(app.name) || labelize(app.slug || app.id)
      )
    }
  }

  return map
})

const liveEcosystemAppsById = computed(() => {
  const map = new Map<string, string[]>()

  for (const app of liveEcosystemData.value?.ecosystem_apps ?? []) {
    const ecosystemId = normalizeString(app.ecosystem_id)
    const appId = normalizeString(app.id)

    if (!ecosystemId || !appId) continue

    const current = map.get(ecosystemId) ?? []
    current.push(appId)
    map.set(ecosystemId, current)
  }

  return map
})

const ecosystemRows = computed(() => {
  if (isLiveMode.value) {
    const liveRows = (liveEcosystemData.value?.ecosystems ?? []).map((entry) => ({
      id: normalizeString(entry.id),
      slug: normalizeString(entry.slug),
      name:
        normalizeString(entry.name) ||
        labelize(entry.slug || entry.id) ||
        'Untitled ecosystem',
      imageUrl: normalizeString(entry.image_url),
      description: normalizeString(entry.description),
      status: normalizeString(entry.status) || 'active',
      team: normalizeString(entry.team),
      appCount: Array.isArray(entry.apps) ? entry.apps.length : 0,
      appLabels: (entry.apps ?? [])
        .map((appId) => liveAppNameById.value.get(normalizeString(appId)) || labelize(appId))
        .filter(Boolean),
    }))

    if (liveRows.length) return liveRows

    const fallbackId =
      normalizeString(liveEcosystemData.value?.project?.main_ecosystem_id) ||
      normalizeString(liveEcosystemData.value?.project_meta?.ecosystem_id) ||
      normalizeString((runtime.project.value as any)?.ecosystem_id)

    if (!fallbackId) return []

    const fallbackApps = liveEcosystemAppsById.value.get(fallbackId) ?? []

    return [
      {
        id: fallbackId,
        slug:
          normalizeString(liveEcosystemData.value?.project_meta?.slug) ||
          normalizeString((runtime.project.value as any)?.slug) ||
          fallbackId,
        name:
          normalizeString(liveEcosystemData.value?.project_meta?.name) ||
          normalizeString((runtime.project.value as any)?.name) ||
          labelize(fallbackId) ||
          'Untitled ecosystem',
        imageUrl:
          normalizeString(liveEcosystemData.value?.project_meta?.image_url) ||
          normalizeString((runtime.project.value as any)?.image_url),
        description:
          normalizeString(liveEcosystemData.value?.project_meta?.description) ||
          normalizeString((runtime.project.value as any)?.description),
        status: normalizeString((runtime.project.value as any)?.status) || 'active',
        team: deriveEcosystemTeam(fallbackId),
        appCount: fallbackApps.length,
        appLabels: fallbackApps
          .map((appId) => liveAppNameById.value.get(normalizeString(appId)) || labelize(appId))
          .filter(Boolean),
      },
    ]
  }

  return (runtime.scenario.value?.ecosystems ?? []).map((entry) => {
    const id = normalizeString((entry as any).id)
    const name = normalizeString((entry as any).name) || id || 'Untitled ecosystem'
    const team = normalizeString((entry as any).team)
    const rawApps = Array.isArray((entry as any).apps) ? (entry as any).apps : []
    const description = normalizeString((entry as any).description)

    return {
      id,
      slug: normalizeString((entry as any).slug),
      name,
      imageUrl:
        normalizeString((entry as any).image_url) ||
        normalizeString((entry as any).src),
      description,
      status: normalizeString((entry as any).status) || 'active',
      team,
      appCount: rawApps.length,
      appLabels: rawApps
        .map((app) => {
          const appId = normalizeString(app)
          return appNameById.value.get(appId) || labelize(appId)
        })
        .filter(Boolean),
    }
  })
})

const totalAppCount = computed(() =>
  ecosystemRows.value.reduce((sum, ecosystem) => sum + ecosystem.appCount, 0)
)

const databaseRows = computed(() => {
  if (!isLiveMode.value) return []

  return (liveEcosystemData.value?.databases ?? []).map((database) => ({
    name: normalizeString(database.name) || '(unnamed)',
    appCount: Array.isArray(database.apps) ? database.apps.length : 0,
  }))
})

const projectSummary = computed(() => {
  if (!isLiveMode.value || !liveEcosystemData.value) {
    return {
      id: '',
      mainAppId: '',
      mainEcosystemId: '',
    }
  }

  return {
    id: normalizeString(liveEcosystemData.value.project?.id),
    mainAppId: normalizeString(liveEcosystemData.value.project?.main_app_id),
    mainEcosystemId: normalizeString(liveEcosystemData.value.project?.main_ecosystem_id),
  }
})

const modeLabel = computed(() => {
  if (projectSelection.mode.value === 'live') return 'Real'
  if (projectSelection.mode.value === 'test') return 'Test'
  return 'Demo'
})

const introCopy = computed(() => {
  if (isLiveMode.value) return ''
  if (projectSelection.mode.value === 'test') {
    return 'Test project ecosystem data is still being aligned, so this area currently stays focused on the demo-friendly project shape.'
  }

  const projectName = normalizeString(runtime.project.value?.name) || 'This project'
  return `${projectName} currently spans ${ecosystemRows.value.length} ecosystem${ecosystemRows.value.length === 1 ? '' : 's'} and ${totalAppCount.value} connected app${totalAppCount.value === 1 ? '' : 's'}.`
})

const emptyTitle = computed(() => {
  if (isLiveMode.value) return 'No ecosystem context found'
  if (projectSelection.mode.value === 'test') return 'Test ecosystem view is not wired yet'
  return 'No ecosystem context found'
})

const emptyDescription = computed(() => {
  if (isLiveMode.value) return ''
  if (projectSelection.mode.value === 'test') {
    return 'We still need to align test project ecosystem data for this workspace.'
  }
  return 'This demo project does not currently define any ecosystem context.'
})

const resolvedError = computed(() =>
  isLiveMode.value ? normalizeString(liveEcosystemError.value?.message) : ''
)

const debugData = computed(() => ({
  mode: runtime.mode.value,
  runtimeProjectId: runtime.id.value,
  project: runtime.project.value,
  consoleEndpoint: resolveConsoleEndpoint(),
  livePayload: liveEcosystemData.value,
  liveError: resolvedError.value,
  ecosystemRows: ecosystemRows.value,
  databaseRows: databaseRows.value,
  totalAppCount: totalAppCount.value,
  projectSummary: projectSummary.value,
}))
</script>
