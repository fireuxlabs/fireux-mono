<!-- packages/core/fireux-core/src/runtime/pages/dashboard/user-profile.vue -->
<template>
  <UDashboardPanel id="user-profile">
    <template #header>
      <LayoutsDashboardNavbar title="Profile" />
    </template>

    <template #body>
      <div class="console-profile">
        <!-- Header pills -->
        <div class="console-profile__pills">
          <AppCardsPill
            v-if="appCard"
            :to="appCard.to"
            :thumbnail-url="appCard.thumbnailUrl"
            :display-name="appCard.displayName"
            :ecosystem="appCard.ecosystem"
            :badges="appCard.badges"
            :show-subtitle="false"
            :link="Boolean(appCard.to)"
            class="block"
          />

          <UserCardsPill
            v-if="userCard"
            v-bind="userCard"
            :show-subtitle="false"
            :link="Boolean(userCard.to)"
            class="block"
          />
        </div>

        <!-- Loading -->
        <UPageCard v-if="isLoading" variant="subtle">
          <p class="text-sm text-dimmed">Loading profile…</p>
        </UPageCard>

        <DevFireuxDebugPanel
          title="User profile"
          scope="runtime"
          :data="adminDebug"
        />

        <!-- Missing profile -->
        <UPageCard
          v-if="!isLoading && !resolvedUser"
          title="Profile not available"
          description="No profile data found for this user."
          variant="subtle"
        >
          <UButton to="/" label="Go to Home" variant="soft" class="w-fit" />
        </UPageCard>

        <!-- Main panels -->
        <ClientOnly v-if="!isLoading && resolvedUser">
          <LayoutsDashboardProfileEdit class="panels-masonry">
            <template #preview>
              <UserCardsProfile
                v-if="resolvedUser"
                v-bind="userInterface(resolvedUser)"
                :user="resolvedUser"
              />
            </template>

            <template #core>
              <UserEditCore :user="resolvedUser" />
            </template>

            <template #app>
              <UserEditApp :user="resolvedUser" />
            </template>
          </LayoutsDashboardProfileEdit>
        </ClientOnly>

        <UPageCard
          v-if="profileExtensionRows.length"
          title="Profile extensions"
          description="Add a work profile only when it is useful. These do not control console access."
          variant="subtle"
        >
          <div class="grid gap-2 sm:grid-cols-2">
            <div
              v-for="entry in profileExtensionRows"
              :key="entry.profileId"
              class="flex items-center justify-between gap-3 rounded-lg border border-default px-3 py-2"
            >
              <div class="flex min-w-0 items-center gap-2">
                <UIcon :name="entry.icon || 'i-lucide-user'" class="size-4 text-dimmed" />
                <div class="min-w-0">
                  <p class="truncate text-sm font-medium">{{ entry.label }}</p>
                  <p class="text-xs text-dimmed">
                    {{ entry.active ? 'Created' : 'Optional' }}
                  </p>
                </div>
              </div>

              <UButton
                :to="entry.to"
                :label="entry.active ? 'Open' : 'Create'"
                color="neutral"
                variant="soft"
                size="xs"
              />
            </div>
          </div>
        </UPageCard>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed, definePageMeta, useHead, useRuntimeConfig } from '#imports'
import { useFireUXConfig } from '../../composables/fireux/app/FireUXConfig'
import { useDashboardNav } from '../../composables/fireux/app/ui/nav/useDashboardNav'
import { useAuth } from '../../composables/fireux/firebase/useAuth'
import { useApp } from '../../composables/fireux/firestore/core/app/useApp'
import { useUser } from '../../composables/fireux/firestore/core/user/useUser'

definePageMeta({
  layout: 'dashboard',
  nav: {
    key: 'dashboard-user-profile',
    label: 'Profile',
    icon: 'i-lucide-user',
    position: 'top',
    order: 30,
    desktop: true,
    layouts: ['dashboard'],
  },
  requiresAuth: true,
})

useHead({ title: 'Profile' })

const {
  currentUser,
  coreUser,
  appUser,
  isAdmin,
  isLoading,
  isResolved,
  profile: userInterface,
} = useUser()
const { app, pill: appToCard } = useApp()
const { activeProfileEntries, availableProfileEntries } = useDashboardNav()
const { uid } = useAuth()
const fireuxConfig = useFireUXConfig()
const runtimeConfig = useRuntimeConfig()

const appId = computed(() => fireuxConfig.appId || '')
const databaseId = computed(() =>
  String(runtimeConfig.public?.firebaseEcosystem?.firebase?.databaseId || '')
)
const storageBucket = computed(() =>
  String(runtimeConfig.public?.firebaseEcosystem?.firebase?.storageBucket || '')
)
const authUid = computed(() => uid.value || coreUser.value?.id || '')

const resolvedUser = computed(() => currentUser.value ?? null)

const userCard = computed(() => (resolvedUser.value ? userInterface(resolvedUser.value) : null))
const appCard = computed(() => appToCard(app.value))
const profileExtensionRows = computed(() => [
  ...activeProfileEntries.value.map((entry) => ({ ...entry, active: true })),
  ...availableProfileEntries.value.map((entry) => ({
    ...entry,
    active: false,
  })),
])
const appAdminIds = computed(() =>
  Array.isArray(app.value?.admin_ids)
    ? app.value.admin_ids.filter(
        (id): id is string => typeof id === 'string' && id.length > 0
      )
    : []
)
const authUidInAppAdminIds = computed(() =>
  Boolean(authUid.value && appAdminIds.value.includes(authUid.value))
)
const adminSource = computed(() => {
  if (appUser.value?.role === 'admin') return 'app user role'
  if (appId.value && coreUser.value?.adminOf?.includes(appId.value)) {
    return 'core adminOf mirror'
  }
  if (authUidInAppAdminIds.value) return 'app admin_ids mirror'
  return 'none'
})
const adminDebug = computed(() => ({
  runtime: {
    appId: appId.value || null,
    databaseId: databaseId.value || '(default)',
    storageBucket: storageBucket.value || null,
    authUid: authUid.value || null,
  },
  computed: {
    isAdmin: isAdmin.value,
    adminSource: adminSource.value,
    isLoading: isLoading.value,
    isResolved: isResolved.value,
  },
  coreUser: {
    path: authUid.value ? `users/${authUid.value}` : null,
    id: coreUser.value?.id ?? null,
    adminOf: coreUser.value?.adminOf ?? [],
    userOf: coreUser.value?.userOf ?? [],
    profiles: coreUser.value?.profiles ?? [],
    avatar: coreUser.value?.avatar ?? null,
  },
  appUser: {
    path:
      appId.value && authUid.value
        ? `apps/${appId.value}/users/${authUid.value}`
        : null,
    id: appUser.value?.id ?? null,
    role: appUser.value?.role ?? null,
    console_enabled: appUser.value?.console_enabled ?? null,
    console_scopes: appUser.value?.console_scopes ?? [],
  },
  app: {
    path: appId.value ? `apps/${appId.value}` : null,
    id: app.value?.id ?? null,
    admin_ids: appAdminIds.value,
    authUidInAdminIds: authUidInAppAdminIds.value,
  },
}))

</script>
