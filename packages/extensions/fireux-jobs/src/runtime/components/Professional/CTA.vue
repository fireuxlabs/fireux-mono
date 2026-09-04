<template>
  <section data-entity-cta-family="profile-managed" class="space-y-4">
    <div v-if="hasProfile && profileCard" class="space-y-4">
      <ProfessionalCardsPreview
        v-if="profileCard"
        v-bind="profileCard"
        :link="false"
      />

      <div class="flex flex-wrap gap-2">
        <UButton v-if="profileTo" color="primary" :to="profileTo">
          View profile
        </UButton>
        <UButton
          color="neutral"
          variant="soft"
          to="/dashboard/professional/profile"
        >
          Manage profile
        </UButton>
      </div>
    </div>

    <UPageCTA
      v-else
      class="cta"
      :title="createTitle"
      :description="ctaDescription"
      variant="soft"
      orientation="horizontal"
    >
      <ProfessionalCreateSystem />
    </UPageCTA>
  </section>
</template>

<script setup lang="ts">
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useUser } from 'fireux-core/runtime/user/composables/useUser'
import { computed } from 'vue'
import { useProfessional } from '../../composables/fireux/firestore/profiles/Professional/useProfessional'

const { pill: professionalInterface } = useProfessional()
const { appName } = useFireUXConfig()
const { currentUser } = useUserSession()

const profileCard = computed(() => professionalInterface())
const hasProfile = computed(() => Boolean(profileCard.value?.id))
const profileTo = computed(() => String(profileCard.value?.to || '').trim())
const userName = computed(() => String(currentUser.value?.display_name || '').trim())
const createTitle = computed(() =>
  userName.value
    ? `Hi ${userName.value}, you are in the right place to create your professional profile`
    : 'Create your professional profile'
)
const ctaDescription = computed(() =>
  hasProfile.value
    ? `Your professional profile is live on ${appName}.`
    : 'Set up your professional profile so agents can find and invite you.'
)
</script>
