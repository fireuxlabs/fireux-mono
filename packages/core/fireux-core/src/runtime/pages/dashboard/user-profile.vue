<!-- packages/core/fireux-core/src/runtime/pages/dashboard/user-profile.vue -->
<template>
  <UDashboardPanel id="user-profile">
    <template #header>
      <LayoutsDashboardNavbar title="Profile" />
    </template>

    <template #body>
      <div class="fx-panels-stack">
        <!-- Header pills -->
        <div class="flex flex-wrap items-center gap-2">
          <component
            :is="wrapperFor(appCard)"
            v-if="appCard"
            v-bind="wrapperPropsFor(appCard)"
            class="block"
          >
            <OrganismsAppCardsPill v-bind="appCard" :show-subtitle="false" />
          </component>

          <component
            :is="wrapperFor(userCard)"
            v-if="userCard"
            v-bind="wrapperPropsFor(userCard)"
            class="block"
          >
            <OrganismsUserCardsPill v-bind="userCard" :show-subtitle="false" />
          </component>
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
          <LayoutsDashboardProfileEdit class="fx-panels-masonry">
            <template #preview>
              <OrganismsUserCardsProfile
                v-if="resolvedUser"
                v-bind="card(resolvedUser)"
                :user="resolvedUser"
              />
            </template>

            <template #core>
              <OrganismsUserEditCore :user="resolvedUser" />
            </template>

            <template #app>
              <OrganismsUserEditApp :user="resolvedUser" />
            </template>
          </LayoutsDashboardProfileEdit>
        </ClientOnly>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed, definePageMeta, useHead } from '#imports'
import { useUser } from '../../composables/fireux/firestore/core/user/useUser'
import { useApp } from '../../composables/fireux/firestore/core/app/useApp'

definePageMeta({
  layout: 'dashboard',
  nav: {
    key: 'dashboard-user-profile',
    label: 'Profile',
    icon: 'i-lucide-user',
    order: 30,
    desktop: true,
    layouts: ['dashboard'],
  },
  requiresAuth: true,
})

useHead({ title: 'Profile' })

const { currentUser, isLoading, card } = useUser()
const { app, card: appToCard } = useApp()

const resolvedUser = computed(() => currentUser.value ?? null)

const userCard = computed(() => (resolvedUser.value ? card(resolvedUser.value) : null))
const appCard = computed(() => appToCard(app.value))

const wrapperFor = (card: { to?: string | null } | null) => (card?.to ? 'NuxtLink' : 'div')
const wrapperPropsFor = (card: { to?: string | null } | null) => (card?.to ? { to: card.to } : {})
</script>
