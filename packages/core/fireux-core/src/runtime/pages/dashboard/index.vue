<template>
  <!-- Concurrent edit — 2026-07-20 23:18 CEST — Active User Outcome fix: render read failures separately from missing profiles. -->
  <UDashboardPanel id="home">
    <template #header>
      <LayoutsDashboardNavbar title="Profile hub" :ui="{ right: 'gap-3' }" />
    </template>

    <template #body>
      <UPage>
        <UPageBody class="pagebody">
          <MoleculesStateCard
            v-if="isLoading"
            entity="profile hub"
            kind="document"
            loading
          />

          <MoleculesStateCard
            v-else-if="userError"
            entity="profile hub"
            kind="document"
            state="error"
          />

          <template v-else-if="resolvedUser && userCard">
            <UPageHeader
              headline="Your profile hub"
              :title="`Welcome back, ${userCard.displayName}`"
              description="Manage the identity people see, your app access, and any specialist profiles from one place."
            />

            <UPageCard variant="subtle">
              <div class="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <UUser
                  :name="userCard.displayName"
                  :description="userCard.handle || 'Public FireUX user'"
                  :avatar="{ src: userCard.avatarUrl, alt: userCard.displayName }"
                  size="xl"
                />

                <div class="flex flex-wrap gap-2">
                  <UButton
                    to="/dashboard/user-profile"
                    label="Edit public profile"
                    icon="i-lucide-pencil"
                  />
                  <UButton
                    v-if="userCard.to"
                    :to="userCard.to"
                    label="View public profile"
                    icon="i-lucide-external-link"
                    color="neutral"
                    variant="soft"
                  />
                </div>
              </div>
            </UPageCard>

            <div class="grid gap-4 lg:grid-cols-2">
              <UPageCard
                title="Public identity"
                description="Your avatar, display name, and handle are public across FireUX."
                icon="i-lucide-user-round"
                variant="subtle"
              >
                <div class="flex flex-wrap items-center gap-2">
                  <UBadge color="neutral" variant="soft">
                    {{ userCard.handle || 'Handle needed' }}
                  </UBadge>
                  <UBadge color="neutral" variant="soft">
                    {{ userCard.appsLabel || 'No app memberships' }}
                  </UBadge>
                </div>

                <template #footer>
                  <UButton
                    to="/dashboard/user-profile"
                    label="Manage public identity"
                    color="neutral"
                    variant="soft"
                  />
                </template>
              </UPageCard>

              <UPageCard
                title="App access"
                :description="appDescription"
                icon="i-lucide-badge-check"
                variant="subtle"
              >
                <div class="flex flex-wrap items-center gap-2">
                  <UBadge color="primary" variant="soft">
                    {{ membershipRole }}
                  </UBadge>
                  <UBadge
                    :color="appUser?.is_premium ? 'warning' : 'neutral'"
                    variant="soft"
                  >
                    {{ appUser?.is_premium ? 'Premium' : 'Standard' }}
                  </UBadge>
                  <UBadge
                    v-if="appUser?.console_enabled"
                    color="success"
                    variant="soft"
                  >
                    Console enabled
                  </UBadge>
                </div>

                <template #footer>
                  <UButton
                    to="/dashboard/settings"
                    label="Account settings"
                    color="neutral"
                    variant="soft"
                  />
                </template>
              </UPageCard>
            </div>

            <UPageCard
              title="Profile extensions"
              description="Add specialist profiles only when they represent work or capabilities you want to show."
              icon="i-lucide-layout-grid"
              variant="subtle"
            >
              <div v-if="profileExtensionRows.length" class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <div
                  v-for="entry in profileExtensionRows"
                  :key="entry.profileId"
                  class="flex items-center justify-between gap-3 rounded-lg border border-default p-3"
                >
                  <div class="flex min-w-0 items-center gap-3">
                    <UIcon :name="entry.icon || 'i-lucide-user'" class="size-5 text-dimmed" />
                    <div class="min-w-0">
                      <p class="truncate font-medium">{{ entry.label }}</p>
                      <p class="text-sm text-muted">
                        {{ entry.active ? 'Active profile' : 'Available to create' }}
                      </p>
                    </div>
                  </div>
                  <UButton
                    :to="entry.to"
                    :label="entry.active ? 'Open' : 'Create'"
                    color="neutral"
                    variant="ghost"
                    size="sm"
                  />
                </div>
              </div>

              <MoleculesStateCard
                v-else
                entity="profile extension"
                kind="collection"
                state="empty"
                surface="bare"
              />
            </UPageCard>
          </template>

          <MoleculesStateCard
            v-else-if="isMissing"
            entity="user profile"
            kind="document"
            missing
          />

          <MoleculesStateCard
            v-else
            entity="profile hub"
            kind="document"
            loading
          />
        </UPageBody>
      </UPage>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed, definePageMeta, useHead } from '#imports'
import { useDashboardNav } from '../../composables/fireux/app/ui/nav/useDashboardNav'
import { useApp } from '../../composables/fireux/firestore/core/app/useApp'
import { useUser } from '../../composables/fireux/firestore/core/user/useUser'

definePageMeta({
  nav: {
    key: 'dashboard-home',
    label: 'Overview',
    icon: 'i-lucide-layout-dashboard',
    position: 'top',
    order: 10,
    desktop: true,
    mobile: true,
    layouts: ['dashboard'],
  },
  requiresAuth: true,
  layout: 'dashboard',
})

useHead({ title: 'Profile hub' })

const {
  currentUser,
  appUser,
  error: userError,
  isLoading,
  isMissing,
  profile: userToProfile,
} = useUser()
const { app, profile: appToProfile } = useApp()
const { activeProfileEntries, availableProfileEntries } = useDashboardNav()

const resolvedUser = computed(() => currentUser.value ?? null)
const userCard = computed(() => userToProfile(resolvedUser.value))
const appCard = computed(() => appToProfile(app.value))
const membershipRole = computed(() =>
  appUser.value?.role === 'admin' ? 'Administrator' : 'Member'
)
const appDescription = computed(() =>
  appCard.value?.displayName
    ? `Your membership and entitlements for ${appCard.value.displayName}.`
    : 'Your current app membership and entitlements.'
)
const profileExtensionRows = computed(() => [
  ...activeProfileEntries.value.map((entry) => ({ ...entry, active: true })),
  ...availableProfileEntries.value.map((entry) => ({ ...entry, active: false })),
])
</script>
