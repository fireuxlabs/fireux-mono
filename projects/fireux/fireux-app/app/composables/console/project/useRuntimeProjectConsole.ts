import { computed } from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useRuntimeConsole } from 'fireux-core/runtime/composables/fireux/runtime/useRuntimeConsole'
import {
  useProjectInterface,
  type ProjectInterfaceInput,
} from 'fireux-core/runtime/composables/fireux/firestore/system/project/utils/view/useProjectInterface'
import { useProjectCollection } from 'fireux-core/runtime/composables/fireux/firestore/system/project/fetch/useProjectCollection'
import {
  useEcosystemInterface,
  type EcosystemInterfaceCard,
} from 'fireux-core/runtime/composables/fireux/firestore/system/ecosystem/utils/view/useEcosystemInterface'
import type { Project } from 'fireux-core/runtime/models/system/project.model'
import { useRuntimeProjectSelection } from './state'
import { getDemoProjectScenarios } from './demo-scenarios'
import { useRuntimeProject } from './useRuntimeProject'

type UseRuntimeProjectConsoleOptions = {
  publishHeader?: boolean
}

export type FireuxConsoleEcosystem = {
  id: string
  name: string
  slug: string
  description: string
  image_url?: string
  team: string
  status: string
  apps: string[]
}

export type FireuxConsolePayload = {
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

export type ProjectConsoleEcosystemRow = {
  id: string
  slug: string
  name: string
  imageUrl: string
  description: string
  status?: string
  team: string
  appCount: number
  appLabels: string[]
}

export type ProjectConsoleDatabaseRow = {
  name: string
  appCount: number
}

export type ProjectConsoleEcosystemSummary = {
  id: string
  mainAppId: string
  mainEcosystemId: string
}

export type ProjectConsoleEcosystemView = {
  item: ProjectConsoleEcosystemRow
  card: EcosystemInterfaceCard
}

const normalizeString = (value: unknown): string => String(value || '').trim()
const labelize = (value: unknown): string =>
  normalizeString(value)
    .split(/[-_]+/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(' ')
const stripTestProjectSuffix = (value: unknown): string =>
  normalizeString(value)
    .replace(/\s+test project$/i, '')
    .trim()
const deriveEcosystemTeam = (value: unknown): string => {
  const raw = normalizeString(value)
  if (!raw) return ''
  return normalizeString(raw.split('-')[0])
}

function createProjectEcosystemState(runtime: ReturnType<typeof useRuntimeProject>) {
  const { interface: toEcosystemCard } = useEcosystemInterface()

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
    () => `${runtime.id.value}:${resolveConsoleEndpoint()}`
  )

  const {
    data: liveData,
    pending,
    error: liveError,
    refresh,
  } = useAsyncData(
    'console-project-ecosystem',
    async () => {
      if (!runtime.id.value) return null

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

    for (const app of liveData.value?.ecosystem_apps ?? []) {
      map.set(
        normalizeString(app.id),
        normalizeString(app.name) || labelize(app.slug || app.id)
      )
    }

    for (const database of liveData.value?.databases ?? []) {
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

    for (const app of liveData.value?.ecosystem_apps ?? []) {
      const ecosystemId = normalizeString(app.ecosystem_id)
      const appId = normalizeString(app.id)

      if (!ecosystemId || !appId) continue

      const current = map.get(ecosystemId) ?? []
      current.push(appId)
      map.set(ecosystemId, current)
    }

    return map
  })

  const ecosystemRows = computed<ProjectConsoleEcosystemRow[]>(() => {
    const liveRows = (liveData.value?.ecosystems ?? []).map((entry) => ({
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
      normalizeString(liveData.value?.project?.main_ecosystem_id) ||
      normalizeString(liveData.value?.project_meta?.ecosystem_id) ||
      normalizeString((runtime.project.value as any)?.ecosystem_id)

    if (!fallbackId) return []

    const fallbackApps = liveEcosystemAppsById.value.get(fallbackId) ?? []

    return [
      {
        id: fallbackId,
        slug:
          normalizeString(liveData.value?.project_meta?.slug) ||
          normalizeString((runtime.project.value as any)?.slug) ||
          fallbackId,
        name:
          normalizeString(liveData.value?.project_meta?.name) ||
          normalizeString((runtime.project.value as any)?.name) ||
          labelize(fallbackId) ||
          'Untitled ecosystem',
        imageUrl:
          normalizeString(liveData.value?.project_meta?.image_url) ||
          normalizeString((runtime.project.value as any)?.image_url),
        description:
          normalizeString(liveData.value?.project_meta?.description) ||
          normalizeString((runtime.project.value as any)?.description),
        status: normalizeString((runtime.project.value as any)?.status) || 'active',
        team: deriveEcosystemTeam(fallbackId),
        appCount: fallbackApps.length,
        appLabels: fallbackApps
          .map((appId) => liveAppNameById.value.get(normalizeString(appId)) || labelize(appId))
          .filter(Boolean),
      },
    ]
  })

  const totalAppCount = computed(() =>
    ecosystemRows.value.reduce((sum, ecosystem) => sum + ecosystem.appCount, 0)
  )

  const databaseRows = computed<ProjectConsoleDatabaseRow[]>(() =>
    (liveData.value?.databases ?? []).map((database) => ({
      name: normalizeString(database.name) || '(unnamed)',
      appCount: Array.isArray(database.apps) ? database.apps.length : 0,
    }))
  )

  const projectSummary = computed<ProjectConsoleEcosystemSummary>(() => ({
    id: normalizeString(liveData.value?.project?.id),
    mainAppId: normalizeString(liveData.value?.project?.main_app_id),
    mainEcosystemId: normalizeString(liveData.value?.project?.main_ecosystem_id),
  }))

  const ecosystemViews = computed<ProjectConsoleEcosystemView[]>(() =>
    ecosystemRows.value.map((item) => ({
      item,
      card:
        toEcosystemCard({
          id: item.id,
          slug: item.slug,
          name: item.name,
          description: item.description,
          status: item.status,
          team: item.team,
          appCount: item.appCount,
          apps: item.appLabels,
          src: item.imageUrl,
        }) ?? {
          id: item.id,
          to: '',
          imageUrl: item.imageUrl,
          avatarText: item.name || item.slug || item.id,
          title: item.name,
          subtitle: item.slug,
          meta: [item.team ? `team: ${item.team}` : '', `apps: ${item.appCount}`]
            .filter(Boolean)
            .join(' · '),
          badges: [
            item.status || 'active',
            `${item.appCount} app${item.appCount === 1 ? '' : 's'}`,
          ],
        },
    }))
  )

  const resolvedError = computed(() => normalizeString(liveError.value?.message))

  const debugData = computed(() => ({
    mode: runtime.mode.value,
    runtimeProjectId: runtime.id.value,
    project: runtime.project.value,
    consoleEndpoint: resolveConsoleEndpoint(),
    livePayload: liveData.value,
    liveError: resolvedError.value,
    ecosystemRows: ecosystemRows.value,
    databaseRows: databaseRows.value,
    totalAppCount: totalAppCount.value,
    projectSummary: projectSummary.value,
  }))

  return {
    runtime,
    pending,
    refresh,
    resolvedError,
    ecosystemRows,
    ecosystemViews,
    databaseRows,
    totalAppCount,
    projectSummary,
    debugData,
  }
}

/**
 * Root project console inputs.
 */
export function useRuntimeProjectConsole(
  options: UseRuntimeProjectConsoleOptions = {}
) {
  const runtime = useRuntimeProject()
  const projectSelection = useRuntimeProjectSelection()
  const { currentUser: authUser, uid } = useAuth()
  const { projects: liveProjects } = useProjectCollection('projects')
  const { projects: testProjects } = useProjectCollection('test-projects')
  const { interface: toProjectCard } = useProjectInterface()
  const scenarios = computed(getDemoProjectScenarios)
  const selectedMode = projectSelection.mode

  type ProjectPill = NonNullable<ReturnType<typeof toProjectCard>>

  const buildProjectPill = (
    target?: Project | null,
    imageUrl?: unknown,
    id?: unknown
  ): ProjectPill | null => {
    const pill = toProjectCard({
      ...(target ?? {}),
      id: normalizeString(id) || normalizeString(target?.id),
    } as Project)

    if (!pill) return null

    return {
      ...pill,
      imageUrl: normalizeString(imageUrl) || pill.imageUrl,
      title:
        selectedMode.value === 'test'
          ? normalizeString(authUser.value?.displayName) ||
            stripTestProjectSuffix(target?.name) ||
            'Your'
          : pill.title,
      subtitle: selectedMode.value === 'test' ? 'Test Project' : pill.subtitle,
    }
  }

  const demoProjects = computed<ProjectInterfaceInput[]>(() =>
    scenarios.value.map((entry) => ({
      ...(entry.project ?? {}),
      id: entry.id,
      image_url: entry.image_url,
    }))
  )

  const availableProjects = computed<ProjectInterfaceInput[]>(() => {
    if (selectedMode.value === 'live') {
      return liveProjects.value as ProjectInterfaceInput[]
    }

    if (selectedMode.value === 'test') {
      const currentUid = normalizeString(uid.value)
      if (!currentUid) return []

      return testProjects.value.filter(
        (entry) =>
          normalizeString((entry as Record<string, unknown>)?.id) === currentUid
      ) as ProjectInterfaceInput[]
    }

    return demoProjects.value
  })

  const availableProjectPills = computed(() =>
    availableProjects.value
      .map((entry) =>
        buildProjectPill(entry as Project, entry.image_url, entry.id)
      )
      .filter((entry): entry is ProjectPill => Boolean(entry))
  )

  const activeProjectPill = computed(
    () =>
      availableProjectPills.value.find(
        (item) => item.id === runtime.id.value
      ) ??
      buildProjectPill(
        runtime.project.value as Project | null,
        runtime.scenario.value?.image_url,
        runtime.id.value
      )
  )

  const headerData = computed(() =>
    activeProjectPill.value
      ? {
          imageUrl: activeProjectPill.value.imageUrl,
          title: activeProjectPill.value.title,
          subtitle: activeProjectPill.value.subtitle,
        }
      : null
  )

  const console = useRuntimeConsole({
    family: 'projects',
    selectedId: runtime.id,
    mode: selectedMode,
    setMode: (mode) => {
      projectSelection.setRuntimeProject({ mode })
    },
    clearSelection: () => {
      projectSelection.setRuntimeProject({
        selectedId: '',
        mode: selectedMode.value,
      })
    },
    header: headerData,
    publishHeader: options.publishHeader,
  })

  let ecosystemState: ReturnType<typeof createProjectEcosystemState> | null = null

  return {
    runtime,
    projects: liveProjects,
    scenarios,
    activeProjectPill,
    headerData,
    console,
    get ecosystem() {
      if (!ecosystemState) {
        ecosystemState = createProjectEcosystemState(runtime)
      }
      return ecosystemState
    },
  }
}
