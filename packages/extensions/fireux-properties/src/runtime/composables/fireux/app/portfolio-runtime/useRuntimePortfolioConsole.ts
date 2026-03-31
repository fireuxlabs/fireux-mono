import { usePortfolioComplianceRecordCollection } from 'fireux-compliance/runtime/composables/fireux/firestore/compliance/fetch/usePortfolioComplianceRecordCollection'
import { createScopeConsole } from 'fireux-core/runtime/composables/fireux/app/console/createScopeConsole'
import { useRuntimeConsoleBase } from 'fireux-core/runtime/composables/fireux/app/console/useRuntimeConsoleBase'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useConsoleEntryState } from 'fireux-core/runtime/composables/fireux/app/ui/useConsoleEntryState'
import { useNav } from 'fireux-core/runtime/composables/fireux/app/ui/nav/useNav'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'
import { usePortfolioDocumentLinkCollection } from 'fireux-documents/runtime/composables/fireux/firestore/documents/fetch/usePortfolioDocumentLinkCollection'
import { usePortfolioTaskCollection } from 'fireux-tasks/runtime/composables/fireux/firestore/tasks/fetch/usePortfolioTaskCollection'
import { computed, shallowRef, watch, type Ref, type ShallowRef } from 'vue'
import type { DocumentLink } from 'fireux-documents/runtime/models/document-link.model'
import type { Task } from 'fireux-tasks/runtime/models/task.model'
import type { ComplianceRecord } from 'fireux-compliance/runtime/models/compliance-record.model'
import { usePortfolioPropertyCollection } from '../../firestore/property/fetch/usePortfolioPropertyCollection'
import { usePortfolioInterface } from '../../firestore/portfolio/utils/view/usePortfolioInterface'
import { getReadOnlyPortfolioScenarios } from './read-only-scenarios'
import { useRuntimePortfolio } from './useRuntimePortfolio'
import { useRuntimePortfolioSelection } from './state'
import type { Property } from '../../../models/property.model'
import type { ConsolePortfolio, Portfolio } from '../../../models/portfolio.model'

type OwnedPortfolioChildRefs = {
  properties: Ref<Property[] | undefined>
  complianceRecords: Ref<ComplianceRecord[] | undefined>
  documentLinks: Ref<DocumentLink[] | undefined>
  tasks: Ref<Task[] | undefined>
}

/**
 * Canon portfolio console shell.
 * Wraps the console seam with nav, stats, and overview surface data.
 */
