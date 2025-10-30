<!-- FILE: packages/core/fireux-core/src/runtime/pages/apps/index.vue -->
<template>
  <UPage>
    <UPageBody class="space-y-6">
      <UPageHeader
        title="Apps"
        description="Review the current runtime app and optionally browse the directory."
      />

      <UCard>
        <template #header>
          <div class="flex items-center justify-between gap-3">
            <h1 class="text-base font-semibold">Current App</h1>
            <UBadge v-if="currentAppId" variant="subtle">{{
              currentAppId
            }}</UBadge>
          </div>
        </template>

        <div v-if="currentPill" class="space-y-4">
          <MoleculesPill v-bind="currentPill" />
          <OrganismsAppCardsCell :app="app" :to="currentPill.to" />
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
import { useApp } from 'fireux-core/runtime/composables/firestore/core/app/useApp.ts'
import { useAppCollection } from 'fireux-core/runtime/composables/firestore/core/app/main/useAppCollection.ts'
import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'

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
const { appId, isGlobal } = useFireUXConfig()
const { app, pillProps } = useApp()
const { apps } = useAppCollection()

const currentPill = computed(() => (app.value ? pillProps(app.value) : null))
const currentAppId = computed(() => app.value?.id ?? appId ?? null)

const showAll = ref(isGlobal)
const allApps = computed(() => (showAll.value ? apps.value ?? [] : []))

function loadAllApps() {
  if (showAll.value) return
  showAll.value = true
}
</script>
