import { computed } from 'vue'
import { useAppCollection } from '../../firestore/core/app/fetch/useAppCollection'
import { useEcosystemCollection } from '../../firestore/system/ecosystem/fetch/useEcosystemCollection'
import { useRuntimeProject } from './useRuntimeProject'

const normalizeString = (value: unknown): string => String(value || '').trim()

export function useRuntimeProjectConsole() {
  const projectRuntime = useRuntimeProject()
  const { apps, count: appCount } = useAppCollection()
  const { ecosystems, count: ecosystemCount } = useEcosystemCollection()

  const ecosystemRows = computed(() =>
    (ecosystems.value ?? []).map((entry) => {
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
    (apps.value ?? []).map((entry) => {
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
    ecosystems: ecosystemCount.value,
    apps: appCount.value,
  }))

  const navItems = computed(() => [
    {
      key: 'overview',
      label: 'Overview',
      icon: 'i-lucide-layout-dashboard',
      to: '/console/project/overview',
    },
    {
      key: 'ecosystems',
      label: 'Ecosystems',
      icon: 'i-lucide-orbit',
      to: '/console/project/ecosystems',
    },
    {
      key: 'apps',
      label: 'Apps',
      icon: 'i-lucide-app-window',
      to: '/console/project/apps',
    },
  ] as const)

  const actions = {
    createEcosystemTo: '/developer/registry',
    createAppTo: '/developer/registry',
    openEcosystemsTo: '/console/project/ecosystems',
    openAppsTo: '/console/project/apps',
  } as const

  return {
    project: projectRuntime,
    ecosystems,
    apps,
    ecosystemRows,
    appRows,
    navItems,
    stats,
    actions,
  }
}
