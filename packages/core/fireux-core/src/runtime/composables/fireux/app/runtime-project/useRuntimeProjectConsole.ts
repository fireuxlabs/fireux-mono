import { computed, ref, watch, type ComputedRef } from 'vue'
import { createScopeConsole } from '../console/createScopeConsole'
import { useFireUXConfig } from '../FireUXConfig'
import { useConsoleEntryState } from '../ui/useConsoleEntryState'
import { useAppCollection } from '../../firestore/core/app/fetch/useAppCollection'
import { useFirestoreRead } from '../../firestore/operations/useFirestoreRead'
import { useEcosystemCollection } from '../../firestore/system/ecosystem/fetch/useEcosystemCollection'
import { useProjectInterface } from '../../firestore/system/project/utils/view/useProjectInterface'
import type { ConsoleProject, Project } from '../../../models/system/project.model'
import { getReadOnlyProjectScenarios } from './read-only-scenarios'
import { useRuntimeProjectSelection } from './state'
import { useRuntimeProject } from './useRuntimeProject'

const normalizeString = (value: unknown): string => String(value || '').trim()

type FireuxConsoleApp = {
  id?: string
  name?: string
  slug?: string
  ecosystem_id?: string
}

type FireuxConsoleProjectMeta = {
  name?: string
  slug?: string
  description?: string
  image_url?: string
  project_type?: string
  source_url?: string
  console_endpoint_url?: string
  app_id?: string
  ecosystem_id?: string
  firebase_project_id?: string
}

type FireuxConsolePayload = {
  ok?: boolean
  project?: {
    id?: string
    main_app_id?: string
    main_ecosystem_id?: string
  }
  project_meta?: FireuxConsoleProjectMeta
  ecosystem_apps?: FireuxConsoleApp[]
  databases?: Array<{
    name?: string
    apps?: FireuxConsoleApp[]
  }>
}

/**
 * Canon project console shell.
 * Wraps the console seam with nav, stats, endpoint payloads, and overview data.
 */
