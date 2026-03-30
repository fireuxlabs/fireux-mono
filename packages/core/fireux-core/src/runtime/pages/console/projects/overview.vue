<template>
  <UDashboardPanel id="console-projects-home">
    <template #header>
      <LayoutsConsoleNavbar title="FireUX Project Console" />
    </template>

    <template #body>
      <section class="space-y-8">
        <div class="text-xs text-dimmed">
          <template v-if="isOperatorOverview">
            Scope:
            <span class="font-medium">
              {{ runtime.isReadOnly ? 'All read-only projects' : 'All owned projects' }}
            </span>
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
              {{ isOperatorOverview ? 'All owned projects' : 'Project runtime' }}
            </div>
          </template>

          <div
            v-if="isOperatorOverview"
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
              <div class="text-xs text-dimmed">Project ID</div>
              <div class="text-sm font-mono break-all">{{ runtime.id }}</div>
            </div>
            <div class="rounded border border-default p-3">
              <div class="text-xs text-dimmed">Collection path</div>
              <div class="text-sm font-mono">{{ runtime.collectionPath }}</div>
            </div>
            <div class="rounded border border-default p-3">
              <div class="text-xs text-dimmed">Ecosystems</div>
              <div class="text-sm font-semibold">{{ stats.ecosystems }}</div>
            </div>
            <div class="rounded border border-default p-3">
              <div class="text-xs text-dimmed">Apps</div>
              <div class="text-sm font-semibold">{{ stats.apps }}</div>
            </div>
          </div>
        </UCard>

        <UCard v-if="isOperatorOverview">
          <template #header>
            <div class="text-sm font-semibold">
              {{ runtime.isReadOnly ? 'Read-only projects' : 'Owned projects' }}
            </div>
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

            <p class="text-sm text-dimmed">
              Overview totals above include all {{ runtime.isReadOnly ? 'read-only' : 'owned' }} projects. Select one here when you want Ecosystems or Apps routes to work against a specific project.
            </p>

            <UAlert
              v-if="!hasActiveProject"
              color="neutral"
              variant="soft"
              title="Select a project for workspace routes"
              :description="`Choose one ${runtime.isReadOnly ? 'read-only' : 'owned'} project above before opening deeper console routes.`"
            />
            <UAlert
              v-else-if="activeProjectPill"
              color="primary"
              variant="soft"
              title="Active project selected"
              :description="`${activeProjectPill.title}${activeProjectPill.subtitle ? ` · ${activeProjectPill.subtitle}` : ''}`"
            />
          </div>
        </UCard>

        <UCard>
          <template #header>
            <div class="text-sm font-semibold">Quick actions</div>
          </template>

          <UAlert
            v-if="isOperatorOverview && !hasActiveProject"
            color="neutral"
            variant="soft"
            title="Pick an active project first"
            :description="`The overview is showing all ${runtime.isReadOnly ? 'read-only' : 'owned'} projects. Select one above to enable Ecosystems and Apps routes.`"
          />

          <div v-else class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <UButton
              v-for="entry in workspaceNavItems"
              :key="entry.key"
              :to="entry.to"
              variant="soft"
              :icon="entry.icon"
              block
            >
              {{ entry.label }}
            </UButton>
          </div>
        </UCard>

        <UAlert
          v-if="isDev"
          color="neutral"
          variant="soft"
          title="Project debug"
          :description="`Project exists: ${hasProject ? 'yes' : 'no'}`"
        />

        <DevJson
          v-if="isDev"
          title="Project Runtime (JSON)"
          context="console/projects/overview · runtime snapshot"
          :data="runtimeSnapshot"
          :default-open="true"
        />
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { navigateTo } from '#imports'
import { computed } from 'vue'
import { useConsoleOverviewEntry } from '../../../composables/fireux/app/ui/useConsoleOverviewEntry'
import { useRuntimeProjectConsole } from '../../../composables/fireux/app/runtime-project/useRuntimeProjectConsole'
import ProjectCardsPill from '../../../components/organisms/Project/Cards/Pill.vue'

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
const isDev = import.meta.dev
const hasProject = computed(() => Boolean(String(runtime.id.value || '').trim()))
const availableProjectPills = computed(() =>
  runtime.isReadOnly.value ? readOnlyProjectPills.value : ownedProjectPills.value
)
const workspaceNavItems = computed(() =>
  navItems.value.filter((entry) => entry.key !== 'create' && entry.key !== 'overview')
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
  stats: stats.value,
  overview: overview.value,
  navItems: toDebugValue(navItems.value),
  hasProject: hasProject.value,
  ownedProjects: toDebugValue(ownedProjects.value),
  readOnlyScenarios: toDebugValue(readOnlyScenarios.value),
  isOperatorOverview: isOperatorOverview.value,
  hasActiveProject: hasActiveProject.value,
}))
</script>
