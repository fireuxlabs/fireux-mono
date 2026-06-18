<template>
  <ProfileCta
    title="Professional profile"
    :description="ctaDescription"
    :has-profile="hasProfile"
    :profile-to="profileTo"
    manage-to="/dashboard/professional/profile"
  >
    <template #profile>
      <ProfessionalCardsPreview
        v-if="profileCard"
        v-bind="profileCard"
        :link="false"
      />
    </template>

    <template #create>
      <ProfessionalCreateSystem />
    </template>
  </ProfileCta>
</template>

<script setup lang="ts">
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { computed } from 'vue'
import { useProfessional } from '../../composables/fireux/firestore/profiles/Professional/useProfessional'

const { pill: professionalInterface } = useProfessional()
const { appName } = useFireUXConfig()

const profileCard = computed(() => professionalInterface())
const hasProfile = computed(() => Boolean(profileCard.value?.id))
const profileTo = computed(() => String(profileCard.value?.to || '').trim())
const ctaDescription = computed(() =>
  hasProfile.value
    ? `Your professional profile is live on ${appName}.`
    : 'Create your professional profile from your user profile so agents can find and invite you.'
)
</script>
