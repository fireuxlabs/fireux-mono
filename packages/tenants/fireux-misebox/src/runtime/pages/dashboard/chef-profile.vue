packages/tenants/fireux-misebox/src/runtime/pages/dashboard/chef-profile.vue
<template>
  <DashboardEditStructure
    title="Chef Profile"
    description="Edit your chef identity and tenant-specific context."
    :hero="hero"
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
      <div class="empty-state">
        <UIcon name="i-lucide-chef-hat" class="empty-icon" />
        <h3 class="empty-title">Create your chef profile</h3>
        <p class="empty-copy">
          Set up your chef presence to appear in Misebox directories and menus.
        </p>
        <UButton color="primary" :loading="creating" @click="onEnsure">
          Create Chef Profile
        </UButton>
      </div>
    </UCard>
  </DashboardEditStructure>
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
  createChef,
} = useChef()

const currentChef = activeProfile
const currentChefPill = computed(() =>
  currentChef.value ? pillProps(currentChef.value) : null
)
const currentChefCell = computed(() =>
  currentChef.value ? cellProps(currentChef.value) : null
)
const currentChefProfileCard = computed(() =>
  currentChef.value ? profileProps(currentChef.value) : null
)

const chefRecord = computed<Chef | null>(() => {
  const active = currentChef.value
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

const hero = computed(() => {
  const cell = currentChefCell.value
  if (!cell) return null
  const pill = currentChefPill.value
  return {
    pillComponent: pill ? 'OrganismsProfilesChefCardsPill' : undefined,
    pillProps: pill ? { chef: pill } : null,
    pillClass: null,
    cellComponent: 'OrganismsProfilesChefCardsCell',
    cellProps: { chef: cell },
  }
})

const creating = createChef.state
const onEnsure = async () => {
  await createChef()
}
</script>

<style scoped>
.empty-state {
  display: grid;
  gap: 0.75rem;
  padding: 2.5rem 1rem;
  text-align: center;
  justify-items: center;
}

.empty-icon {
  width: 3rem;
  height: 3rem;
  color: var(--ui-text-300, rgba(148, 163, 184, 0.9));
}

.empty-title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
}

.empty-copy {
  margin: 0;
  color: var(--ui-text-500, rgba(100, 116, 139, 0.95));
  max-width: 26rem;
}
</style>
