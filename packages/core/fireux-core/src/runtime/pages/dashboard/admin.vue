<template>
  <UDashboardPanel id="app-admin">
    <template #header>
      <LayoutsDashboardNavbar title="App Admin" />
    </template>

    <template #body>
      <div class="px-0 py-0 sm:px-4 sm:py-4 lg:px-6">
        <UPageCard v-if="pending" variant="subtle">
          <p class="text-sm text-dimmed">Loading app…</p>
        </UPageCard>

        <UPageCard
          v-else-if="!app"
          title="App not available"
          description="No app data found for this environment."
          variant="subtle"
        >
          <UButton to="/" label="Go to Home" variant="soft" class="w-fit" />
        </UPageCard>

        <div v-else class="panels-stack">
          <UPageCard variant="subtle">
            <div class="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
              <div class="min-w-0 space-y-5">
                <div class="flex flex-wrap items-center gap-2">
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

                <div class="space-y-3">
                  <UBadge color="primary" variant="soft" class="w-fit">
                    App admin
                  </UBadge>

                  <div class="space-y-2">
                    <h1 class="text-2xl font-semibold tracking-tight text-default sm:text-3xl">
                      Run {{ appDisplayName }}
                    </h1>
                    <p class="max-w-3xl text-sm leading-6 text-dimmed">
                      App admins manage the public app profile, members, join requests,
                      and conversations. Developer settings are separated for app
                      assets and locked config. The local <span class="font-mono">/dev</span>
                      workbench remains a dev-server inspection surface.
                    </p>
                  </div>
                </div>

                <div class="flex flex-wrap gap-2">
                  <UButton to="/dashboard/chat" icon="i-lucide-message-circle">
                    Open chat inbox
                  </UButton>
                  <UButton
                    v-if="appRecordPath"
                    :to="appRecordPath"
                    color="neutral"
                    variant="soft"
                    icon="i-lucide-database"
                  >
                    Open app record
                  </UButton>
                  <UButton
                    v-if="isDeveloper"
                    to="/dashboard/developer"
                    color="neutral"
                    variant="ghost"
                    icon="i-lucide-code"
                  >
                    Developer settings
                  </UButton>
                  <UButton
                    v-if="isLocalDev"
                    to="/dev"
                    color="neutral"
                    variant="ghost"
                    icon="i-lucide-terminal"
                  >
                    Dev workbench
                  </UButton>
                </div>
              </div>

              <div class="grid w-full gap-3 sm:grid-cols-2 xl:max-w-3xl xl:grid-cols-3">
                <UCard variant="soft">
                  <div class="space-y-2">
                    <div class="flex items-center gap-2 text-sm font-medium text-default">
                      <Icon name="i-lucide-badge-check" class="size-4 text-primary" />
                      Admin scope
                    </div>
                    <p class="text-xs leading-5 text-dimmed">
                      Public content, social links, app members, join requests, and
                      app conversations.
                    </p>
                  </div>
                </UCard>

                <UCard variant="soft">
                  <div class="space-y-2">
                    <div class="flex items-center gap-2 text-sm font-medium text-default">
                      <Icon name="i-lucide-code" class="size-4 text-primary" />
                      Developer settings
                    </div>
                    <p class="text-xs leading-5 text-dimmed">
                      App images, env-backed identity, asset checks, and app model
                      review for the configured developer uid.
                    </p>
                    <UBadge
                      size="xs"
                      :color="isDeveloper ? 'success' : 'neutral'"
                      variant="soft"
                    >
                      {{ isDeveloper ? 'Available to you' : 'Hidden for this user' }}
                    </UBadge>
                  </div>
                </UCard>

                <UCard variant="soft">
                  <div class="space-y-2">
                    <div class="flex items-center gap-2 text-sm font-medium text-default">
                      <Icon name="i-lucide-terminal" class="size-4 text-primary" />
                      Local /dev
                    </div>
                    <p class="text-xs leading-5 text-dimmed">
                      Runtime inspection, collection drift, model JSON, image scans,
                      and local-only debugging utilities.
                    </p>
                    <UBadge
                      size="xs"
                      :color="isLocalDev ? 'warning' : 'neutral'"
                      variant="soft"
                    >
                      {{ isLocalDev ? 'Dev server only' : 'Not mounted in production' }}
                    </UBadge>
                  </div>
                </UCard>
              </div>
            </div>
          </UPageCard>

          <div class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)]">
            <div class="panels-masonry">
              <UPageCard
                title="Admin work"
                description="Keep the public profile useful, review incoming members, and maintain the admin team."
                variant="subtle"
              >
                <p class="text-sm text-dimmed">
                  Locked runtime values stay read-only here. If you need assets or
                  diagnostics, use the Developer Settings page.
                </p>
              </UPageCard>

              <AppEditAdmin :app="app" />
            </div>

            <div class="space-y-6">
              <AppCardsProfile v-if="appProfileModel" :model="appProfileModel" />
            </div>
          </div>
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed, definePageMeta } from '#imports'
import { useDeveloperAccess } from '../../composables/fireux/app/useDeveloperAccess'
import { useAppProfileView } from '../../composables/fireux/firestore/core/app/utils/view/useAppProfileView'
import { useApp } from '../../composables/fireux/firestore/core/app/useApp'
import { useUser } from '../../composables/fireux/firestore/core/user/useUser'

const { app, pending, pill: appToCard } = useApp()
const { user, pill: userToCard } = useUser()
const { model: appProfileModel } = useAppProfileView(app)
const { isDeveloper } = useDeveloperAccess()
const isLocalDev = import.meta.dev

const appCard = computed(() => appToCard(app.value))
const userCard = computed(() => userToCard(user.value))
const appDisplayName = computed(() =>
  app.value?.app_name || app.value?.app_short_name || app.value?.id || 'this app'
)
const appRecordPath = computed(() =>
  app.value?.id ? `/apps/${encodeURIComponent(app.value.id)}` : ''
)

definePageMeta({
  layout: 'dashboard',
  nav: {
    key: 'dashboard-admin',
    label: 'App Admin',
    icon: 'i-lucide-badge-check',
    position: 'top',
    order: 10,
    desktop: true,
    layouts: ['dashboard'],
  },
  requiresAuth: true,
  roles: ['admin'],
})
</script>
