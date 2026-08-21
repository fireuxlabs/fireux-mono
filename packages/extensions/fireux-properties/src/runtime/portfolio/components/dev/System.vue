<template>
  <section class="space-y-6">
    <UCard>
      <div class="grid gap-2 md:grid-cols-3 text-sm">
        <div>
          selectedId:
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
      <DevModel :title="'Portfolios · Model'" :model="portfolioModelRuntime" />
    </UCard>

    <PortfolioCollectionManager />

    <UCard>
      <template #header>
        <div class="space-y-3">
          <p class="text-sm font-semibold text-highlighted">
            Portfolio storage inspector
          </p>
          <p class="text-xs text-muted">
            Inspect one portfolio across its root, App support record, and known
            App-scoped child collections.
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
            App support: {{ selectedPortfolioApp ? 'yes' : 'no' }}
          </UBadge>
          <UBadge variant="soft">
            child families: {{ childCollectionNames.length }}
          </UBadge>
        </div>

        <div
          v-if="migrationSignals.rootOnlyCollections.length"
          class="rounded-lg border border-warning bg-warning/10 p-3 text-xs text-warning"
        >
          Root-only child data detected:
          {{ migrationSignals.rootOnlyCollections.join(', ') }}.
        </div>

        <div
          v-if="migrationSignals.appOnlyCollections.length"
          class="rounded-lg border border-info bg-info/10 p-3 text-xs text-info"
        >
          App-only child data detected:
          {{ migrationSignals.appOnlyCollections.join(', ') }}.
        </div>

        <div
          v-if="!selectedPortfolioApp && selectedPortfolioId"
          class="rounded-lg border border-error bg-error/10 p-3 text-xs text-error"
        >
          No App support record found at
          <code
            >{{ appSupportPortfolioCollectionPath }}/{{
              selectedPortfolioId
            }}</code
          >.
        </div>

        <UAlert
          color="neutral"
          variant="soft"
          title="Units are nested under properties"
          description="This inspector compares direct portfolio-owned child families only. Unit drift still needs to be checked under property scope."
        />

        <DevDebugPanel
          object-origin="fetched"
          launcher
          include-route
          title="Portfolio storage (JSON)"
          context="dev portfolios · full storage picture"
          :objects="portfolioStorageJson"
          :derived="{}"
          :default-open="false"
          :hide-when-empty="false"
        />
      </div>
    </UCard>
  </section>
</template>

<script setup lang="ts">
// Concurrent edit — 2026-07-20 22:12 CEST — Both-Entity Authority — Property: retire the duplicate nested full-Property storage probe.
// Concurrent edit — 2026-07-20 22:24 CEST — Repo Efficiency Pass 5 of 6: expose child inspection without downstream package imports.
// Concurrent edit — 2026-07-20 23:46 CEST — App Support Vocabulary Pass: distinguish Portfolio App support from App-only child data.
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import {
  buildDevCollectionSnapshot,
  useDevStorageCollection,
} from 'fireux-core/runtime/composables/dev/useDevStorageCollection'
import { computed, ref, watch } from 'vue'
import PortfolioCollectionManager from '../Collection/Manager.vue'
import {
  ROOT_PORTFOLIO_COLLECTION_PATH,
  resolvePortfolioWorkspaceCollectionPath,
  resolveRuntimePortfolioPath,
} from '../../composables/workspace/operations/Shared/shared'
import { useActivePortfolio } from '../../composables/workspace/operations/useActivePortfolio'
import { usePortfolioCollection } from '../../composables/firestore/fetch/usePortfolioCollection'
import type { PortfolioSurface } from '../../composables/firestore/utils/view/usePortfolioInterface'
import { ClientStorage } from '../../models/client.model.ts'
import type { AppPortfolio } from '../../models/portfolio.model.ts'
import { PortfolioModel as PortfolioModelRuntime } from '../../models/portfolio.model.ts'

defineOptions({ name: 'DevPortfolioSystem' })

const props = withDefaults(
  defineProps<{
    additionalChildCollections?: string[]
  }>(),
  {
    additionalChildCollections: () => [],
  }
)

const childCollectionNames = [
  ...new Set([
    ClientStorage.collection,
    'financials',
    'maintenance',
    ...props.additionalChildCollections.map((name) =>
      String(name || '').trim()
    ),
  ]),
].filter(Boolean)

const runtime = useActivePortfolio()

const portfolioModelRuntime = PortfolioModelRuntime
const { appId } = useFireUXConfig()
const resolvedAppId = computed(() => String(appId || '').trim())
const appSupportPortfolioCollectionPath = computed(() =>
  resolvedAppId.value
    ? resolvePortfolioWorkspaceCollectionPath(resolvedAppId.value)
    : ''
)
const runtimePortfolio = computed(() => ({
  id: runtime.id.value || null,
  collectionPath: appSupportPortfolioCollectionPath.value || null,
}))

const { portfolios } = usePortfolioCollection()

