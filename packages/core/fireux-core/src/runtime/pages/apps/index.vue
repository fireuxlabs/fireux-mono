<template>
  <UPage>
    <UPageBody class="space-y-6">
      <UCard>
        <template #header>
          <h3 class="text-base font-medium">Current App</h3>
        </template>

        <div v-if="currentApp" class="text-sm">
          <p class="font-medium truncate">{{ displayName(currentApp) }}</p>
          <p class="opacity-70 truncate">ID: {{ currentApp.id }}</p>
          <div class="flex flex-wrap gap-3 text-xs text-dimmed mt-2">
            <span v-if="currentApp.role" class="uppercase tracking-wide">
              Role: {{ currentApp.role }}
            </span>
            <span v-if="currentApp.ecosystem" class="uppercase tracking-wide">
              Ecosystem: {{ currentApp.ecosystem }}
            </span>
          </div>
        </div>
        <p v-else class="opacity-70">No current app.</p>
      </UCard>

      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-base font-medium">Apps</h3>
            <UBadge variant="subtle">{{ appsCount }}</UBadge>
          </div>
        </template>

        <div v-if="appsCount" class="grid gap-4 md:grid-cols-2">
          <UCard v-for="entry in appsList" :key="entry.id">
            <p class="text-xs uppercase tracking-wide text-dimmed">App</p>
            <h4 class="text-base font-medium truncate">
              {{ displayName(entry) }}
            </h4>
            <p class="opacity-70 text-sm truncate">ID: {{ entry.id }}</p>
            <div class="flex flex-wrap gap-3 text-xs text-dimmed mt-2">
              <span v-if="entry.role" class="uppercase tracking-wide">
                Role: {{ entry.role }}
              </span>
              <span v-if="entry.ecosystem" class="uppercase tracking-wide">
                Ecosystem: {{ entry.ecosystem }}
              </span>
            </div>
          </UCard>
        </div>
        <p v-else class="opacity-70">No apps found.</p>
      </UCard>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { AppDoc } from '../../models/core/app.model'
import { useApp } from '../../composables/app/useApp'

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

const currentApp = computed(() => app?.value ?? null)
const appsList = computed<AppDoc[]>(() => [...(apps?.value ?? [])])
const appsCount = computed(() => appsList.value.length)

function displayName(entry: AppDoc | null | undefined) {
  return entry?.app_name ?? entry?.app_short_name ?? entry?.id ?? 'Unnamed App'
}
</script>
