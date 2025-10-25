<template>
  <div class="space-y-6">
    <!-- CURRENT APP -->
    <UCard>
      <template #header>
        <div class="flex items-center justify-between gap-3">
          <h1 class="text-base font-semibold">Current App</h1>
          <div class="flex items-center gap-2">
            <UButton
              v-if="currentApp"
              size="xs"
              variant="ghost"
              icon="i-lucide-copy"
              @click="copyJSON(currentApp)"
            >
              Copy JSON
            </UButton>
            <UButton
              v-if="currentAppJson"
              size="xs"
              variant="ghost"
              :icon="
                showCurrentJson
                  ? 'i-lucide-chevron-up'
                  : 'i-lucide-chevron-down'
              "
              @click="toggleCurrentJson"
            >
              {{ showCurrentJson ? 'Hide JSON' : 'Show JSON' }}
            </UButton>
          </div>
        </div>
      </template>

      <div v-if="currentApp" class="space-y-4">
        <MoleculesPill
          :avatar="currentApp.avatar_url"
          :title="currentApp.app_name"
          :subtitle="currentApp.ecosystem"
        />
        <OrganismsAppCardsCell :app="currentApp" />

        <div
          class="rounded-md border border-slate-200/60 bg-slate-50/40 p-3 text-sm text-slate-600 dark:border-slate-700/60 dark:bg-slate-900/40 dark:text-slate-300"
        >
          <p class="mb-2 font-medium text-slate-700 dark:text-slate-200">
            Current app info
          </p>
          <ul class="space-y-1">
            <li
              v-for="item in currentInfo"
              :key="item.label"
              class="flex items-center justify-between gap-3"
            >
              <span class="font-medium text-slate-700 dark:text-slate-200">{{
                item.label
              }}</span>
              <span class="truncate text-right">{{ item.value }}</span>
            </li>
          </ul>
        </div>

        <pre
          v-if="showCurrentJson && currentAppJson"
          class="overflow-auto rounded-md bg-slate-950/90 p-4 text-xs text-slate-100"
          >{{ currentAppJson }}
        </pre>
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

          <div class="flex items-center gap-2">
            <UButton
              v-if="apps.length"
              size="xs"
              variant="ghost"
              icon="i-lucide-copy"
              @click="copyJSON(apps)"
            >
              Copy JSON
            </UButton>

            <UButton
              v-if="appsJson"
              size="xs"
              variant="ghost"
              :icon="
                showCollectionJson
                  ? 'i-lucide-chevron-up'
                  : 'i-lucide-chevron-down'
              "
              @click="toggleCollectionJson"
            >
              {{ showCollectionJson ? 'Hide JSON' : 'Show JSON' }}
            </UButton>

            <!-- Tenant-only: fetch on demand -->
            <UButton
              v-if="isTenant"
              size="xs"
              variant="soft"
              icon="i-lucide-database"
              @click="loadAll"
            >
              Load all apps
            </UButton>
          </div>
        </div>
      </template>

      <div v-if="apps.length" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <MoleculesPill
          v-for="a in apps"
          :key="a.id"
          :avatar="a.avatar_url || a.logo_url || a.wordmark_url"
          :title="a.app_name"
          :subtitle="a.ecosystem"
        />
      </div>

      <p v-else class="text-sm text-gray-500 dark:text-gray-400">
        <span v-if="isTenant">
          Global apps not loaded yet.
          <UButton
            size="xs"
            variant="link"
            color="primary"
            class="ml-1"
            @click="loadAll"
          >
            Load all apps
          </UButton>
        </span>
        <span v-else>No apps found in collection.</span>
      </p>

      <div
        class="mt-4 rounded-md border border-slate-200/60 bg-slate-50/40 p-3 text-sm text-slate-600 dark:border-slate-700/60 dark:bg-slate-900/40 dark:text-slate-300"
      >
        <p class="mb-2 font-medium text-slate-700 dark:text-slate-200">
          Collection info
        </p>
        <ul class="space-y-1">
          <li
            v-for="item in collectionInfo"
            :key="item.label"
            class="flex items-center justify-between gap-3"
          >
            <span class="font-medium text-slate-700 dark:text-slate-200">{{
              item.label
            }}</span>
            <span class="truncate text-right">{{ item.value }}</span>
          </li>
        </ul>
      </div>

      <pre
        v-if="showCollectionJson && appsJson"
        class="overflow-auto rounded-md bg-slate-950/90 p-4 text-xs text-slate-100"
        >{{ appsJson }}
      </pre>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useApp } from 'fireux-core/runtime/composables/firestore/core/app/useApp.ts'
import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'

definePageMeta({
  layout: 'dev',
  alias: ['/dev/apps'],
  nav: {
    key: 'dev-apps',
    label: 'Apps',
    icon: 'i-lucide-app-window',
    desktop: true,
    group: 'core',
    layouts: ['dev'],
  },
})

const { role } = useFireUXConfig()
const isTenant = computed(() => role === 'tenant')

const { app, collection, computed: appComputed } = useApp()

const currentApp = computed(() => app.value ?? null)
const apps = computed(() => collection.all.value ?? [])

const currentAppJson = computed(() =>
  currentApp.value ? JSON.stringify(currentApp.value, null, 2) : null
)
const appsJson = computed(() =>
  apps.value.length ? JSON.stringify(apps.value, null, 2) : null
)

const showCurrentJson = ref(false)
const showCollectionJson = ref(false)

function toggleCurrentJson() {
  showCurrentJson.value = !showCurrentJson.value
}

function toggleCollectionJson() {
  showCollectionJson.value = !showCollectionJson.value
}

const currentInfo = computed(() => {
  const current = currentApp.value
  if (!current) {
    return []
  }

  const adminCount = current.admin_ids?.length ?? 0

  return [
    { label: 'ID', value: current.id },
    { label: 'Role', value: current.role },
    { label: 'Ecosystem', value: current.ecosystem },
    { label: 'Creator', value: current.creator_id ?? '—' },
    { label: 'Admins', value: adminCount ? `${adminCount}` : '—' },
    {
      label: 'Initialized',
      value: appComputed.isInitialized.value ? 'Yes' : 'No',
    },
  ]
})

const collectionInfo = computed(() => {
  const list = apps.value
  const previewNames = list
    .slice(0, 3)
    .map((item) => item.app_name || item.id)
    .filter(Boolean)
    .join(', ')
  const remaining = list.length > 3 ? ` +${list.length - 3} more` : ''

  return [
    { label: 'Mode', value: isTenant.value ? 'Tenant' : 'Global' },
    { label: 'Loaded', value: list.length ? 'Yes' : 'No' },
    { label: 'Total apps', value: `${list.length}` },
    {
      label: 'Preview',
      value: previewNames ? `${previewNames}${remaining}` : '—',
    },
  ]
})

function loadAll() {
  collection.fetchAll()
}

async function copyJSON(payload: unknown) {
  if (!payload || typeof navigator === 'undefined') {
    return
  }

  try {
    await navigator.clipboard?.writeText(JSON.stringify(payload, null, 2))
  } catch (error) {
    console.error('[dev/apps] Failed to copy JSON', error)
  }
}
</script>
