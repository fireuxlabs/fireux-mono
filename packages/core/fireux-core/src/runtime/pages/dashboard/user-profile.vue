<template>
  <UDashboardPanel id="user-profile">
    <template #header>
      <LayoutsDashboardNavbar title="Public profile" />
    </template>

    <template #body>
      <UPage>
        <UPageBody class="pagebody">
          <UPageHeader
            title="Public profile"
            description="This is your root FireUX identity. Changes appear anywhere your User card or attached profiles are shown."
          >
            <template #links>
              <UButton
                v-if="userCard?.to"
                :to="userCard.to"
                label="View public profile"
                icon="i-lucide-external-link"
                color="neutral"
                variant="soft"
              />
            </template>
          </UPageHeader>

          <div class="console-profile">
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

            <MoleculesStateCard
              v-if="isLoading"
              entity="public profile"
              kind="document"
              loading
            />

            <MoleculesStateCard
              v-else-if="!resolvedUser"
              entity="public profile"
              kind="document"
              state="missing"
            />

            <ClientOnly v-else>
              <LayoutsDashboardProfileEdit class="panels-masonry">
                <template #preview>
                  <UserCardsProfile
                    v-if="userCard"
                    v-bind="userCard"
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
              description="Specialist profiles add public capability details without replacing your root User identity."
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
                        {{ entry.active ? 'Active profile' : 'Available profile' }}
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
  layout: 'dashboard',
  nav: {
    key: 'dashboard-user-profile',
    label: 'Public profile',
    icon: 'i-lucide-user',
    position: 'top',
    order: 30,
    desktop: true,
    layouts: ['dashboard'],
  },
  requiresAuth: true,
})

useHead({ title: 'Public profile' })

const {
  currentUser,
  isLoading,
  profile: userInterface,
} = useUser()
const { app, pill: appToCard } = useApp()
const { activeProfileEntries, availableProfileEntries } = useDashboardNav()

const resolvedUser = computed(() => currentUser.value ?? null)
const userCard = computed(() => userInterface(resolvedUser.value))
const appCard = computed(() => appToCard(app.value))
const profileExtensionRows = computed(() => [
  ...activeProfileEntries.value.map((entry) => ({ ...entry, active: true })),
  ...availableProfileEntries.value.map((entry) => ({ ...entry, active: false })),
])
</script>
