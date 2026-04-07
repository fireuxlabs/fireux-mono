<template>
  <UPage>
    <UPageHeader
      title="Dev · fireux-properties"
      description="Portfolio model, root collection, and app-overlay storage diagnostics."
    />

    <UPageBody class="pagebody space-y-6">
      <UCard>
        <div class="grid gap-2 md:grid-cols-3 text-sm">
          <div>
            runtimePortfolioId:
            <span class="font-mono">{{ runtimePortfolio.id }}</span>
          </div>
          <div>
            runtimePortfolioCollectionPath:
            <span class="font-mono">{{ runtimePortfolio.collectionPath }}</span>
          </div>
          <div>
            appId:
            <span class="font-mono">{{ resolvedAppId || 'missing' }}</span>
          </div>
        </div>
      </UCard>

      <UCard>
        <DevModel
          :title="'Portfolios · Model'"
          :model="portfolioModelRuntime"
        />
      </UCard>

      <PortfolioCollectionManager
        :collection="portfolios"
        :link="false"
        :description="'Root portfolio collection. Use the storage inspector below for root, overlay, and scoped-child truth.'"
        :dev-json-title="'Root Portfolios (JSON)'"
        :dev-json-context="'dev portfolios · root collection'"
      />

      <UCard>
        <template #header>
          <div class="space-y-3">
            <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Portfolio storage inspector
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              Inspect one portfolio across root, app overlay, and known portfolio-scoped child collections.
            </p>
            <USelect
              v-model="selectedPortfolioId"
              :options="portfolioOptions"
              placeholder="Select a portfolio"
            />
          </div>
        </template>

        <div class="space-y-4">
          <div class="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
            <UBadge variant="soft">
              appId: {{ resolvedAppId || 'missing' }}
            </UBadge>
            <UBadge variant="soft">
              root doc: {{ selectedRootPortfolio ? 'yes' : 'no' }}
            </UBadge>
            <UBadge variant="soft">
              app overlay: {{ selectedPortfolioApp ? 'yes' : 'no' }}
            </UBadge>
            <UBadge variant="soft">
              child families: 8
            </UBadge>
          </div>

          <div
            v-if="migrationSignals.rootOnlyCollections.length"
            class="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900"
          >
            Root-only child data detected:
            {{ migrationSignals.rootOnlyCollections.join(', ') }}.
          </div>

          <div
            v-if="migrationSignals.overlayOnlyCollections.length"
            class="rounded-lg border border-sky-200 bg-sky-50 p-3 text-xs text-sky-900"
          >
            Overlay-only child data detected:
            {{ migrationSignals.overlayOnlyCollections.join(', ') }}.
          </div>

          <div
            v-if="!selectedPortfolioApp && selectedPortfolioId"
            class="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-900"
          >
            No app overlay found at
            <code>{{ overlayPortfolioCollectionPath }}/{{ selectedPortfolioId }}</code>.
          </div>

          <UAlert
            color="neutral"
            variant="soft"
            title="Units are nested under properties"
            description="This inspector compares direct portfolio-owned child families only. Unit drift still needs to be checked under property scope."
          />

          <DevJson
            title="Portfolio storage (JSON)"
            context="dev portfolios · full storage picture"
            :data="portfolioStorageJson"
            :default-open="false"
            :hide-when-empty="false"
          />
        </div>
      </UCard>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import {
  buildDevCollectionSnapshot,
  useDevStorageCollection,
} from 'fireux-core/runtime/composables/dev/useDevStorageCollection'
import { computed, ref, watch } from 'vue'
import PortfolioCollectionManager from '../../components/organisms/Portfolio/Collection/Manager.vue'
import {
  ROOT_PORTFOLIO_COLLECTION_PATH,
  resolvePortfolioConsoleCollectionPath,
  resolveRuntimePortfolioPath,
} from '../../composables/fireux/app/portfolio-console/shared'
import { useActivePortfolio } from '../../composables/fireux/app/portfolio-console/useActivePortfolio'
import { usePortfolioCollection } from '../../composables/fireux/firestore/portfolio/fetch/usePortfolioCollection'
import type { ConsolePortfolio, Portfolio } from '../../models/portfolio.model'
import { PortfolioModel as PortfolioModelRuntime } from '../../models/portfolio.model'

definePageMeta({
  layout: 'dev',
  nav: {
    key: 'dev-fireux-properties',
    label: 'fireux-properties',
    icon: 'i-lucide-building',
    group: 'ext',
    desktop: true,
    layouts: ['dev'],
  },
})

const runtime = useActivePortfolio()
const runtimePortfolio = computed(() => ({
  id: runtime.id.value || null,
  collectionPath: runtime.collectionPath.value || null,
}))

