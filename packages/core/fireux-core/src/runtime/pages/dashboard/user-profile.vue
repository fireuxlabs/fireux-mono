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

        <!-- Missing profile -->
        <UPageCard
          v-else-if="!resolvedUser"
          title="Profile not available"
          description="No profile data found for this user."
          variant="subtle"
        >
          <UButton to="/" label="Go to Home" variant="soft" class="w-fit" />
        </UPageCard>

        <!-- Main panels -->
        <ClientOnly v-else>
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
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed, definePageMeta, useHead } from '#imports'
import { useApp } from '../../composables/fireux/firestore/core/app/useApp'
import { useUser } from '../../composables/fireux/firestore/core/user/useUser'

definePageMeta({
  layout: 'dashboard',
  nav: {
    key: 'console-user-profile',
    label: 'Profile',
    icon: 'i-lucide-user',
    order: 30,
    desktop: true,
    layouts: ['dashboard'],
  },
  requiresAuth: true,
})

useHead({ title: 'Profile' })

const { currentUser, isLoading, interface: userInterface } = useUser()
const { app, interface: appToCard } = useApp()

const resolvedUser = computed(() => currentUser.value ?? null)

const userCard = computed(() => (resolvedUser.value ? userInterface(resolvedUser.value) : null))
const appCard = computed(() => appToCard(app.value))

</script>
