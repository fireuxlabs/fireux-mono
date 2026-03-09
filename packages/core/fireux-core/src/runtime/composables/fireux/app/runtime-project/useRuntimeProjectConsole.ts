import { computed } from 'vue'
import { createScopeConsole } from '../console/createScopeConsole'
import { useAppCollection } from '../../firestore/core/app/fetch/useAppCollection'
import { useEcosystemCollection } from '../../firestore/system/ecosystem/fetch/useEcosystemCollection'
import { useRuntimeProject } from './useRuntimeProject'

const normalizeString = (value: unknown): string => String(value || '').trim()

export function useRuntimeProjectConsole() {
  const projectRuntime = useRuntimeProject()
  const { apps } = useAppCollection()
  const { ecosystems } = useEcosystemCollection()
  const projectId = computed(() => normalizeString(projectRuntime.id.value))

  const projectEcosystems = computed(() =>
    (ecosystems.value ?? []).filter((entry) => {
      const entryProjectId = normalizeString((entry as any).project_id)
      return !entryProjectId || entryProjectId === projectId.value
    })
  )

  const projectApps = computed(() =>
    (apps.value ?? []).filter((entry) => {
      const entryProjectId = normalizeString((entry as any).project_id)
      return !entryProjectId || entryProjectId === projectId.value
    })
  )

  const ecosystemRows = computed(() =>
    projectEcosystems.value.map((entry) => {
      const id = normalizeString((entry as any).id)
      const name = normalizeString((entry as any).name) || id || 'Untitled ecosystem'
      const team = normalizeString((entry as any).team)
      const rawApps = Array.isArray((entry as any).apps) ? (entry as any).apps : []

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

  const stats = computed(() => ({
    ecosystems: projectEcosystems.value.length,
    apps: projectApps.value.length,
  }))

  const navItems = computed(() => [
    {
      key: 'overview',
      label: 'Overview',
      icon: 'i-lucide-layout-dashboard',
      to: '/console/projects/overview',
    },
    {
      key: 'ecosystems',
      label: 'Ecosystems',
      icon: 'i-lucide-orbit',
      to: '/console/projects/ecosystems',
    },
    {
      key: 'apps',
      label: 'Apps',
      icon: 'i-lucide-app-window',
      to: '/console/projects/apps',
    },
  ] as const)

  const actions = {
    createEcosystemTo: '/developer/registry',
    createAppTo: '/developer/registry',
    openEcosystemsTo: '/console/projects/ecosystems',
    openAppsTo: '/console/projects/apps',
  } as const

  return createScopeConsole({
    runtime: projectRuntime,
    navItems,
    stats,
    actions,
    extra: {
      project: projectRuntime,
      ecosystems,
      apps,
      projectEcosystems,
      projectApps,
      ecosystemRows,
      appRows,
    },
  })
}
