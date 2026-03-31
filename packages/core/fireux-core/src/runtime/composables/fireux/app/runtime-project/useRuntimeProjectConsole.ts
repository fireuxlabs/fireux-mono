import { computed, ref, watch } from 'vue'
import { createScopeConsole } from '../console/createScopeConsole'
import { useFireUXConfig } from '../FireUXConfig'
import { useAppCollection } from '../../firestore/core/app/fetch/useAppCollection'
import { useEcosystemCollection } from '../../firestore/system/ecosystem/fetch/useEcosystemCollection'
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

export function useRuntimeProjectConsole() {
  const runtime = useRuntimeProject()
  const { appId } = useFireUXConfig()
  const appCollectionPath = computed(() =>
    runtime.mode.value === 'live' ? 'apps' : 'test-apps'
  )
  const ecosystemCollectionPath = computed(() =>
    runtime.mode.value === 'live' ? 'ecosystems' : 'test-ecosystems'
  )
  const { apps } = useAppCollection(appCollectionPath)
  const { ecosystems } = useEcosystemCollection(ecosystemCollectionPath)
  const projectId = computed(() => normalizeString(runtime.id.value))
  const readOnlyScenario = computed(() => runtime.readOnlyScenario.value)

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

      if (!nextProjectId || nextMode !== 'live' || !nextEndpointUrl) return

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

  const actions = {
    openCreateTo: '/console/projects/create',
    createEcosystemTo: '/developer/registry',
    createAppTo: '/developer/registry',
    openEcosystemsTo: '/console/projects/ecosystems',
    openAppsTo: '/console/projects/apps',
    openOverviewTo: '/console/projects/overview',
  } as const

  return createScopeConsole({
    runtime,
    actions,
    extra: {
      project: runtime,
      ecosystems,
      apps,
      projectEcosystems,
      projectApps,
      ecosystemRows,
      appRows,
      readOnlyScenario,
      consolePayload,
      consolePending,
      consoleError,
      endpointProjectMeta,
      endpointEcosystemApps,
    },
  })
}
