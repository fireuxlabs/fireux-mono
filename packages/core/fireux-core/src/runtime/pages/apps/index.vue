<template>
  <UPage>
    <UPageBody>
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
import { useApp } from '../../composables/app/useApp'
import { useFireUXConfig } from '../../composables/FireUXConfig'

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
const { role, ecosystem } = useFireUXConfig()

const isGlobal = computed(() => role === 'global')
const isTenant = computed(() => role === 'tenant')

const currentApp = computed(() => app?.value ?? null)
const appsList = computed<App[]>(() => {
  const list = [...(apps?.value ?? [])]

  if (isTenant.value) {
    return currentApp.value ? [currentApp.value] : []
  }

  if (ecosystem) {
    return list.filter((entry) => entry?.ecosystem === ecosystem)
  }

  return list
})
const scopedApps = computed(() => {
  const currentId = currentApp.value?.id

  if (!isGlobal.value || !currentId) {
    return appsList.value
  }

  return appsList.value.filter((entry) => entry?.id !== currentId)
})
const appsCount = computed(() => scopedApps.value.length)
const ecosystemTitle = computed(() => {
  if (!ecosystem) return 'Apps'
  return ecosystem.charAt(0).toUpperCase() + ecosystem.slice(1)
})

function displayName(entry: App | null | undefined) {
  return entry?.app_name ?? entry?.id ?? 'Unnamed App'
}

function appMedia(entry: App | null | undefined) {
  if (!entry) return undefined
  return entry.avatar_url ?? undefined
}
</script>
