<template>
  <UDashboardPanel id="console-projects-home">
    <template #header>
      <LayoutsConsoleNavbar title="FireUX Project Console" />
    </template>

    <template #body>
      <section class="space-y-8">
        <div class="text-xs text-dimmed">
          <template v-if="showAggregateOverview">
            Scope:
            <span class="font-medium">{{ scopeLabel }}</span>
            <template v-if="activeProject">
              · Active project:
              <span class="font-mono">{{ activeProject.id }}</span>
            </template>
          </template>
          <template v-else>
            Mode: <span class="font-medium">{{ runtime.mode }}</span>
            · Project: <span class="font-mono">{{ runtime.id }}</span>
          </template>
        </div>

        <UCard>
          <template #header>
            <div class="text-sm font-semibold">
              {{ showAggregateOverview ? scopeLabel : singleOverviewTitle }}
            </div>
          </template>

          <div
            v-if="showAggregateOverview"
            class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
          >
            <div
              v-for="item in overview"
              :key="item.key"
              class="rounded border border-default p-3"
            >
              <div class="text-xs text-dimmed">{{ item.label }}</div>
              <div class="text-lg font-semibold">{{ item.count }}</div>
            </div>
          </div>

          <div v-else class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div class="rounded border border-default p-3">
              <div class="text-xs text-dimmed">Project</div>
              <div class="text-sm font-semibold">
                {{ activeProjectPill?.title || runtime.name || runtime.id }}
              </div>
              <div v-if="activeProjectPill?.subtitle" class="text-xs text-dimmed">
                {{ activeProjectPill.subtitle }}
              </div>
            </div>

            <div class="rounded border border-default p-3">
              <div class="text-xs text-dimmed">Project ID</div>
              <div class="text-sm font-mono break-all">{{ runtime.id }}</div>
            </div>

            <div class="rounded border border-default p-3">
              <div class="text-xs text-dimmed">Ecosystems</div>
              <div class="text-lg font-semibold">{{ stats.ecosystems }}</div>
            </div>

            <div class="rounded border border-default p-3">
              <div class="text-xs text-dimmed">Apps</div>
              <div class="text-lg font-semibold">{{ stats.apps }}</div>
            </div>
          </div>
        </UCard>

        <UCard v-if="showProjectSelector">
          <template #header>
            <div class="text-sm font-semibold">{{ targetListTitle }}</div>
          </template>

          <div class="space-y-3">
            <div v-if="availableProjectPills.length" class="space-y-2">
              <ProjectCardsPill
                v-for="item in availableProjectPills"
                :key="item.id"
                :to="''"
                :image-url="item.imageUrl"
                :title="item.title"
                :subtitle="item.subtitle"
                :badges="item.badges"
                :action="true"
                :show-badges="false"
                class="cursor-pointer"
                @action="selectProject(item.id)"
              />
            </div>

            <p class="text-sm text-dimmed">{{ selectionHelpText }}</p>

            <UAlert
              v-if="!hasActiveProject"
              color="neutral"
              variant="soft"
              :title="selectionTitle"
              :description="selectionDescription"
            />
            <UAlert
              v-else-if="activeProjectPill"
              color="primary"
              variant="soft"
              :title="activeSelectionTitle"
              :description="`${activeProjectPill.title}${activeProjectPill.subtitle ? ` · ${activeProjectPill.subtitle}` : ''}`"
            />
          </div>
        </UCard>

        <UCard>
          <template #header>
            <div class="text-sm font-semibold">Quick actions</div>
          </template>

          <UAlert
            v-if="!hasActiveProject"
            color="neutral"
            variant="soft"
            :title="quickActionsTitle"
            :description="quickActionsDescription"
          />

          <div v-else class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <UButton
              v-for="link in actionLinks"
              :key="link.key"
              :to="link.to"
              variant="soft"
              :icon="link.icon"
              block
            >
              {{ link.label }}
            </UButton>
          </div>
        </UCard>

        <DevJson
          v-if="isDev"
          title="Project Runtime (JSON)"
          context="projects/fireux/fireux-app · /console/projects/overview"
          :data="runtimeSnapshot"
          :default-open="false"
        />
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useConsoleOverviewEntry } from 'fireux-core/runtime/composables/fireux/app/ui/useConsoleOverviewEntry'
import { useConsoleOverviewLabels } from 'fireux-core/runtime/composables/fireux/app/ui/useConsoleOverviewLabels'
import { useRuntimeProjectConsole } from 'fireux-core/runtime/composables/fireux/app/runtime-project/useRuntimeProjectConsole'
import ProjectCardsPill from 'fireux-core/runtime/components/organisms/Project/Cards/Pill.vue'

