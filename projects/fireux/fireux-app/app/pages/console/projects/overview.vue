<template>
  <UDashboardPanel id="console-projects-home">
    <template #header>
      <LayoutsConsoleNavbar title="FireUX Project Console" />
    </template>

    <template #body>
      <section class="space-y-8">
        <div class="text-xs text-dimmed">
          Mode: <span class="font-medium">{{ runtime.mode }}</span>
          · Project: <span class="font-mono">{{ runtime.id }}</span>
        </div>

        <UCard>
          <template #header>
            <div class="text-sm font-semibold">Project runtime</div>
          </template>

          <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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

        <UCard>
          <template #header>
            <div class="text-sm font-semibold">Quick actions</div>
          </template>

          <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <UButton
              v-for="entry in navItems"
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
import { useRuntimeProjectConsole } from 'fireux-core/runtime/composables/fireux/app/runtime-project/useRuntimeProjectConsole'
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

const { runtime, navItems, stats } = useRuntimeProjectConsole()
const isDev = import.meta.dev
const hasProject = computed(() => Boolean(String(runtime.id.value || '').trim()))

if (!runtime.id.value) {
  await navigateTo('/console/projects/create', { replace: true })
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
  navItems: toDebugValue(navItems.value),
  hasProject: hasProject.value,
}))
</script>
