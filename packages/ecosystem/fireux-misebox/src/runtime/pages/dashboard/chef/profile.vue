<!-- FILE: packages/ecosystem/fireux-misebox/src/runtime/pages/dashboard/chef/profile.vue -->
<template>
  <UDashboardPanel id="dashboard-chef-profile">
    <template #header>
      <LayoutsDashboardNavbar title="Chef Profile" />
    </template>

    <template #body>
      <div class="panels-stack">
        <div class="flex flex-wrap items-center gap-2">
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

        <UPageCard v-if="isProfileLoading" variant="subtle">
          <p class="text-sm text-dimmed">Loading profile…</p>
        </UPageCard>

        <UPageCard
          v-else-if="!resolvedCoreProfile"
          title="Chef profile not available"
          description="Your chef profile hasn’t been created yet."
          variant="subtle"
        >
          <UButton
            :label="chefConfig.cta || 'Create Chef profile'"
            color="neutral"
            :loading="isCreating"
            @click="createProfile"
          />

          <p v-if="createError" class="mt-3 text-sm text-dimmed">
            {{ createError }}
          </p>
        </UPageCard>

        <ClientOnly v-else>
          <LayoutsDashboardProfileEdit class="panels-masonry">
            <template #preview>
              <OrganismsProfilesChefEditPreviewPanel />
            </template>

            <template #core>
              <OrganismsProfilesChefEditCore :chef="resolvedCoreProfile" />
            </template>

            <template v-if="resolvedAppProfile" #app>
              <OrganismsProfilesChefEditApp :chef="resolvedAppProfile" />
            </template>
          </LayoutsDashboardProfileEdit>
        </ClientOnly>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import LayoutsDashboardProfileEdit from 'fireux-core/runtime/components/layouts/dashboard/ProfileEdit.vue'
import { useApp } from 'fireux-core/runtime/composables/fireux/firestore/core/app/useApp'
import { useProfileEnsure } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/mutations/useProfileEnsure'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'
import { computed, ref } from 'vue'
import { useChef } from '../../../composables/fireux/firestore/profiles/Chef/useChef'
import { chefConfig } from '../../../models/profiles/Chef/Chef.model'

definePageMeta({
  layout: 'dashboard',
  nav: {
    key: 'dashboard-chef-profile',
    label: 'Chef Profile',
    icon: 'i-lucide-chef-hat',
    desktop: true,
    layouts: ['dashboard'],
    group: 'profiles',
    profileId: 'chef',
  },
  requiresAuth: true,
})

const { coreProfile, appProfile } = useChef()
const { app, card: appToCard } = useApp()
const { user, card: userToCard } = useUser()

const { ensure } = useProfileEnsure(chefConfig)
const isCreating = ref(false)
const createError = ref<string | null>(null)

const createProfile = async () => {
  if (isCreating.value) return
  isCreating.value = true
  createError.value = null

  try {
    await ensure()
  } catch (error) {
    createError.value = (error as Error)?.message || 'Failed to create profile.'
  } finally {
    isCreating.value = false
  }
}

const isProfileLoading = computed(() => coreProfile.value === undefined)
const resolvedCoreProfile = computed(() => coreProfile.value ?? null)
const resolvedAppProfile = computed(() => appProfile.value ?? null)

const userCard = computed(() => userToCard(user.value))
const appCard = computed(() => appToCard(app.value))
</script>
