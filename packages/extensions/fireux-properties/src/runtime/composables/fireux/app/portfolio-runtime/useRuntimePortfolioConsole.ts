import { computed } from 'vue'
import { createScopeConsole } from 'fireux-core/runtime/composables/fireux/app/console/createScopeConsole'
import { useNav } from 'fireux-core/runtime/composables/fireux/app/ui/nav/useNav'
import { useRuntimePortfolio } from './useRuntimePortfolio'

export function useRuntimePortfolioConsole() {
  const runtime = useRuntimePortfolio()
  const nav = useNav(['granite-console'])

  const surfaceLinks = computed(() => [
    { key: 'properties', label: 'Properties', icon: 'i-lucide-building', to: '/console/portfolio/properties' },
    { key: 'clients', label: 'Clients', icon: 'i-lucide-users', to: '/console/portfolio/clients' },
    { key: 'finance', label: 'Financial Signals', icon: 'i-lucide-chart-line', to: '/console/portfolio/finance' },
    { key: 'compliance', label: 'Compliance Exposure', icon: 'i-lucide-shield-alert', to: '/console/portfolio/compliance' },
    { key: 'incidents', label: 'Incidents', icon: 'i-lucide-triangle-alert', to: '/console/portfolio/incidents' },
    { key: 'documents', label: 'Documents', icon: 'i-lucide-file-text', to: '/console/portfolio/documents' },
    { key: 'tasks', label: 'Tasks', icon: 'i-lucide-list-checks', to: '/console/portfolio/tasks' },
  ])

  const actions = {
    openOverviewTo: '/console/portfolio/overview',
    openPropertiesTo: '/console/portfolio/properties',
    openClientsTo: '/console/portfolio/clients',
    openFinanceTo: '/console/portfolio/finance',
  } as const

  const stats = computed(() => ({
    hasRuntimeId: Boolean(String(runtime.id.value || '').trim()),
    isReady: runtime.isReady.value,
  }))

  return createScopeConsole({
    runtime,
    navItems: nav.items,
    stats,
    actions,
    extra: {
      portfolio: runtime,
      surfaceLinks,
    },
  })
}
