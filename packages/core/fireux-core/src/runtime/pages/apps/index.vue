<template>
  <UPage>
    <UPageBody class="space-y-6">
      <UCard v-if="canEditApp">
        <div
          class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h3 class="text-base font-medium">App management available</h3>
            <p class="text-sm text-gray-500">
              You are an app administrator. Manage identity, admins, and social
              links from the dashboard.
            </p>
          </div>
          <UButton
            to="/dashboard/app"
            color="primary"
            variant="soft"
            icon="i-lucide-settings-2"
            label="Open app settings"
          />
        </div>
      </UCard>

      <UCard>
        <template #header>
          <h3 class="text-base font-medium">Current App</h3>
        </template>

        <div v-if="currentApp">
          <UAvatar
            :src="appMedia(currentApp)"
            :alt="displayName(currentApp)"
            size="lg"
          />
          <p>{{ displayName(currentApp) }}</p>
          <p>ID: {{ currentApp.id }}</p>
          <p v-if="currentApp.role">Role: {{ currentApp.role }}</p>
          <p v-if="currentApp.ecosystem">
            Ecosystem: {{ currentApp.ecosystem }}
          </p>
        </div>
        <p v-else class="opacity-70">No current app.</p>
      </UCard>

      <UCard v-if="isGlobal">
        <template #header>
          <h3 class="text-base font-medium">
            {{ ecosystemTitle }} ({{ appsCount }})
          </h3>
        </template>

        <div v-if="appsCount">
          <UCard v-for="entry in scopedApps" :key="entry.id">
            <UAvatar
              :src="appMedia(entry)"
              :alt="displayName(entry)"
              size="lg"
            />
            <p>{{ displayName(entry) }}</p>
            <p>ID: {{ entry.id }}</p>
            <p v-if="entry.role">Role: {{ entry.role }}</p>
            <p v-if="entry.ecosystem">Ecosystem: {{ entry.ecosystem }}</p>
          </UCard>
        </div>
        <p v-else class="opacity-70">No apps found.</p>
      </UCard>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { App } from '../../models/core/app.model'
import { useApp } from '../../composables/firestore/core/app/useApp'
import { useFireUXConfig } from '../../composables/FireUXConfig'
import { useUser } from '../../composables/firestore/core/user/useUser'

declare function definePageMeta(meta: any): void

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

const { app, apps } = useApp()
const { isGlobal, isTenant, ecosystem } = useFireUXConfig()
const { isAdmin } = useUser()

const currentApp = computed(() => app?.value ?? null)
const appsList = computed<App[]>(() => {
  const list = [...(apps?.value ?? [])]

  if (isTenant) {
    return currentApp.value ? [currentApp.value] : []
  }

  if (ecosystem) {
    return list.filter((entry) => entry?.ecosystem === ecosystem)
  }

  return list
})
const scopedApps = computed(() => {
  const currentId = currentApp.value?.id

  if (!isGlobal || !currentId) {
    return appsList.value
  }

  return appsList.value.filter((entry) => entry?.id !== currentId)
})
const appsCount = computed(() => scopedApps.value.length)
const ecosystemTitle = computed(() => {
  if (!ecosystem) return 'Apps'
  return ecosystem.charAt(0).toUpperCase() + ecosystem.slice(1)
})
const canEditApp = computed(() => isAdmin.value === true)

function displayName(entry: App | null | undefined) {
  return entry?.app_name ?? entry?.id ?? 'Unnamed App'
}

function appMedia(entry: App | null | undefined) {
  if (!entry) return undefined
  return entry.avatar_url ?? undefined
}
</script>