const portfolioModelRuntime = PortfolioModelRuntime
const { appId } = useFireUXConfig()
const resolvedAppId = computed(() => String(appId || '').trim())

const { collection } = usePortfolioCollection()
const portfolios = computed(() => collection.value ?? [])

const overlayPortfolioCollectionPath = computed(() =>
  resolvedAppId.value ? resolvePortfolioConsoleCollectionPath(resolvedAppId.value) : ''
)

const portfolioAppsState = useDevStorageCollection<ConsolePortfolio>(overlayPortfolioCollectionPath)
const portfolioApps = computed(() => portfolioAppsState.items.value)

const rootPortfolioById = computed(() => {
  const map = new Map<string, Portfolio>()
  for (const portfolio of portfolios.value) {
    const id = String(portfolio?.id || '').trim()
    if (!id) continue
    map.set(id, portfolio)
  }
  return map
})

const portfolioAppById = computed(() => {
  const map = new Map<string, ConsolePortfolio>()
  for (const portfolioApp of portfolioApps.value) {
    const id = String(portfolioApp?.id || '').trim()
    if (!id) continue
    map.set(id, portfolioApp)
  }
  return map
})

const selectedPortfolioId = ref('')

const portfolioOptions = computed(() =>
  portfolios.value.map((portfolio) => {
    const id = String(portfolio.id || '').trim()
    const labelBase = portfolio.name || portfolio.slug || id
    const overlayStatus = portfolioAppById.value.has(id) ? 'console' : 'root only'
    return {
      label: `${labelBase} · ${overlayStatus}`,
      value: id,
    }
  })
)

watch(
  portfolioOptions,
  (options) => {
    if (!options.length) {
      selectedPortfolioId.value = ''
      return
    }

    const stillExists = options.some((option) => option.value === selectedPortfolioId.value)
    if (!stillExists) {
      selectedPortfolioId.value = String(options[0]?.value || '')
    }
  },
  { immediate: true }
)

const selectedRootPortfolio = computed(() => rootPortfolioById.value.get(selectedPortfolioId.value) ?? null)
const selectedPortfolioApp = computed(() => portfolioAppById.value.get(selectedPortfolioId.value) ?? null)

const rootPortfolioCollectionPath = computed(() => ROOT_PORTFOLIO_COLLECTION_PATH)

const makePortfolioChildPath = (basePath: string, suffix: string) =>
  resolveRuntimePortfolioPath(basePath, selectedPortfolioId.value, suffix)

const rootProperties = useDevStorageCollection<Record<string, unknown>>(
  computed(() => makePortfolioChildPath(rootPortfolioCollectionPath.value, 'properties'))
)
const overlayProperties = useDevStorageCollection<Record<string, unknown>>(
  computed(() => makePortfolioChildPath(overlayPortfolioCollectionPath.value, 'properties'))
)
const rootClients = useDevStorageCollection<Record<string, unknown>>(
  computed(() => makePortfolioChildPath(rootPortfolioCollectionPath.value, 'clients'))
)
const overlayClients = useDevStorageCollection<Record<string, unknown>>(
  computed(() => makePortfolioChildPath(overlayPortfolioCollectionPath.value, 'clients'))
)
const rootDocuments = useDevStorageCollection<Record<string, unknown>>(
  computed(() => makePortfolioChildPath(rootPortfolioCollectionPath.value, 'documents'))
)
const overlayDocuments = useDevStorageCollection<Record<string, unknown>>(
  computed(() => makePortfolioChildPath(overlayPortfolioCollectionPath.value, 'documents'))
)
const rootDocumentLinks = useDevStorageCollection<Record<string, unknown>>(
  computed(() => makePortfolioChildPath(rootPortfolioCollectionPath.value, 'document-links'))
)
const overlayDocumentLinks = useDevStorageCollection<Record<string, unknown>>(
  computed(() => makePortfolioChildPath(overlayPortfolioCollectionPath.value, 'document-links'))
)
const rootTasks = useDevStorageCollection<Record<string, unknown>>(
  computed(() => makePortfolioChildPath(rootPortfolioCollectionPath.value, 'tasks'))
)
const overlayTasks = useDevStorageCollection<Record<string, unknown>>(
  computed(() => makePortfolioChildPath(overlayPortfolioCollectionPath.value, 'tasks'))
)
const rootFinancials = useDevStorageCollection<Record<string, unknown>>(
  computed(() => makePortfolioChildPath(rootPortfolioCollectionPath.value, 'financials'))
)
const overlayFinancials = useDevStorageCollection<Record<string, unknown>>(
  computed(() => makePortfolioChildPath(overlayPortfolioCollectionPath.value, 'financials'))
)
const rootMaintenance = useDevStorageCollection<Record<string, unknown>>(
  computed(() => makePortfolioChildPath(rootPortfolioCollectionPath.value, 'maintenance'))
)
const overlayMaintenance = useDevStorageCollection<Record<string, unknown>>(
  computed(() => makePortfolioChildPath(overlayPortfolioCollectionPath.value, 'maintenance'))
)
const rootCompliance = useDevStorageCollection<Record<string, unknown>>(
  computed(() => makePortfolioChildPath(rootPortfolioCollectionPath.value, 'compliance-records'))
)
const overlayCompliance = useDevStorageCollection<Record<string, unknown>>(
  computed(() => makePortfolioChildPath(overlayPortfolioCollectionPath.value, 'compliance-records'))
)

