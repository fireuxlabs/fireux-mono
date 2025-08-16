<template>
  <UContainer>
    <div v-if="!appUser">Loading...</div>
    <div v-else-if="hasProfile('chef')">
      <MiseOrganismsProfilesChefCardsPill :chef="appUser" />
    </div>
    <div v-else>No chef found</div>
  </UContainer>
</template>

<script setup lang="ts">
import { useAppUser } from '../../../../../../core/fireux-core/src/runtime/composables/firestore/AppUser/useAppUser'

const { appUser, hasProfile } = await useAppUser()
</script>
