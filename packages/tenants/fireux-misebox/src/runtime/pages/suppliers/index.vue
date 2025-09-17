<template>
  <div class="page space-y-4">
    <!-- CTAs -->
    <OrganismsUserCoreCTA v-if="!coreUser" />
    <template v-else>
      <OrganismsUserAppCTA v-if="role === 'tenant' && !appUser" />
      <OrganismsProfilesSupplierCTA />
    </template>

    <!-- Profiles via reusable Root -->
    <OrganismsProfileRoot :config="supplierConfig">
      <template #profile-pill="{ profile, navigate }">
        <OrganismsProfilesSupplierCardsPill
          class="cursor-pointer"
          :supplier="profile"
          @click="navigate(profile)"
        />
      </template>

      <template #profile-card="{ profile, navigate }">
        <OrganismsProfilesSupplierCardsProfile
          class="cursor-pointer"
          :supplier="profile"
          @click="navigate(profile)"
        />
      </template>

      <template #profile-item="{ profile, navigate }">
        <OrganismsProfilesSupplierCardsCell
          class="cursor-pointer"
          :supplier="profile"
          @click="navigate(profile)"
        />
      </template>
    </OrganismsProfileRoot>
  </div>
</template>

<script setup lang="ts">
import { supplierConfig } from '../../models/profiles/Supplier.model'
import { useApp } from 'fireux-core/runtime/composables/app/useApp'
import { useCoreUser } from 'fireux-core/runtime/composables/firestore/CoreUser/useCoreUser'
import { useAppUser } from 'fireux-core/runtime/composables/firestore/AppUser/useAppUser'

const { role } = useApp()
const { coreUser } = useCoreUser()
const { appUser } = useAppUser()
</script>
