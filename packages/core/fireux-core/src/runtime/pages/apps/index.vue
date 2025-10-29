<!-- FILE: packages/core/fireux-core/src/runtime/pages/apps/index.vue -->
<template>
  <UPage>
    <UPageBody class="space-y-6">
      <UCard>
        <template #header>
          <h1 class="text-base font-semibold">Current App</h1>
        </template>

        <div v-if="app" class="space-y-4">
          <MoleculesPill
            :avatar="app?.avatar_url ?? null"
            :initials="initialsForApp(app)"
            :title="app.app_name"
            :subtitle="app.ecosystem"
            :to="currentAppLink"
          />
          <OrganismsAppCardsCell :app="app" :to="currentAppLink" />
        </div>

        <p v-else class="text-sm text-gray-500 dark:text-gray-400">
          No app resolved for this runtime.
        </p>
      </UCard>

      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h2 class="text-sm font-semibold">All Apps</h2>
            <UButton
              v-if="!isGlobal"
              size="xs"
              variant="ghost"
              icon="i-lucide-database"
              :disabled="showAll"
              @click="loadAllApps"
            >
              Load apps
            </UButton>
          </div>
        </template>

        <div v-if="allApps.length" class="space-y-4">
          <div class="flex flex-wrap gap-2">
            <MoleculesPill
              v-for="(entry, index) in allApps"
              :key="entry.id ?? index"
              v-bind="pillProps(entry)"
            />
          </div>
        </div>

        <p v-else class="text-sm text-gray-500 dark:text-gray-400">
          <span v-if="!isGlobal && !showAll">
            Press "Load apps" to fetch the directory.
          </span>
          <span v-else>No additional apps found.</span>
        </p>
      </UCard>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useApp } from 'fireux-core/runtime/composables/firestore/core/app/useApp.ts'
import { useAppCollection } from 'fireux-core/runtime/composables/firestore/core/app/useAppCollection.ts'
import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'
import type { App } from 'fireux-core/runtime/models/core/app.model.ts'

definePageMeta({
  nav: {
    key: 'apps',
    label: 'Apps',
    icon: 'i-lucide-grid',
    order: 40,
    desktop: true,
    mobile: true,
    layouts: ['default'],
  },
  title: 'Apps',
  description: 'Registered FireUX apps',
})

const { app: currentAppRef, pillProps } = useApp()
const { apps: appsRef } = useAppCollection()
const { appId, isGlobal } = useFireUXConfig()
const app = computed(() => currentAppRef.value ?? null)
const currentAppLink = computed(() => {
  const id = app.value?.id ?? appId ?? ''
  return id ? `/apps/${id}` : null
})

const showAll = ref(isGlobal)
const allApps = computed(() => (showAll.value ? appsRef.value ?? [] : []))

function loadAllApps() {
  if (showAll.value) return
  showAll.value = true
}

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
</script>
