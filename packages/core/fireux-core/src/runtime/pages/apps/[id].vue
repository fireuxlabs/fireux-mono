<!-- FILE: packages/core/fireux-core/src/runtime/pages/apps/[id].vue -->
<template>
  <UPage>
    <UPageBody class="space-y-6">
      <UPageHeader
        :title="pageTitle"
        description="Firestore snapshot for this app."
      />

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
          <MoleculesPill v-bind="pillProps(app)" />
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
          <div v-if="isLoading" class="space-y-2">
            <USkeleton class="h-6 w-40 rounded" />
            <USkeleton class="h-32 rounded-xl" />
          </div>
          <DevJsonPanel v-else-if="app" :data="app" />
          <p v-else class="text-xs text-gray-500 dark:text-gray-400">
            No document loaded.
          </p>
        </div>
      </UCard>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead } from 'nuxt/app'
import { useRoute } from 'vue-router'
import type { App } from 'fireux-core/runtime/models/core/app.model.ts'
import { useFirestoreRead } from 'fireux-core/runtime/composables/firestore/operations/useFirestoreRead.ts'
import { useAppComputed } from 'fireux-core/runtime/composables/firestore/core/app/main/useAppComputed.ts'

const route = useRoute()
const appId = Array.isArray(route.params.id)
  ? route.params.id[0] ?? ''
  : route.params.id?.toString() ?? ''

const { firestoreFetchDoc } = useFirestoreRead()
const app = appId
  ? firestoreFetchDoc<App>('apps', appId)
  : computed<App | null | undefined>(() => null)
const isLoading = computed(() => Boolean(app.value === undefined))
const headerTitle = computed(() => app.value?.app_name ?? 'App Details')
const pageTitle = computed(() => app.value?.app_name ?? 'App Details')

const { pillProps } = useAppComputed(app)

useHead({
  title: computed(() =>
    app.value?.app_name ? `${app.value.app_name} · App` : 'App Details'
  ),
})
</script>
