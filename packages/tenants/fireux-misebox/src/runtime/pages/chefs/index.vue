<template>
  <div class="page">
    <!-- Core identity CTA (only if no core user) -->
    <OrganismsUserCoreCTA v-if="!coreUser" />

    <!-- App membership CTA (only if tenant and no appUser yet) -->
    <OrganismsUserAppCTA v-if="appTenancy === 'tennant' && !appUser" />

    <!-- Chef CTA (only if signed in and member of app) -->
    <OrganismsProfilesChefCTA
      v-if="coreUser && (appTenancy !== 'tennant' || appUser)"
    />

    <!-- Profiles list -->
    <OrganismsProfileRoot :config="chefConfig">
      <template #profile-pill="{ profile }">
        <div @click="navigateToChef(profile)" class="cursor-pointer">
          <OrganismsProfilesChefCardsPill :chef="profile" />
        </div>
      </template>

      <template #profile-card="{ profile }">
        <div @click="navigateToChef(profile)" class="cursor-pointer">
          <OrganismsProfilesChefCardsProfile :chef="profile" />
        </div>
      </template>

      <template #profile-item="{ profile }">
        <div @click="navigateToChef(profile)" class="cursor-pointer">
          <OrganismsProfilesChefCardsCell :chef="profile" />
        </div>
      </template>
    </OrganismsProfileRoot>
  </div>
</template>

<script setup lang="ts">
import { chefConfig } from '../../models/profiles/Chef.model'

// ✅ core composables are auto-imported by fireux-core
const { appTenancy } = useApp()
const { coreUser } = useCoreUser()
const { appUser } = useAppUser()

const navigateToChef = (chef: any) => {
  // New model uses `id` (== uid)
  if (chef?.id) navigateTo(`/chefs/${chef.id}`)
}

definePageMeta({
  title: 'Browse Chefs',
  description: 'Find talented chefs for your kitchen needs',
})
</script>
