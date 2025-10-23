<template>
  <div class="space-y-6">
    <UCard>
      <template #header>
        <div class="flex flex-col gap-1">
          <h1>Current App</h1>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Snapshot of the app resolved for this runtime.
          </p>
        </div>
      </template>

      <div v-if="app" class="grid gap-4 md:grid-cols-3">
        <div>
          <h3 class="font-medium">Identity</h3>
          <ul class="mt-2 space-y-1 text-sm">
            <li><strong>Name:</strong> {{ app.app_name || '—' }}</li>
            <li>
              <strong>Short Name:</strong> {{ app.app_short_name || '—' }}
            </li>
            <li>
              <strong>Ecosystem:</strong>
              {{ app.ecosystem || ecosystem || '—' }}
            </li>
          </ul>
        </div>
        <div>
          <h3 class="font-medium">Runtime Context</h3>
          <ul class="mt-2 space-y-1 text-sm">
            <li><strong>App ID:</strong> {{ currentAppId }}</li>
            <li><strong>Role:</strong> {{ app.role || runtimeRole || '—' }}</li>
            <li><strong>Tenancy:</strong> {{ tenancyDisplay || 'n/a' }}</li>
          </ul>
        </div>
        <div>
          <h3 class="font-medium">Lifecycle</h3>
          <ul class="mt-2 space-y-1 text-sm">
            <li><strong>Creator:</strong> {{ creatorId }}</li>
            <li><strong>Created:</strong> {{ formattedCreatedAt }}</li>
            <li><strong>Updated:</strong> {{ formattedUpdatedAt }}</li>
          </ul>
        </div>
      </div>
      <p v-else class="text-sm text-gray-500 dark:text-gray-400">
        No app document detected. Ensure useApp() resolves the current app.
      </p>
      <USeparator class="my-4" />
      <DevJson :data="appSummary" title="App Snapshot" />
    </UCard>

    <div class="grid gap-6 md:grid-cols-2">
      <UCard>
        <template #header>
          <h2>Runtime Status</h2>
        </template>
        <ul class="space-y-1 text-sm">
          <li><strong>Loading:</strong> {{ isLoading ? 'yes' : 'no' }}</li>
          <li>
            <strong>Initialized:</strong>
            {{ isInitialized ? 'yes' : 'no' }}
          </li>
          <li><strong>Has Admins:</strong> {{ hasAdmins() ? 'yes' : 'no' }}</li>
          <li>
            <strong>Current User Admin:</strong>
            {{ isUserAdmin() ? 'yes' : 'no' }}
          </li>
        </ul>
        <USeparator class="my-3" />
        <DevJson :data="statusSummary" title="Computed Flags" />
      </UCard>

      <UCard>
        <template #header>
          <h2>Admins</h2>
        </template>
        <p
          v-if="adminIds.length === 0"
          class="text-sm text-gray-500 dark:text-gray-400"
        >
          No admins detected.
        </p>
        <ul v-else class="list-disc space-y-1 pl-5 text-sm">
          <li v-for="adminId in adminIds" :key="adminId">{{ adminId }}</li>
        </ul>
        <USeparator class="my-3" />
        <DevJson :data="adminIds" title="Admin IDs" />
      </UCard>
    </div>

    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h2>Apps Collection</h2>
          <span class="text-sm text-gray-500 dark:text-gray-400"
            >Total: {{ appsCount }}</span
          >
        </div>
      </template>
      <p class="text-sm text-gray-500 dark:text-gray-400">
        Pulled from useApp().apps to show what is available to this runtime.
      </p>
      <div v-if="appCollection.length" class="mt-4 space-y-2">
        <div
          v-for="item in appCollection"
          :key="item.id"
          :class="[
            'rounded border border-gray-200 px-3 py-2 text-sm dark:border-gray-700',
            item.isCurrent ? 'bg-gray-50 dark:bg-gray-800/60' : '',
          ]"
        >
          <div class="flex items-center justify-between">
            <span class="font-medium">{{ item.name || item.id }}</span>
            <span v-if="item.isCurrent" class="text-xs font-semibold uppercase"
              >current</span
            >
          </div>
          <div class="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {{ item.id }} · {{ item.ecosystem }} · {{ item.role }}
          </div>
        </div>
      </div>
      <p v-else class="mt-4 text-sm text-gray-500 dark:text-gray-400">
        No apps available in the collection.
      </p>
      <USeparator class="my-4" />
      <DevJson :data="appsData" title="apps/*" />
    </UCard>

    <UCard>
      <template #header>
        <h2>App JSON</h2>
      </template>
      <DevJson :data="app" title="App Document" />
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { computed, unref } from 'vue'
import { useApp } from '../../composables/firestore/core/app/useApp'
import { useFireUXConfig } from '../../composables/FireUXConfig'
import { formatFirestoreTimestamp } from '../../utils/formatTimestamp'

