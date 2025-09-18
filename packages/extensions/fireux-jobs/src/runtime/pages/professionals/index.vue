<template>
  <div class="page space-y-4">
    <!-- CTAs -->
    <OrganismsUserCoreCTA v-if="!coreUser" />
    <template v-else>
      <OrganismsUserAppCTA v-if="role === 'tenant' && !appUser" />
      <OrganismsProfilesProfessionalCTA />
    </template>

    <!-- Profiles via reusable Root -->
    <OrganismsProfileRoot :config="professionalConfig">
      <template #profile-pill="{ profile, navigate }">
        <OrganismsProfilesProfessionalCardsPill
          class="cursor-pointer"
          :professional="profile"
          @click="navigate(profile)"
        />
      </template>

      <template #profile-card="{ profile, navigate }">
        <OrganismsProfilesProfessionalCardsProfile
          class="cursor-pointer"
          :professional="profile"
          @click="navigate(profile)"
        />
      </template>

      <template #profile-item="{ profile, navigate }">
        <OrganismsProfilesProfessionalCardsCell
          class="cursor-pointer"
          :professional="profile"
          @click="navigate(profile)"
        />
      </template>
    </OrganismsProfileRoot>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { professionalConfig } from '../../models/profiles/Professional.model'
import { useApp } from 'fireux-core/runtime/composables/app/useApp'
import { useUser } from 'fireux-core/runtime/composables/firestore/user/useUser'

const { role } = useApp()
const { user } = useUser()
const coreUser = computed(() => user.value?.core)
const appUser = computed(() => user.value?.app)
</script>
