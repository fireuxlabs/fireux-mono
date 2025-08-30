<template>
  <UContainer>
    <div v-if="!coreUser">Loading user...</div>
    <div v-else-if="hasProfile('chef')">
      <div v-if="chef">
        <MiseOrganismsProfilesChefCardsPill :chef="chef" />
      </div>
      <div v-else>Loading chef profile...</div>
    </div>
    <div v-else>No chef found</div>
  </UContainer>
</template>

<script setup lang="ts">
import { useCoreUser } from 'fireux-core/runtime/composables/firestore/CoreUser/useCoreUser'
import { useProfile } from 'fireux-core/runtime/composables/firestore/profiles/useProfile'
import { chefConfig } from '../../models/profiles/Chef.model'

const { coreUser, hasProfile } = await useCoreUser()
const { current: chef } = await useProfile(chefConfig)
</script>
