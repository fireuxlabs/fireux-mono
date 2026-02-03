<!-- FILE: packages/core/fireux-core/src/runtime/pages/users/admin/[id].vue -->
<template>
  <ClientOnly>
    <UPage>
      <UPageHeader :title="pageTitle" :description="pageDescription" />

      <UPageBody class="pagebody">
        <div class="dashboard-profile">
        <div class="dashboard-profile__pills">
          <OrganismsAppCardsPill
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

          <OrganismsUserCardsPill
            v-if="userCard"
            v-bind="userCard"
            :show-subtitle="false"
            :link="Boolean(userCard.to)"
            class="block"
          />
        </div>

        <UPageCard v-if="isDev" variant="subtle">
          <p class="text-xs text-gray-500">Debug: dashboard nav items</p>
          <pre class="text-xs text-gray-600 whitespace-pre-wrap">{{ items }}</pre>
        </UPageCard>

        <UPageCard v-if="isLoading" variant="subtle">
          <p class="text-sm text-dimmed">Loading user…</p>
        </UPageCard>

        <UPageCard
          v-else-if="!isAdmin"
          title="Admin access required"
          description="You need admin access to edit other users."
          variant="subtle"
        />

        <UPageCard
          v-else-if="!resolvedUser"
          title="User not available"
          description="No profile data found for this user."
          variant="subtle"
        />

        <ClientOnly v-else>
          <LayoutsDashboardProfileEdit class="panels-masonry">
            <template #preview>
              <OrganismsUserCardsProfile
                v-if="userCard"
                v-bind="userCard"
                :user="resolvedUser"
              />
            </template>

            <template #core>
              <OrganismsUserEditCore :user="resolvedUser" :user-refs="targetRefs" />
            </template>

            <template #app>
              <OrganismsUserEditApp :user="resolvedUser" :user-refs="targetRefs" />
            </template>

          </LayoutsDashboardProfileEdit>
        </ClientOnly>

        <DevJson
          v-if="isDev && resolvedUser"
          :title="'User (Edit Target)'"
          context="Users admin page · users/admin/[id] · target user"
          :data="resolvedUser"
          :default-open="false"
        />
        </div>
      </UPageBody>
    </UPage>
    <template #fallback>
      <UPage>
        <UPageHeader title="Edit User" />
        <UPageBody class="pagebody">
          <UPageCard variant="subtle">
            <p class="text-sm text-dimmed">Loading…</p>
          </UPageCard>
        </UPageBody>
      </UPage>
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useApp } from '../../../composables/fireux/firestore/core/app/useApp'
import { useUserFetch } from '../../../composables/fireux/firestore/core/user/fetch/useUserFetch'
import { useUser } from '../../../composables/fireux/firestore/core/user/useUser'
import { useUserInterface } from '../../../composables/fireux/firestore/core/user/utils/view/useUserInterface'

definePageMeta({
  layout: 'default',
  name: 'UsersEditPage',
})

const route = useRoute()

const userId = computed(() => {
  const raw = Array.isArray(route.params.id)
    ? route.params.id[0]
    : route.params.id
  return String(raw ?? '').trim() || null
})

const targetRefs = useUserFetch(userId)
const { user: targetUser, pending } = targetRefs
const { card } = useUserInterface(targetUser)
const userCard = computed(() => (targetUser.value ? card(targetUser.value) : null))

const { app, card: appToCard } = useApp()
const appCard = computed(() => appToCard(app.value))

const { isAdmin, isLoading: currentLoading } = useUser()
const isLoading = computed(() => currentLoading.value || pending.value)

const resolvedUser = computed(() => targetUser.value ?? null)
const displayName = computed(
  () => resolvedUser.value?.display_name || resolvedUser.value?.handle || null
)

const pageTitle = computed(() =>
  displayName.value ? `Edit ${displayName.value}` : 'Edit User'
)
const pageDescription = computed(() =>
  displayName.value
    ? `Update ${displayName.value} and their app access.`
    : 'Update user profile details and app access.'
)

const isDev = import.meta.dev

useHead({ title: pageTitle })



</script>
