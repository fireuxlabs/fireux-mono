<!-- FILE: packages/core/fireux-core/src/runtime/pages/apps/[id].vue -->
<template>
  <div class="space-y-6">
    <UCard>
      <template #header>
        <div class="flex items-center justify-between gap-3">
          <h1 class="text-base font-semibold">{{ headerTitle }}</h1>
          <UBadge v-if="appId" variant="subtle">{{ appId }}</UBadge>
        </div>
      </template>

      <div v-if="isLoading" class="space-y-4">
        <USkeleton class="h-16 rounded-xl" />
        <USkeleton class="h-48 rounded-xl" />
      </div>

      <div v-else-if="app" class="space-y-4">
        <MoleculesPill
          :avatar="app?.avatar_url ?? null"
          :initials="initialsForApp(app)"
          :title="app.app_name"
          :subtitle="app.ecosystem"
        />
        <OrganismsAppCardsCell :app="app" />
      </div>

      <p v-else class="text-sm text-gray-500 dark:text-gray-400">
        App not found.
      </p>
    </UCard>

    <UCard>
      <template #header>
        <div class="flex items-center justify-between gap-3">
          <h2 class="text-base font-semibold">Raw Document</h2>
          <span class="text-xs text-gray-500 dark:text-gray-400"
            >Read-only snapshot.</span
          >
        </div>
      </template>

      <div class="space-y-2">
        <h3 class="text-sm font-semibold text-gray-400">
          apps/{{ appId || '—' }}
        </h3>
        <pre
          class="mt-2 overflow-auto rounded-lg bg-gray-900 p-4 text-xs text-gray-100"
          >{{ rawDisplay }}
        </pre>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useHead } from 'nuxt/app'
import { useRoute } from 'vue-router'
import type { App } from 'fireux-core/runtime/models/core/app.model.ts'
import { useFirestoreRead } from 'fireux-core/runtime/composables/firestore/operations/useFirestoreRead.ts'

const route = useRoute()
const rawId = route.params.id
let resolvedId = ''
if (Array.isArray(rawId)) {
  resolvedId = rawId[0] ?? ''
} else if (rawId !== undefined && rawId !== null) {
  resolvedId = String(rawId)
}
const appId = resolvedId

const { firestoreFetchDoc } = useFirestoreRead()
const appRef = appId ? firestoreFetchDoc<App>('apps', appId) : null

const app = computed<App | null>(() => appRef?.value ?? null)
const isLoading = computed(() => Boolean(appRef && appRef.value === undefined))
const headerTitle = computed(() => app.value?.app_name ?? 'App Details')

function initialsForApp(target?: Partial<App> | null) {
  const name = target?.app_name?.trim() ?? ''
  if (name) {
    const [first = '', second = ''] = name.split(/\s+/)
    const combined = `${first[0] ?? ''}${second[0] ?? ''}`.trim()
    if (combined) return combined.toUpperCase()
    if (first) return first.slice(0, 2).toUpperCase()
  }
  const fallback = target?.id?.trim()
  return fallback ? fallback.slice(0, 2).toUpperCase() : 'AP'
}

const rawDisplay = computed(() => {
  if (isLoading.value) return 'Loading…'
  return app.value ? JSON.stringify(app.value, null, 2) : '—'
})

useHead({
  title: computed(() =>
    app.value?.app_name ? `${app.value.app_name} · App` : 'App Details'
  ),
})
</script>
