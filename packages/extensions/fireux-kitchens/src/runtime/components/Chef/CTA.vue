<template>
  <ProfileCta
    title="Chef profile"
    :description="ctaDescription"
    :has-profile="hasProfile"
    :profile-to="profileTo"
    manage-to="/dashboard/chef/profile"
  >
    <template #profile>
      <ChefCardsPreview v-if="profileCard" v-bind="profileCard" :link="false" />
    </template>

    <template #create>
      <ChefCreateSystem />
    </template>
  </ProfileCta>
</template>

<script setup lang="ts">
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { computed } from 'vue'
import { useChef } from '../../composables/fireux/firestore/profiles/Chef/useChef'

const { appName } = useFireUXConfig()
const { pill: chefInterface } = useChef()

const profileCard = computed(() => chefInterface())
const hasProfile = computed(() => Boolean(profileCard.value?.id))
const profileTo = computed(() => String(profileCard.value?.to || '').trim())
const ctaDescription = computed(() =>
  hasProfile.value
    ? `Your chef profile is live on ${appName}.`
    : 'Create your chef profile from your user profile so kitchens and venues can find you.'
)
</script>