// Use dev layout + nav meta
definePageMeta({
  layout: 'dev',
  nav: {
    key: 'dev-app',
    label: 'App Config',
    icon: 'i-lucide-settings',
    desktop: true,
    group: 'core',
    layouts: ['dev'],
  },
})

// Get app information
const { ecosystem, role: runtimeRole, appId: fallbackAppId } = useFireUXConfig()
const {
  app,
  apps,
  appTenancy,
  tenancyDisplay,
  isLoading,
  isInitialized,
  hasAdmins,
  isUserAdmin,
} = useApp()

const adminIds = computed(() => app.value?.admin_ids ?? [])
const creatorId = computed(() => app.value?.creator_id || 'Unknown')
const currentAppId = computed(() => app.value?.id || fallbackAppId || 'n/a')
const formattedCreatedAt = computed(() =>
  formatFirestoreTimestamp(app.value?.created_at, { fallback: 'Unknown' })
)
const formattedUpdatedAt = computed(() =>
  formatFirestoreTimestamp(app.value?.updated_at, { fallback: 'Unknown' })
)
const statusSummary = computed(() => ({
  runtimeRole,
  appId: currentAppId.value,
  isLoading: unref(isLoading),
  isInitialized: unref(isInitialized),
  hasAdmins: hasAdmins(),
  isUserAdmin: isUserAdmin(),
}))

const appSummary = computed(() => {
  const current = app.value

  return {
    id: current?.id ?? fallbackAppId ?? null,
    name: current?.app_name ?? null,
    short_name: current?.app_short_name ?? null,
    role: current?.role ?? runtimeRole ?? null,
    ecosystem: current?.ecosystem ?? ecosystem ?? null,
    admin_ids: current?.admin_ids ?? [],
    creator_id: current?.creator_id ?? null,
    tenancy: unref(appTenancy) ?? null,
    tenancy_display: unref(tenancyDisplay) ?? null,
    created_at: formattedCreatedAt.value,
    updated_at: formattedUpdatedAt.value,
  }
})

type RuntimeAppDocument = {
  id?: string
  app_name?: string
  app_short_name?: string
  role?: string
  ecosystem?: string
}

const appCollection = computed(() => {
  const currentId = app.value?.id ?? null
  const collection = unref(apps)

  if (!Array.isArray(collection)) {
    return [] as Array<{
      id: string
      name: string
      role: string
      ecosystem: string
      isCurrent: boolean
    }>
  }

  return collection.map((item) => {
    const doc = item as RuntimeAppDocument

    return {
      id: doc.id ?? 'unknown',
      name: doc.app_name ?? doc.app_short_name ?? doc.id ?? '—',
      role: doc.role ?? '—',
      ecosystem: doc.ecosystem ?? '—',
      isCurrent: currentId ? doc.id === currentId : false,
    }
  })
})

const appsCount = computed(() => appCollection.value.length)
const appsData = computed(() => apps.value ?? [])
</script>