const portfolioAppsState = useDevStorageCollection<AppPortfolio>(
  appSupportPortfolioCollectionPath
)
const portfolioApps = computed(() => portfolioAppsState.items.value)

const rootPortfolioById = computed(() => {
  const map = new Map<string, PortfolioSurface>()
  for (const portfolio of portfolios.value) {
    const id = String(portfolio?.id || '').trim()
    if (!id) continue
    map.set(id, portfolio)
  }
  return map
})

const portfolioAppById = computed(() => {
  const map = new Map<string, AppPortfolio>()
  for (const portfolioApp of portfolioApps.value) {
    const id = String(portfolioApp?.id || '').trim()
    if (!id) continue
    map.set(id, portfolioApp)
  }
  return map
})

const selectedPortfolioId = ref('')

const portfolioOptions = computed<{ label: string; value: string }[]>(() =>
  portfolios.value.map((portfolio) => {
    const id = String(portfolio.id || '').trim()
    const labelBase = portfolio.name || id
    const appSupportStatus = portfolioAppById.value.has(id)
      ? 'workspace'
      : 'root only'
    return {
      label: `${labelBase} · ${appSupportStatus}`,
      value: id,
    }
  })
)

watch(
  portfolioOptions,
  (options: { label: string; value: string }[]) => {
    if (!options.length) {
      selectedPortfolioId.value = ''
      return
    }

    const stillExists = options.some(
      (option) => option.value === selectedPortfolioId.value
    )
    if (!stillExists) {
      selectedPortfolioId.value = String(options[0]?.value || '')
    }
  },
  { immediate: true }
)

const selectedRootPortfolio = computed(
  () => rootPortfolioById.value.get(selectedPortfolioId.value) ?? null
)
const selectedPortfolioApp = computed(
  () => portfolioAppById.value.get(selectedPortfolioId.value) ?? null
)

const rootPortfolioCollectionPath = computed(
  () => ROOT_PORTFOLIO_COLLECTION_PATH
)

const makePortfolioChildPath = (basePath: string, suffix: string) =>
  resolveRuntimePortfolioPath(basePath, selectedPortfolioId.value, suffix)

const childCollectionReaders = childCollectionNames.map((name) => ({
  name,
  root: useDevStorageCollection<Record<string, unknown>>(
    computed(() =>
      makePortfolioChildPath(rootPortfolioCollectionPath.value, name)
    )
  ),
  app: useDevStorageCollection<Record<string, unknown>>(
    computed(() =>
      makePortfolioChildPath(appSupportPortfolioCollectionPath.value, name)
    )
  ),
}))

const childCollectionsSnapshot = computed(() =>
  Object.fromEntries(
    childCollectionReaders.map(({ name, root, app }) => [
      name,
      {
        root: buildDevCollectionSnapshot(
          root.collectionPath.value,
          root.items.value
        ),
        app: buildDevCollectionSnapshot(
          app.collectionPath.value,
          app.items.value
        ),
      },
    ])
  )
)

const migrationSignals = computed(() => {
  const rootOnlyCollections: string[] = []
  const appOnlyCollections: string[] = []
  const mirroredCollections: string[] = []
  const emptyCollections: string[] = []

  for (const [name, snapshot] of Object.entries(
    childCollectionsSnapshot.value
  )) {
    const rootCount = snapshot.root.count
    const appCount = snapshot.app.count

    if (rootCount > 0 && appCount === 0) {
      rootOnlyCollections.push(name)
      continue
    }

    if (appCount > 0 && rootCount === 0) {
      appOnlyCollections.push(name)
      continue
    }

    if (rootCount > 0 && appCount > 0) {
      mirroredCollections.push(name)
      continue
    }

    emptyCollections.push(name)
  }

  return {
    appSupportMissing: !selectedPortfolioApp.value,
    rootOnlyCollections,
    appOnlyCollections,
    mirroredCollections,
    emptyCollections,
  }
})

const portfolioStorageJson = computed(() => ({
  appId: resolvedAppId.value || null,
  runtimePortfolio: runtimePortfolio.value,
  selectedPortfolioId: selectedPortfolioId.value || null,
  selectedPortfolioName:
    selectedRootPortfolio.value?.name ||
    selectedRootPortfolio.value?.id ||
    null,
  paths: {
    rootPortfolioCollection: rootPortfolioCollectionPath.value,
    appSupportPortfolioCollection:
      appSupportPortfolioCollectionPath.value || null,
    selectedRootPortfolioDoc: selectedPortfolioId.value
      ? `${rootPortfolioCollectionPath.value}/${selectedPortfolioId.value}`
      : null,
    selectedAppSupportPortfolioDoc:
      selectedPortfolioId.value && appSupportPortfolioCollectionPath.value
        ? `${appSupportPortfolioCollectionPath.value}/${selectedPortfolioId.value}`
        : null,
  },
  rootPortfolio: selectedRootPortfolio.value,
  appPortfolio: selectedPortfolioApp.value,
  migrationSignals: migrationSignals.value,
  childCollections: childCollectionsSnapshot.value,
}))
</script>
