<!-- FILE: packages/ecosystem/fireux-misebox/src/runtime/pages/dashboard/chef/profile.vue -->
<template>
  <UDashboardPanel id="console-chef-profile">
    <template #header>
      <LayoutsDashboardNavbar :title="navTitle">
        <template #right>
          <UButton
            :icon="viewIcon"
            size="sm"
            variant="ghost"
            color="neutral"
            :aria-pressed="view === 'profile'"
            @click="toggleView"
          />
        </template>
      </LayoutsDashboardNavbar>
    </template>

    <template #body>
      <div class="console-profile">
        <div class="console-profile__pills">
          <ProfilesChefCardsPill
            v-if="chefCard"
            v-bind="chefCard"
            :link="Boolean(chefCard.to)"
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
          <div v-if="view === 'profile'" class="console-profile__section">
            <ProfilesChefCardsProfile
              v-if="chefCard"
              :card="chefCard"
              :profile="resolvedCoreProfile"
            />
          </div>

          <div v-else class="console-profile__section">
            <ProfilesChefEditCore :chef="resolvedCoreProfile" />

            <ProfilesChefEditApp
              v-if="resolvedAppProfile"
              :chef="resolvedAppProfile"
            />
          </div>
        </ClientOnly>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { useConsoleProfileView } from 'fireux-core/runtime/composables/fireux/app/ui/useConsoleProfileView'
import { useProfileEnsure } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/mutations/useProfileEnsure'
import { chefConfig } from 'fireux-kitchens/runtime/composables/fireux/firestore/profiles/Chef/config/chefConfig'
import { computed, ref } from 'vue'
import { useChef } from '../../../composables/fireux/firestore/profiles/Chef/useChef'

const profileKey = chefConfig.id ?? 'chef'
const navLabel = chefConfig.navLabel ?? `${chefConfig.profileType} Profile`
const navIcon = chefConfig.navIcon ?? 'i-lucide-chef-hat'
const navTitle = navLabel

definePageMeta({
  layout: 'dashboard',
  nav: {
    visibility: { modules: ['fireux-kitchens'] },
    key: 'console-chef-profile',
    label: navLabel,
    icon: navIcon,
    desktop: true,
    layouts: ['dashboard'],
    group: 'profiles',
    profileId: profileKey,
  },
  requiresAuth: true,
})

const { coreProfile, appProfile, interface: chefCardFromProfile } = useChef()

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

const chefCard = computed(() => chefCardFromProfile(resolvedCoreProfile.value))

const { view, viewIcon, toggleView } = useConsoleProfileView()
</script>
