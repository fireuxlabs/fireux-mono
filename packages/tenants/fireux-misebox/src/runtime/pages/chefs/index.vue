<template>
  <div class="page space-y-4">
    <!-- CTAs -->
    <OrganismsUserCoreCTA v-if="!coreUser" />
    <template v-else>
      <OrganismsUserAppCTA v-if="role === 'tenant' && !appUser" />
      <OrganismsProfilesChefCTA />
    </template>

    <!-- Profiles via reusable Root -->
    <OrganismsProfileRoot :config="chefConfig">
      <template #profile-pill="{ profile, navigate }">
        <OrganismsProfilesChefCardsPill
          class="cursor-pointer"
          :chef="profile"
          @click="navigate(profile)"
        />
      </template>

      <template #profile-card="{ profile, navigate }">
        <OrganismsProfilesChefCardsProfile
          class="cursor-pointer"
          :chef="profile"
          @click="navigate(profile)"
        />
      </template>

      <template #profile-item="{ profile, navigate }">
        <OrganismsProfilesChefCardsCell
          class="cursor-pointer"
          :chef="profile"
          @click="navigate(profile)"
        />
      </template>
    </OrganismsProfileRoot>
  </div>
</template>

<script setup lang="ts">
import { chefConfig } from '../../models/profiles/Chef.model'
import { useApp } from 'fireux-core/runtime/composables/app/useApp'
import { useCoreUser } from 'fireux-core/runtime/composables/firestore/CoreUser/useCoreUser'
import { useAppUser } from 'fireux-core/runtime/composables/firestore/AppUser/useAppUser'

const { role } = useApp() // 'global' | 'tenant'
const { coreUser } = useCoreUser()
const { appUser } = useAppUser()
</script>