export function useRuntimeProjectConsole() {
  const runtime = useRuntimeProject()
  const { appId } = useFireUXConfig()
  const { uid } = useConsoleEntryState()
  const { setRuntimeProject } = useRuntimeProjectSelection()
  const { firestoreFetchCollection } = useFirestoreRead()
  const { interface: projectInterface } = useProjectInterface()
  const hasProjectSelection = computed(() => Boolean(runtime.id.value))
  const appCollectionPath = computed(() =>
    runtime.mode.value === 'live' ? 'apps' : 'test-apps'
  )
  const ecosystemCollectionPath = computed(() =>
    runtime.mode.value === 'live' ? 'ecosystems' : 'test-ecosystems'
  )
  const { apps } = useAppCollection(appCollectionPath)
  const { ecosystems } = useEcosystemCollection(ecosystemCollectionPath)
  const projectSource = firestoreFetchCollection<Project>('projects')
  const projectOverlays = appId
    ? firestoreFetchCollection<ConsoleProject>(`apps/${appId}/projects`)
    : null
  const projectId = computed(() => normalizeString(runtime.id.value))
  const readOnlyScenario = computed(() => runtime.readOnlyScenario.value)
  const readOnlyScenarios = computed(() => getReadOnlyProjectScenarios())

  const accessibleProjectIds = computed(() => {
    const currentUid = normalizeString(uid.value)
    if (!currentUid) return new Set<string>()

    const ids = new Set<string>()

    for (const overlay of projectOverlays?.value ?? []) {
      const id = normalizeString((overlay as any)?.id)
      if (!id) continue
      if ((overlay as any)?.console_enabled === false) continue

      const adminIds = Array.isArray((overlay as any)?.admin_ids)
        ? (overlay as any).admin_ids
            .map((value: unknown) => normalizeString(value))
            .filter(Boolean)
        : []

      if (adminIds.includes(currentUid)) {
        ids.add(id)
      }
    }

    for (const entry of projectSource.value ?? []) {
      const id = normalizeString((entry as any)?.id)
      const ownerUserId = normalizeString((entry as any)?.owner_user_id)
      if (id && ownerUserId === currentUid) {
        ids.add(id)
      }
    }

    return ids
  })

  const ownedProjects = computed(() =>
    (projectSource.value ?? []).filter((entry) =>
      accessibleProjectIds.value.has(normalizeString((entry as any)?.id))
    )
  )

  const ownedProjectPills = computed(() =>
    ownedProjects.value
      .map((entry) => projectInterface(entry))
      .filter((entry): entry is NonNullable<ReturnType<typeof projectInterface>> => Boolean(entry))
  )

  const readOnlyProjectPills = computed(() =>
    readOnlyScenarios.value
      .map((entry) =>
        projectInterface({
          ...(entry.project ?? {}),
          id: entry.id,
        } as Project)
      )
      .filter((entry): entry is NonNullable<ReturnType<typeof projectInterface>> => Boolean(entry))
  )

  const hasActiveProject = computed(() => {
    const currentId = projectId.value
    if (!currentId) return false
    if (runtime.isReadOnly.value) {
      return readOnlyScenarios.value.some((entry) => normalizeString(entry.id) === currentId)
    }
    return accessibleProjectIds.value.has(currentId)
  })

  const activeProject = computed(() => {
    if (!projectId.value) return null
    if (runtime.isReadOnly.value) {
      return (
        readOnlyScenarios.value.find((entry) => normalizeString(entry.id) === projectId.value)?.project ??
        null
      )
    }
    return (
      ownedProjects.value.find((entry) => normalizeString((entry as any)?.id) === projectId.value) ??
      null
    )
  })

  const activeProjectPill = computed(() =>
    activeProject.value ? projectInterface(activeProject.value as Project) : null
  )

  const isOperatorOverview = computed(
    () =>
      runtime.mode.value !== 'test' &&
      ((runtime.isReadOnly.value && readOnlyScenarios.value.length > 1) ||
        (!runtime.isReadOnly.value && ownedProjects.value.length > 1))
  )

  const ownershipPending = computed(
    () =>
      projectSource.value === undefined ||
      (Boolean(appId) && projectOverlays?.value === undefined)
  )

  const consolePayload = ref<FireuxConsolePayload | null>(null)
  const consolePending = ref(false)
  const consoleError = ref('')

  const consoleEndpointUrl = computed(() =>
    normalizeString((runtime.doc.value as any)?.console_endpoint_url)
  )

  watch(
    [projectId, consoleEndpointUrl, computed(() => runtime.mode.value)],
    async ([nextProjectId, nextEndpointUrl, nextMode]) => {
      consolePayload.value = null
      consoleError.value = ''

      if (!nextProjectId || nextMode !== 'live' || !nextEndpointUrl) {
        return
      }

      consolePending.value = true

      try {
        const response = await fetch(nextEndpointUrl)
        if (!response.ok) {
          throw new Error(`Project endpoint returned ${response.status}`)
        }

        consolePayload.value = (await response.json()) as FireuxConsolePayload
      } catch (error) {
        consoleError.value =
          error instanceof Error ? error.message : 'Unable to read project console endpoint'
      } finally {
        consolePending.value = false
      }
    },
    { immediate: true }
  )

  const endpointProjectMeta = computed(() => consolePayload.value?.project_meta ?? null)
  const endpointEcosystemApps = computed(() => consolePayload.value?.ecosystem_apps ?? [])

  const projectEcosystems = computed(() => {
    if (readOnlyScenario.value?.ecosystems) {
      return readOnlyScenario.value.ecosystems
    }

    const ecosystemId = normalizeString(endpointProjectMeta.value?.ecosystem_id)
    if (ecosystemId) {
      return [
        {
          id: ecosystemId,
          name:
            normalizeString(endpointProjectMeta.value?.name) ||
            normalizeString(endpointProjectMeta.value?.slug) ||
            ecosystemId,
          team: '',
          appCount: endpointEcosystemApps.value.length,
          apps: endpointEcosystemApps.value,
        },
      ]
    }

    return projectId.value
      ? (ecosystems.value ?? []).filter((entry) => {
          const entryProjectId = normalizeString((entry as any).project_id)
          return entryProjectId === projectId.value
        })
      : []
  })

  const projectApps = computed(() => {
    if (readOnlyScenario.value?.apps) {
      return readOnlyScenario.value.apps
    }

    if (endpointEcosystemApps.value.length) {
      return endpointEcosystemApps.value.map((entry) => ({
        id: normalizeString(entry.id),
        app_name: normalizeString(entry.name),
        app_short_name: normalizeString(entry.name),
        slug: normalizeString(entry.slug),
        ecosystem_id: normalizeString(entry.ecosystem_id),
        status: 'active',
      }))
    }

    return projectId.value
      ? (apps.value ?? []).filter((entry) => {
          const entryProjectId = normalizeString((entry as any).project_id)
          return entryProjectId === projectId.value
        })
      : []
  })

  const ecosystemRows = computed(() =>
    projectEcosystems.value.map((entry) => {
      const id = normalizeString((entry as any).id)
      const name = normalizeString((entry as any).name) || id || 'Untitled ecosystem'
      const team = normalizeString((entry as any).team)
      const rawApps = Array.isArray((entry as any).apps)
        ? (entry as any).apps
        : Number.isFinite(Number((entry as any).appCount))
          ? Array.from({ length: Number((entry as any).appCount) })
          : []

      return {
        id,
        name,
        team,
        appCount: rawApps.length,
      }
    })
  )

  const appRows = computed(() =>
    projectApps.value.map((entry) => {
      const id = normalizeString((entry as any).id)
      const name =
        normalizeString((entry as any).app_name) ||
        normalizeString((entry as any).app_short_name) ||
        id ||
        'Untitled app'
      const shortName = normalizeString((entry as any).app_short_name)
      const ecosystemId =
        normalizeString((entry as any).ecosystem_id) ||
        normalizeString((entry as any).ecosystem)
      const status =
        normalizeString((entry as any).status) ||
        normalizeString((entry as any).moderation_state) ||
        'active'

      return {
        id,
        name,
        shortName,
        ecosystemId,
        status,
      }
    })
  )

  const liveOperatorStats = computed(() => {
    const projectIds = new Set(
      ownedProjects.value
        .map((entry) => normalizeString((entry as any)?.id))
        .filter(Boolean)
    )

    const ecosystemCount = (ecosystems.value ?? []).filter((entry) =>
      projectIds.has(normalizeString((entry as any)?.project_id))
    ).length

    const appCount = (apps.value ?? []).filter((entry) =>
      projectIds.has(normalizeString((entry as any)?.project_id))
    ).length

    return {
      projects: ownedProjects.value.length,
      ecosystems: ecosystemCount,
      apps: appCount,
    }
  })

  const readOnlyOperatorStats = computed(() => ({
    projects: readOnlyScenarios.value.length,
    ecosystems: readOnlyScenarios.value.reduce(
      (sum, entry) => sum + (entry.ecosystems?.length ?? 0),
      0
    ),
    apps: readOnlyScenarios.value.reduce((sum, entry) => sum + (entry.apps?.length ?? 0), 0),
  }))

  const stats = computed(() => ({
    projects: isOperatorOverview.value
      ? runtime.isReadOnly.value
        ? readOnlyOperatorStats.value.projects
        : liveOperatorStats.value.projects
      : hasActiveProject.value
        ? 1
        : 0,
    ecosystems: isOperatorOverview.value
      ? runtime.isReadOnly.value
        ? readOnlyOperatorStats.value.ecosystems
        : liveOperatorStats.value.ecosystems
      : projectEcosystems.value.length,
    apps: isOperatorOverview.value
      ? runtime.isReadOnly.value
        ? readOnlyOperatorStats.value.apps
        : liveOperatorStats.value.apps
      : projectApps.value.length,
  }))

  const overview = computed(() =>
    isOperatorOverview.value
      ? [
          { key: 'projects', label: 'Projects', count: stats.value.projects },
          { key: 'ecosystems', label: 'Ecosystems', count: stats.value.ecosystems },
          { key: 'apps', label: 'Apps', count: stats.value.apps },
        ]
      : [
          { key: 'ecosystems', label: 'Ecosystems', count: stats.value.ecosystems },
          { key: 'apps', label: 'Apps', count: stats.value.apps },
        ]
  )

  const navItems: ComputedRef<any[]> = computed(() =>
    hasProjectSelection.value
      ? [
          {
            key: 'create',
            label: 'Create',
            icon: 'i-lucide-plus',
            to: '/console/projects/create',
            order: 15,
            desktop: true,
            mobile: true,
            layouts: ['console'],
          },
          {
            key: 'overview',
            label: 'Overview',
            icon: 'i-lucide-layout-dashboard',
            to: '/console/projects/overview',
            order: 10,
            desktop: true,
            mobile: true,
            layouts: ['console'],
          },
          {
            key: 'ecosystems',
            label: 'Ecosystems',
            icon: 'i-lucide-orbit',
            to: '/console/projects/ecosystems',
            order: 20,
            desktop: true,
            mobile: true,
            layouts: ['console'],
          },
          {
            key: 'apps',
            label: 'Apps',
            icon: 'i-lucide-app-window',
            to: '/console/projects/apps',
            order: 30,
            desktop: true,
            mobile: true,
            layouts: ['console'],
          },
        ]
      : [
          {
            key: 'create',
            label: 'Create',
            icon: 'i-lucide-plus',
            to: '/console/projects/create',
            order: 15,
            desktop: true,
            mobile: true,
            layouts: ['console'],
          },
        ]
  )

  const actions = {
    openCreateTo: '/console/projects/create',
    createEcosystemTo: '/developer/registry',
    createAppTo: '/developer/registry',
    openEcosystemsTo: '/console/projects/ecosystems',
    openAppsTo: '/console/projects/apps',
    openOverviewTo: '/console/projects/overview',
  } as const

  const setActiveOwnedProject = (nextProjectId: string) => {
    const resolvedId = normalizeString(nextProjectId)
    if (!resolvedId) return
    setRuntimeProject({
      projectId: resolvedId,
      mode: runtime.isReadOnly.value ? 'read-only' : 'live',
    })
  }

  return createScopeConsole({
    runtime,
    navItems,
    stats,
    actions,
    extra: {
      project: runtime,
      overview,
      ecosystems,
      apps,
      projectEcosystems,
      projectApps,
      ecosystemRows,
      appRows,
      ownedProjects,
      ownedProjectPills,
      readOnlyScenarios,
      readOnlyProjectPills,
      activeProject,
      activeProjectPill,
      hasActiveProject,
      isOperatorOverview,
      ownershipPending,
      setActiveOwnedProject,
      readOnlyScenario,
      consolePayload,
      consolePending,
      consoleError,
      endpointProjectMeta,
      endpointEcosystemApps,
    },
  })
}
