<template>
  <div class="space-y-6">
    <UCard>
      <template #header>
        <h1>🔧 App Development Tools</h1>
      </template>
      <div class="grid gap-4 md:grid-cols-2">
        <div>
          <p><strong>App:</strong> {{ app?.app_name || 'None' }}</p>
          <p><strong>App ID:</strong> {{ currentAppId }}</p>
          <p><strong>Role (runtime):</strong> {{ runtimeRole }}</p>
          <p><strong>App Tenancy:</strong> {{ appTenancy || 'n/a' }}</p>
          <p><strong>Tenancy:</strong> {{ tenancyDisplay }}</p>
        </div>
        <div>
          <p><strong>Ecosystem:</strong> {{ ecosystem }}</p>
          <p><strong>Creator:</strong> {{ creatorId }}</p>
          <p><strong>Created:</strong> {{ formattedCreatedAt }}</p>
        </div>
      </div>
    </UCard>

    <div class="grid gap-6 md:grid-cols-2">
      <UCard>
        <template #header>
          <h2>Status</h2>
        </template>
        <ul class="space-y-1">
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
        <DevJson
          :data="{
            runtimeRole,
            appId: currentAppId,
            isLoading,
            isInitialized,
            hasAdmins,
            isUserAdmin,
          }"
          title="Computed Flags"
        />
      </UCard>

      <UCard>
        <template #header>
          <h2>Admins</h2>
        </template>
        <p v-if="adminIds.length === 0">No admins detected.</p>
        <ul v-else class="list-disc pl-5 space-y-1">
          <li v-for="adminId in adminIds" :key="adminId">{{ adminId }}</li>
        </ul>
        <USeparator class="my-3" />
        <DevJson :data="adminIds" title="Admin IDs" />
      </UCard>
    </div>

    <UCard>
      <template #header>
        <h2>Branding & Defaults</h2>
      </template>
      <div class="grid gap-4 md:grid-cols-2">
        <div>
          <h3 class="font-medium">Tenant Overrides</h3>
          <p class="text-sm text-muted">Shown when this app is a tenant.</p>
          <ul class="mt-2 space-y-1">
            <li>
              <strong>brand.primary:</strong> {{ app?.brand?.primary ?? '—' }}
            </li>
            <li>
              <strong>brand.neutral:</strong> {{ app?.brand?.neutral ?? '—' }}
            </li>
            <li><strong>brand.icon:</strong> {{ app?.brand?.icon ?? '—' }}</li>
            <li>
              <strong>brand.logo_url:</strong> {{ app?.brand?.logo_url ?? '—' }}
            </li>
            <li><strong>domain:</strong> {{ app?.domain ?? '—' }}</li>
          </ul>
        </div>
        <div>
          <h3 class="font-medium">Global Defaults</h3>
          <p class="text-sm text-muted">
            Present only on the global hub ({{
              globalAppId || 'ecosystem-app'
            }}).
          </p>
          <ul class="mt-2 space-y-1">
            <li>
              <strong>defaults.brand.primary:</strong>
              {{ app?.defaults?.brand?.primary ?? '—' }}
            </li>
            <li>
              <strong>defaults.brand.neutral:</strong>
              {{ app?.defaults?.brand?.neutral ?? '—' }}
            </li>
            <li>
              <strong>defaults.brand.icon:</strong>
              {{ app?.defaults?.brand?.icon ?? '—' }}
            </li>
            <li>
              <strong>defaults.brand.logo_url:</strong>
              {{ app?.defaults?.brand?.logo_url ?? '—' }}
            </li>
            <li>
              <strong>defaults.domain:</strong>
              {{ app?.defaults?.domain ?? '—' }}
            </li>
          </ul>
        </div>
      </div>
      <USeparator class="my-3" />
      <div class="grid gap-4 md:grid-cols-2">
        <DevJson :data="app?.brand ?? {}" title="brand (tenant override)" />
        <DevJson :data="app?.defaults ?? {}" title="defaults (global only)" />
      </div>
    </UCard>

    <UCard>
      <template #header>
        <h2>Apps Collection</h2>
      </template>
      <div class="flex items-center justify-between">
        <h3 class="font-medium">All Apps ({{ appsCount }})</h3>
        <p class="text-sm text-muted">Live via useApp().apps</p>
      </div>
      <USeparator class="my-3" />
      <DevJson :data="appsData" title="apps/*" />
    </UCard>

    <UCard v-if="app">
      <h2>Components</h2>

      <h3>Pill</h3>
      <OrganismsAppCardsPill :app="app" />

      <USeparator />

      <h3>Cell</h3>
      <OrganismsAppCardsCell :app="app" />

      <USeparator />

      <h3>Profile</h3>
      <OrganismsAppCardsProfile :app="app" />
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
import { computed } from 'vue'
import { useApp } from '../../composables/app/useApp'
import { useFireUXConfig } from '../../composables/FireUXConfig'
import { formatFirestoreTimestamp } from '../../utils/formatTimestamp'

// Use dev layout + nav meta
// @ts-expect-error Nuxt provides definePageMeta globally at build time
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
const { ecosystem, globalAppId, role: runtimeRole, appId: fallbackAppId } =
  useFireUXConfig()
const { app, apps, appTenancy, tenancyDisplay, isLoading, isInitialized, hasAdmins, isUserAdmin } =
  useApp()

const adminIds = computed(() => app.value?.admin_ids ?? [])
const creatorId = computed(() => app.value?.creator_id || 'Unknown')
const currentAppId = computed(() => app.value?.id || fallbackAppId || 'n/a')
const formattedCreatedAt = computed(() =>
  formatFirestoreTimestamp(app.value?.created_at, { fallback: 'Unknown' })
)
const appsCount = computed(() => apps.value?.length ?? 0)
const appsData = computed(() => apps.value ?? [])
</script>
</script>