const childCollectionsSnapshot = computed(() => ({
  properties: {
    root: buildDevCollectionSnapshot(rootProperties.collectionPath.value, rootProperties.items.value),
    overlay: buildDevCollectionSnapshot(overlayProperties.collectionPath.value, overlayProperties.items.value),
  },
  clients: {
    root: buildDevCollectionSnapshot(rootClients.collectionPath.value, rootClients.items.value),
    overlay: buildDevCollectionSnapshot(overlayClients.collectionPath.value, overlayClients.items.value),
  },
  documents: {
    root: buildDevCollectionSnapshot(rootDocuments.collectionPath.value, rootDocuments.items.value),
    overlay: buildDevCollectionSnapshot(overlayDocuments.collectionPath.value, overlayDocuments.items.value),
  },
  'document-links': {
    root: buildDevCollectionSnapshot(rootDocumentLinks.collectionPath.value, rootDocumentLinks.items.value),
    overlay: buildDevCollectionSnapshot(overlayDocumentLinks.collectionPath.value, overlayDocumentLinks.items.value),
  },
  tasks: {
    root: buildDevCollectionSnapshot(rootTasks.collectionPath.value, rootTasks.items.value),
    overlay: buildDevCollectionSnapshot(overlayTasks.collectionPath.value, overlayTasks.items.value),
  },
  financials: {
    root: buildDevCollectionSnapshot(rootFinancials.collectionPath.value, rootFinancials.items.value),
    overlay: buildDevCollectionSnapshot(overlayFinancials.collectionPath.value, overlayFinancials.items.value),
  },
  maintenance: {
    root: buildDevCollectionSnapshot(rootMaintenance.collectionPath.value, rootMaintenance.items.value),
    overlay: buildDevCollectionSnapshot(overlayMaintenance.collectionPath.value, overlayMaintenance.items.value),
  },
  'compliance-records': {
    root: buildDevCollectionSnapshot(rootCompliance.collectionPath.value, rootCompliance.items.value),
    overlay: buildDevCollectionSnapshot(overlayCompliance.collectionPath.value, overlayCompliance.items.value),
  },
}))

const migrationSignals = computed(() => {
  const rootOnlyCollections: string[] = []
  const overlayOnlyCollections: string[] = []
  const mirroredCollections: string[] = []
  const emptyCollections: string[] = []

  for (const [name, snapshot] of Object.entries(childCollectionsSnapshot.value)) {
    const rootCount = snapshot.root.count
    const overlayCount = snapshot.overlay.count

    if (rootCount > 0 && overlayCount === 0) {
      rootOnlyCollections.push(name)
      continue
    }

    if (overlayCount > 0 && rootCount === 0) {
      overlayOnlyCollections.push(name)
      continue
    }

    if (rootCount > 0 && overlayCount > 0) {
      mirroredCollections.push(name)
      continue
    }

    emptyCollections.push(name)
  }

  return {
    overlayMissing: !selectedPortfolioApp.value,
    rootOnlyCollections,
    overlayOnlyCollections,
    mirroredCollections,
    emptyCollections,
  }
})

const portfolioStorageJson = computed(() => ({
  appId: resolvedAppId.value || null,
  runtimePortfolio: runtimePortfolio.value,
  selectedPortfolioId: selectedPortfolioId.value || null,
  selectedPortfolioName: selectedRootPortfolio.value?.name || selectedRootPortfolio.value?.slug || null,
  paths: {
    rootPortfolioCollection: rootPortfolioCollectionPath.value,
    overlayPortfolioCollection: overlayPortfolioCollectionPath.value || null,
    selectedRootPortfolioDoc: selectedPortfolioId.value
      ? `${rootPortfolioCollectionPath.value}/${selectedPortfolioId.value}`
      : null,
    selectedOverlayPortfolioDoc:
      selectedPortfolioId.value && overlayPortfolioCollectionPath.value
        ? `${overlayPortfolioCollectionPath.value}/${selectedPortfolioId.value}`
        : null,
  },
  rootPortfolio: selectedRootPortfolio.value,
  appPortfolio: selectedPortfolioApp.value,
  migrationSignals: migrationSignals.value,
  childCollections: childCollectionsSnapshot.value,
}))
</script>
