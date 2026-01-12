<!-- FILE: packages/ecosystem/fireux-misebox/src/runtime/pages/dashboard/chef/profile.vue -->
<template>
  <UDashboardPanel id="dashboard-chef-profile">
    <template #header>
      <UDashboardNavbar title="Chef Profile">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="px-0 py-0 sm:px-4 sm:py-4 lg:px-6 space-y-6">
        <UCard v-if="isProfileLoading">
          <div class="fallback loading">Chef profile data is loading.</div>
        </UCard>

        <UCard v-else-if="!resolvedCoreProfile">
          <div class="fallback">
            <p class="mb-4">Your chef profile hasn’t been created yet.</p>

            <UButton
              :label="chefConfig.cta || 'Create Chef profile'"
              color="neutral"
              :loading="isCreating"
              @click="createProfile"
            />

            <p v-if="createError" class="mt-3 text-sm text-dimmed">
              {{ createError }}
            </p>
          </div>
        </UCard>

        <ClientOnly v-else>
          <LayoutsDashboardProfileEdit class="grid gap-6 lg:grid-cols-2">
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
import { computed, ref } from 'vue'
import LayoutsDashboardProfileEdit from 'fireux-core/runtime/components/layouts/dashboard/ProfileEdit.vue'
import { useChef } from '../../../composables/fireux/firestore/profiles/Chef/useChef'
import { useProfileEnsure } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/mutations/useProfileEnsure'
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
</script>

<style scoped>
.fallback {
  margin: 0;
  padding: 1.5rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.875rem;
}

.loading {
  text-transform: none;
  letter-spacing: normal;
  font-size: 0.875rem;
  opacity: 0.7;
}
</style>
