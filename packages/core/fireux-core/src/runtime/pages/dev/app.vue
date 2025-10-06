<template>
  <div class="space-y-6">
    <UCard>
      <template #header>
        <h1>🔧 App Development Tools</h1>
      </template>
      <div class="grid gap-4 md:grid-cols-2">
        <div>
          <p><strong>App:</strong> {{ app?.app_name || 'None' }}</p>
          <p><strong>App ID:</strong> {{ appId || 'n/a' }}</p>
          <p><strong>Role (runtime):</strong> {{ role }}</p>
          <p><strong>App Tenancy:</strong> {{ appTenancy || 'n/a' }}</p>
          <p><strong>Tenancy:</strong> {{ tenancyDisplay }}</p>
        </div>
        <div>
          <p><strong>Ecosystem:</strong> {{ ecosystem }}</p>
          <p><strong>Creator:</strong> {{ creatorId }}</p>
          <p><strong>Created:</strong> {{ formattedCreatedAt }}</p>
          <p><strong>Modules:</strong> {{ modulesLabel }}</p>
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
          <li><strong>Has Admins:</strong> {{ hasAdmins ? 'yes' : 'no' }}</li>
          <li>
            <strong>Current User Admin:</strong>
            {{ isUserAdmin ? 'yes' : 'no' }}
          </li>
        </ul>
        <USeparator class="my-3" />
        <DevJson
          :data="{
            role,
            appId,
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
        <h2>App Collections</h2>
      </template>
      <div class="grid gap-4 md:grid-cols-2">
        <div>
          <h3 class="font-medium">All Apps ({{ appsCount }})</h3>
          <p class="text-sm text-muted">
            Live from Firestore via useApp().apps
          </p>
        </div>
        <div>
          <h3 class="font-medium">App Users ({{ appUsersCount }})</h3>
          <p class="text-sm text-muted">Collection: apps/{{ appId }}/users</p>
        </div>
      </div>
      <USeparator class="my-3" />
      <div class="grid gap-4 md:grid-cols-2">
        <DevJson :data="appsData" title="Apps Collection" />
        <DevJson :data="appUsers" title="App Users" />
      </div>
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
import { computed, shallowRef, watchEffect } from 'vue'

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
const {
  app,
  apps,
  appTenancy,
  tenancyDisplay,
  role,
  appId,
  isLoading,
  isInitialized,
  hasAdmins,
  isUserAdmin,
  getAppUsers,
} = useApp()

const adminIds = computed(() => app.value?.admin_ids ?? [])
const modulesLabel = computed(() => {
  const modules = app.value?.modules
  if (!Array.isArray(modules) || modules.length === 0) return 'None'
  return modules.join(', ')
})
const ecosystem = computed(() => app.value?.ecosystem || 'None')
const creatorId = computed(() => app.value?.creator_id || 'Unknown')
const formattedCreatedAt = computed(() => app.value?.created_at || 'Unknown')

const appsCount = computed(() => apps.value?.length ?? 0)

const appUsersState = shallowRef<ReturnType<typeof getAppUsers> | null>(null)

watchEffect(() => {
  if (!import.meta.client) return
  const id = app.value?.id
  if (id) {
    appUsersState.value = getAppUsers(id)
  } else {
    appUsersState.value = null
  }
})

const appUsers = computed(() => appUsersState.value?.data.value ?? [])
const appUsersCount = computed(() => appUsers.value.length)
const appsData = computed(() => apps.value ?? [])
</script>
