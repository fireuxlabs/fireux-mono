import { computed } from 'vue'
import { createScopeConsole } from 'fireux-core/runtime/composables/fireux/app/console/createScopeConsole'
import { useNav } from 'fireux-core/runtime/composables/fireux/app/ui/nav/useNav'
import { usePortfolioComplianceRecordCollection } from 'fireux-compliance/runtime/composables/fireux/firestore/compliance/fetch/usePortfolioComplianceRecordCollection'
import { usePortfolioDocumentLinkCollection } from 'fireux-documents/runtime/composables/fireux/firestore/documents/fetch/usePortfolioDocumentLinkCollection'
import { usePortfolioTaskCollection } from 'fireux-tasks/runtime/composables/fireux/firestore/tasks/fetch/usePortfolioTaskCollection'
import { usePortfolioPropertyCollection } from '../../firestore/property/fetch/usePortfolioPropertyCollection'
import { useRuntimePortfolio } from './useRuntimePortfolio'

export function useRuntimePortfolioConsole() {
  const runtime = useRuntimePortfolio()
  const nav = useNav(['console'])
  const { collection: properties } = usePortfolioPropertyCollection(runtime)
  const { collection: complianceRecords } = usePortfolioComplianceRecordCollection(runtime)
  const { collection: documentLinks } = usePortfolioDocumentLinkCollection(runtime)
  const { collection: tasks } = usePortfolioTaskCollection(runtime)

  const stats = computed(() => ({
    properties: properties.value.length,
    complianceRecords: complianceRecords.value.length,
    documentLinks: documentLinks.value.length,
    openTasks: tasks.value.filter((task) => String(task.status || '') !== 'done').length,
  }))

  const overview = computed(() => [
    { key: 'properties', label: 'Properties', count: stats.value.properties },
    { key: 'compliance', label: 'Compliance records', count: stats.value.complianceRecords },
    { key: 'documents', label: 'Document links', count: stats.value.documentLinks },
    { key: 'tasks', label: 'Open tasks', count: stats.value.openTasks },
  ])

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

  return createScopeConsole({
    runtime,
    navItems: nav.items,
    stats,
    actions,
    extra: {
      portfolio: runtime,
      overview,
      surfaceLinks,
    },
  })
}