export function useRuntimePortfolioConsole() {
  const runtime = useRuntimePortfolio()
  const nav = useNav(['console'])
  const { appId } = useFireUXConfig()
  const { uid } = useConsoleEntryState()
  const { canOwnMultipleConsoles } = useUser()
  const { setRuntimePortfolio } = useRuntimePortfolioSelection()
  const { firestoreFetchCollection } = useFirestoreRead()
  const { pill } = usePortfolioInterface()
  const portfolioSource = firestoreFetchCollection<Portfolio>('portfolios')
  const portfolioOverlays = appId
    ? firestoreFetchCollection<ConsolePortfolio>(`apps/${appId}/portfolios`)
    : null
  const { collection: properties } = usePortfolioPropertyCollection(runtime)
  const { collection: complianceRecords } = usePortfolioComplianceRecordCollection(runtime)
  const { collection: documentLinks } = usePortfolioDocumentLinkCollection(runtime)
  const { collection: tasks } = usePortfolioTaskCollection(runtime)
  const ownedChildRefs = shallowRef<Record<string, OwnedPortfolioChildRefs>>({}) as
    ShallowRef<Record<string, OwnedPortfolioChildRefs>>

  const accessiblePortfolioIds = computed(() => {
    const currentUid = String(uid.value || '').trim()
    if (!currentUid) return new Set<string>()

    const ids = new Set<string>()

    for (const overlay of portfolioOverlays?.value ?? []) {
      const id = String((overlay as any)?.id || '').trim()
      if (!id) continue
      if ((overlay as any)?.console_enabled === false) continue

      const adminIds = Array.isArray((overlay as any)?.admin_ids)
        ? (overlay as any).admin_ids
            .map((value: unknown) => String(value || '').trim())
            .filter(Boolean)
        : []

      if (adminIds.includes(currentUid)) {
        ids.add(id)
      }
    }

    return ids
  })

  const ownedPortfolios = computed(() =>
    (portfolioSource.value ?? []).filter((entry) =>
      accessiblePortfolioIds.value.has(String((entry as any)?.id || '').trim())
    )
  )

  const ownedPortfolioPills = computed(() =>
    ownedPortfolios.value
      .map((entry) => pill(entry))
      .filter((entry): entry is NonNullable<ReturnType<typeof pill>> => Boolean(entry))
  )
  const readOnlyScenarios = computed(() => getReadOnlyPortfolioScenarios())
  const readOnlyPortfolioPills = computed(() =>
    readOnlyScenarios.value
      .map((entry) =>
        pill({
          ...entry.portfolio,
          id: entry.id,
        } as Portfolio)
      )
      .filter((entry): entry is NonNullable<ReturnType<typeof pill>> => Boolean(entry))
  )

  watch(
    ownedPortfolios,
    (nextPortfolios) => {
      if (!appId) return

      const nextRefs = { ...ownedChildRefs.value }

      for (const entry of nextPortfolios) {
        const id = String((entry as any)?.id || '').trim()
        if (!id || nextRefs[id]) continue

        nextRefs[id] = {
          properties: firestoreFetchCollection<Property>(`apps/${appId}/portfolios/${id}/properties`),
          complianceRecords: firestoreFetchCollection<ComplianceRecord>(`apps/${appId}/portfolios/${id}/compliance-records`),
          documentLinks: firestoreFetchCollection<DocumentLink>(`apps/${appId}/portfolios/${id}/document-links`),
          tasks: firestoreFetchCollection<Task>(`apps/${appId}/portfolios/${id}/tasks`),
        }
      }

      ownedChildRefs.value = nextRefs
    },
    { immediate: true }
  )

  const selection = useRuntimeConsoleBase({
    runtime,
    owned: ownedPortfolios,
    readOnly: readOnlyScenarios,
    canOwnMultiple: canOwnMultipleConsoles,
    ownedId: (entry) => String((entry as any)?.id || '').trim(),
    readOnlyId: (entry) => String(entry.id || '').trim(),
    ownedItem: (entry) => entry,
    readOnlyItem: (entry) => entry.portfolio ?? null,
  })

  const hasActivePortfolio = selection.hasActiveItem
  const activePortfolio = selection.activeItem

  const activePortfolioPill = computed(() =>
    activePortfolio.value ? pill(activePortfolio.value) : null
  )
  const canSelectMultipleLive = selection.canSelectMultipleLive
  const canSelectMultipleReadOnly = selection.canSelectMultipleReadOnly
  const showSelector = selection.showSelector

  const ownershipPending = computed(
    () =>
      portfolioSource.value === undefined ||
      (Boolean(appId) && portfolioOverlays?.value === undefined)
  )

  const operatorPending = computed(() =>
    ownedPortfolios.value.some((entry) => {
      const id = String((entry as any)?.id || '').trim()
      const refs = ownedChildRefs.value[id]
      if (!refs) return true
      return (
        refs.properties.value === undefined ||
        refs.complianceRecords.value === undefined ||
        refs.documentLinks.value === undefined ||
        refs.tasks.value === undefined
      )
    })
  )

  const liveOperatorStats = computed(() => {
    const portfolioIds = ownedPortfolios.value.map((entry) =>
      String((entry as any)?.id || '').trim()
    )

    const totalProperties = portfolioIds.reduce(
      (sum, id) => sum + (ownedChildRefs.value[id]?.properties.value?.length ?? 0),
      0
    )
    const totalComplianceRecords = portfolioIds.reduce(
      (sum, id) => sum + (ownedChildRefs.value[id]?.complianceRecords.value?.length ?? 0),
      0
    )
    const totalDocumentLinks = portfolioIds.reduce(
      (sum, id) => sum + (ownedChildRefs.value[id]?.documentLinks.value?.length ?? 0),
      0
    )
    const totalOpenTasks = portfolioIds.reduce((sum, id) => {
      const collection = ownedChildRefs.value[id]?.tasks.value ?? []
      return sum + collection.filter((task) => String(task.status || '') !== 'done').length
    }, 0)

    return {
      portfolios: ownedPortfolios.value.length,
      properties: totalProperties,
      complianceRecords: totalComplianceRecords,
      documentLinks: totalDocumentLinks,
      openTasks: totalOpenTasks,
    }
  })
  const readOnlyOperatorStats = computed(() => ({
    portfolios: readOnlyScenarios.value.length,
    properties: readOnlyScenarios.value.reduce(
      (sum, entry) => sum + (entry.properties?.length ?? 0),
      0
    ),
    complianceRecords: readOnlyScenarios.value.reduce(
      (sum, entry) => sum + (entry.complianceRecords?.length ?? 0),
      0
    ),
    documentLinks: readOnlyScenarios.value.reduce(
      (sum, entry) => sum + (entry.documentLinks?.length ?? 0),
      0
    ),
    openTasks: readOnlyScenarios.value.reduce(
      (sum, entry) =>
        sum + (entry.tasks ?? []).filter((task) => String(task.status || '') !== 'done').length,
      0
    ),
  }))

  const isOperatorOverview = selection.isOperatorOverview

  const stats = computed(() => ({
    portfolios: isOperatorOverview.value
      ? (runtime.isReadOnly.value ? readOnlyOperatorStats.value.portfolios : liveOperatorStats.value.portfolios)
      : 1,
    properties: isOperatorOverview.value
      ? (runtime.isReadOnly.value ? readOnlyOperatorStats.value.properties : liveOperatorStats.value.properties)
      : properties.value.length,
    complianceRecords: isOperatorOverview.value
      ? (runtime.isReadOnly.value
          ? readOnlyOperatorStats.value.complianceRecords
          : liveOperatorStats.value.complianceRecords)
      : complianceRecords.value.length,
    documentLinks: isOperatorOverview.value
      ? (runtime.isReadOnly.value
          ? readOnlyOperatorStats.value.documentLinks
          : liveOperatorStats.value.documentLinks)
      : documentLinks.value.length,
    openTasks: isOperatorOverview.value
      ? (runtime.isReadOnly.value
          ? readOnlyOperatorStats.value.openTasks
          : liveOperatorStats.value.openTasks)
      : tasks.value.filter((task) => String(task.status || '') !== 'done').length,
  }))

  const overview = computed(() =>
    isOperatorOverview.value
      ? [
          { key: 'portfolios', label: 'Portfolios', count: stats.value.portfolios },
          { key: 'properties', label: 'Properties', count: stats.value.properties },
          { key: 'compliance', label: 'Compliance records', count: stats.value.complianceRecords },
          { key: 'documents', label: 'Document links', count: stats.value.documentLinks },
          { key: 'tasks', label: 'Open tasks', count: stats.value.openTasks },
        ]
      : [
          { key: 'properties', label: 'Properties', count: stats.value.properties },
          { key: 'compliance', label: 'Compliance records', count: stats.value.complianceRecords },
          { key: 'documents', label: 'Document links', count: stats.value.documentLinks },
          { key: 'tasks', label: 'Open tasks', count: stats.value.openTasks },
        ]
  )

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

  const setActiveOwnedPortfolio = (portfolioId: string) => {
    const resolvedId = String(portfolioId || '').trim()
    if (!resolvedId) return
    setRuntimePortfolio({
      portfolioId: resolvedId,
      mode: runtime.isReadOnly.value ? 'read-only' : 'live',
    })
  }

  return createScopeConsole({
    runtime,
    navItems: nav.items,
    stats,
    actions,
    extra: {
      portfolio: runtime,
      overview,
      surfaceLinks,
      ownedPortfolios,
      ownedPortfolioPills,
      readOnlyScenarios,
      readOnlyPortfolioPills,
      activePortfolio,
      activePortfolioPill,
      hasActivePortfolio,
      canOwnMultipleConsoles,
      canSelectMultipleLive,
      canSelectMultipleReadOnly,
      showSelector,
      isOperatorOverview,
      ownershipPending,
      operatorPending,
      setActiveOwnedPortfolio,
    },
  })
}