definePageMeta({
  layout: 'console',
  nav: {
    key: 'console-projects-overview',
    label: 'Overview',
    icon: 'i-lucide-layout-dashboard',
    order: 10,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})

const {
  runtime,
  navItems,
  overview,
  stats,
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
} = useRuntimeProjectConsole()

const {
  scopeLabel,
  targetListTitle,
  selectionTitle,
  selectionDescription,
  selectionHelp,
  activeSelectionTitle,
  quickActionsTitle,
  quickActionsDescription,
  singleOverviewTitle,
} = useConsoleOverviewLabels({
  singular: 'project',
  plural: 'projects',
  isReadOnly: computed(() => runtime.isReadOnly.value),
})

const isDev = import.meta.dev
const availableProjectPills = computed(() =>
  runtime.isReadOnly.value ? readOnlyProjectPills.value : ownedProjectPills.value
)
const showScopedOverview = computed(() => hasActiveProject.value)
const showAggregateOverview = computed(() => !showScopedOverview.value)
const showProjectSelector = computed(() => availableProjectPills.value.length > 1)
const actionLinks = computed(() =>
  navItems.value.filter((entry) => entry.key !== 'create' && entry.key !== 'overview')
)
const selectionHelpText = computed(() =>
  hasActiveProject.value
    ? `The rest of the console is now running against ${runtime.id.value}. Pick another ${runtime.isReadOnly.value ? 'read-only' : 'owned'} project here any time to switch the active runtime.`
    : selectionHelp.value
)

const { ensureOverviewEntry } = useConsoleOverviewEntry({
  runtimeId: runtime.id,
  mode: computed(() => runtime.mode.value),
  ownershipPending,
  liveCount: computed(() => ownedProjects.value.length),
  readOnlyCount: computed(() => readOnlyScenarios.value.length),
  singleLiveId: computed(() => String(ownedProjects.value[0]?.id || '')),
  singleReadOnlyId: computed(() => String(readOnlyScenarios.value[0]?.id || '')),
  setActiveTarget: setActiveOwnedProject,
  createPath: '/console/projects/create',
  overviewPath: '/console/projects/overview',
})

await ensureOverviewEntry()

const selectProject = (projectId: string) => {
  setActiveOwnedProject(projectId)
}

const toDebugValue = (value: unknown, seen = new WeakSet<object>()): unknown => {
  if (value === null || value === undefined) return value
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return value
  if (typeof value === 'bigint') return String(value)
  if (typeof value === 'function') return '[Function]'
  if (typeof value !== 'object') return String(value)

  if (value instanceof Date) return value.toISOString()
  if (Array.isArray(value)) return value.map((entry) => toDebugValue(entry, seen))

  if (seen.has(value)) return '[Circular]'
  seen.add(value)

  const record = value as Record<string, unknown>
  const output: Record<string, unknown> = {}

  for (const [key, entry] of Object.entries(record)) {
    output[key] = toDebugValue(entry, seen)
  }

  return output
}

const runtimeSnapshot = computed(() => ({
  id: runtime.id.value,
  mode: runtime.mode.value,
  isReadOnly: runtime.isReadOnly.value,
  documentCollectionPath: runtime.documentCollectionPath.value,
  collectionPath: runtime.collectionPath.value,
  pending: runtime.pending.value,
  isLoading: runtime.isLoading.value,
  isReady: runtime.isReady.value,
  doc: toDebugValue(runtime.doc.value),
  data: {
    name: runtime.name.value,
    ecosystem: runtime.ecosystem.value,
    appId: runtime.appId.value,
    appName: runtime.appName.value,
    firebaseProjectId: runtime.firebaseProjectId.value,
    hasDoc: runtime.hasDoc.value,
    readOnlyScenario: toDebugValue(runtime.readOnlyScenario.value),
  },
  overview: overview.value,
  actionLinks: toDebugValue(actionLinks.value),
  ownedProjects: toDebugValue(ownedProjects.value),
  readOnlyScenarios: toDebugValue(readOnlyScenarios.value),
  isOperatorOverview: isOperatorOverview.value,
  showScopedOverview: showScopedOverview.value,
  showAggregateOverview: showAggregateOverview.value,
  showProjectSelector: showProjectSelector.value,
  hasActiveProject: hasActiveProject.value,
}))
</script>
