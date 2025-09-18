<template>
  <div class="page space-y-4">
    <!-- CTAs -->
    <OrganismsUserCoreCTA v-if="!coreUser" />
    <template v-else>
      <OrganismsUserAppCTA v-if="role === 'tenant' && !appUser" />
      <OrganismsProfilesEmployerCTA />
    </template>

    <!-- Profiles via reusable Root -->
    <OrganismsProfileRoot :config="employerConfig">
      <template #profile-pill="{ profile, navigate }">
        <OrganismsProfilesEmployerCardsPill
          class="cursor-pointer"
          :employer="profile"
          @click="navigate(profile)"
        />
      </template>

      <template #profile-card="{ profile, navigate }">
        <OrganismsProfilesEmployerCardsProfile
          class="cursor-pointer"
          :employer="profile"
          @click="navigate(profile)"
        />
      </template>

      <template #profile-item="{ profile, navigate }">
        <OrganismsProfilesEmployerCardsCell
          class="cursor-pointer"
          :employer="profile"
          @click="navigate(profile)"
        />
      </template>
    </OrganismsProfileRoot>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { employerConfig } from '../../models/profiles/Employer.model'
import { useApp } from 'fireux-core/runtime/composables/app/useApp'
import { useUser } from 'fireux-core/runtime/composables/firestore/user/useUser'

const { role } = useApp()
const { user } = useUser()
const coreUser = computed(() => user.value?.core)
const appUser = computed(() => user.value?.app)
</script>
