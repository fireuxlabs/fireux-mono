<!-- FILE: packages/core/fireux-core/src/runtime/pages/apps.vue -->
<template>
  <div class="space-y-6">
    <!-- CURRENT APP -->
    <UCard>
      <template #header>
        <h1 class="text-base font-semibold">Current App</h1>
      </template>

      <div v-if="app" class="space-y-4">
        <MoleculesPill
          :avatar="app.avatar_url"
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

    <!-- ALL APPS -->
    <UCard>
      <template #header>
        <div class="flex items-center justify-between gap-3">
          <h2 class="text-base font-semibold">All Apps</h2>

          <!-- Tenant-only: fetch on demand -->
          <UButton
            v-if="isTenant"
            size="xs"
            variant="soft"
            icon="i-lucide-database"
            @click="collection.fetchAll()"
          >
            Load all apps
          </UButton>
        </div>
      </template>

      <div v-if="apps.length" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <MoleculesPill
          v-for="a in apps"
          :key="a.id"
          :avatar="a.avatar_url || a.logo_url || a.wordmark_url"
          :title="a.app_name"
          :subtitle="a.ecosystem"
          :to="`/apps/${a.id}`"
        />
      </div>

      <p v-else class="text-sm text-gray-500 dark:text-gray-400">
        <span v-if="isTenant">
          Global apps not loaded yet.
          <UButton
            size="xs"
            variant="link"
            class="ml-1"
            @click="collection.fetchAll()"
          >
            Load all apps
          </UButton>
        </span>
        <span v-else>No apps found in collection.</span>
      </p>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useApp } from 'fireux-core/runtime/composables/firestore/core/app/useApp.ts'
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

const { app: currentAppRef, collection } = useApp()
const { role, appId } = useFireUXConfig()

const isTenant = computed(() => role === 'tenant')
const app = computed(() => currentAppRef.value ?? null)
const apps = computed(() => collection.all.value ?? [])
const currentAppLink = computed(() => {
  const id = app.value?.id ?? appId ?? ''
  return id ? `/apps/${id}` : null
})
</script>
