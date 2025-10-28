<!-- FILE: packages/core/fireux-core/src/runtime/pages/dev/apps.vue -->
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
          </div>
        </div>
      </template>

      <div v-if="currentApp" class="space-y-4">
        <MoleculesPill
          :avatar="currentApp?.avatar_url ?? null"
          :initials="initialsForApp(currentApp)"
          :title="currentApp.app_name"
          :subtitle="currentApp.ecosystem"
          :to="currentAppLink"
        />
        <OrganismsAppCardsCell :app="currentApp" :to="currentAppLink" />

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

        <DevJsonPanel v-if="currentAppJson" :data="currentAppJson" />
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
              v-if="isTenant"
              size="xs"
              variant="soft"
              icon="i-lucide-database"
              @click="loadAllApps"
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
          :avatar="a?.avatar_url ?? null"
          :initials="initialsForApp(a)"
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
            color="primary"
            class="ml-1"
            @click="loadAllApps"
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

      <DevJsonPanel v-if="appsJson" :data="appsJson" />
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useApp } from 'fireux-core/runtime/composables/firestore/core/app/useApp.ts'
import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'
import { useDevClipboard } from '../../composables/dev/useDevClipboard.ts'
import type { App } from 'fireux-core/runtime/models/core/app.model.ts'

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
const loadAllApps = () => collection.fetchAll()

const currentAppJson = computed(() => currentApp.value ?? null)
const appsJson = computed(() => (apps.value.length ? apps.value : null))

const currentAppLink = computed(() => {
  const id = currentApp.value?.id ?? ''
  return id ? `/apps/${id}` : null
})

const { copyJSON } = useDevClipboard()

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
