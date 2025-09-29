<template>
  <UContainer>
    <div v-if="!coreUser">Loading user...</div>
    <div v-else-if="hasProfile('chef')">
      <div v-if="chef">
        <OrganismsProfilesChefCardsPill :chef="chef" />
      </div>
      <div v-else>Loading chef profile...</div>
    </div>
    <div v-else>No chef found</div>
  </UContainer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUser } from 'fireux-core/runtime/composables/firestore/user/useUser'
import { useProfile } from 'fireux-core/runtime/composables/firestore/profiles/useProfile'
import { chefConfig } from '../../models/profiles/Chef.model'

const { user } = useUser()
const coreUser = computed(() => user.value?.core)
const hasProfile = (profileType: string) => {
  const app = user.value?.app
  if (!app) return false
  const list = Array.isArray(app.app_profiles) ? app.app_profiles : []
  return profileType ? list.includes(profileType) : !!app
}
const { profile } = useProfile(chefConfig)
const chef = computed(() => profile.value)
</script>
