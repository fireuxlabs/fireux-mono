<!-- packages/tenants/fireux-misebox/src/runtime/pages/dashboard/chef-profile.vue -->
<template>
  <LayoutsDashboardEditStructure
    title="Chef Profile"
    description="Edit your chef identity and tenant-specific context."
    :dev-data="chefRecord"
  >
    <UPageCard v-if="currentChefProfileCard && chefRecord" variant="subtle">
      <div class="grid gap-6 lg:grid-cols-2">
        <div class="space-y-4">
          <div class="grid gap-4 sm:grid-cols-2">
            <OrganismsProfilesChefCardsPill
              v-if="currentChefPill"
              :chef="currentChefPill"
            />
            <OrganismsProfilesChefCardsCell
              v-if="currentChefCell"
              :chef="currentChefCell"
            />
          </div>

          <OrganismsProfilesChefCardsProfile :chef="currentChefProfileCard" />
        </div>

        <OrganismsProfilesChefEdit :chef="chefRecord" />
      </div>
    </UPageCard>

    <UCard v-else>
      <p class="fallback">error</p>
    </UCard>
  </LayoutsDashboardEditStructure>
</template>

<script setup lang="ts">
// Nuxt macro type hint for package-level typecheck
declare function definePageMeta(meta: any): void
import { computed } from 'vue'
import type { Chef } from '../../models/profiles/Chef.model'
import { useChef } from '../../composables/firestore/profiles/Chef/useChef'

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

const {
  coreProfile,
  appProfile,
  activeProfile,
  pillProps,
  cellProps,
  profileProps,
} = useChef()

const hasChefProfile = computed(() => Boolean(activeProfile.value))

const currentChefPill = computed(() =>
  hasChefProfile.value ? pillProps(activeProfile.value ?? undefined) : null
)
const currentChefCell = computed(() =>
  hasChefProfile.value ? cellProps(activeProfile.value ?? undefined) : null
)
const currentChefProfileCard = computed(() =>
  hasChefProfile.value ? profileProps(activeProfile.value ?? undefined) : null
)

const chefRecord = computed<Chef | null>(() => {
  const active = activeProfile.value
  if (!active) return null
  const displayName =
    active.display_name ?? active.title ?? active.subtitle ?? 'Chef'
  return {
    id: active.id,
    display_name: displayName,
    avatar: active.avatar ?? active.avatar_url ?? undefined,
    core: coreProfile.value,
    app: (appProfile.value as any) ?? null,
  }
})
</script>

<style scoped>
.fallback {
  margin: 0;
  padding: 1.5rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.875rem;
}
</style>
