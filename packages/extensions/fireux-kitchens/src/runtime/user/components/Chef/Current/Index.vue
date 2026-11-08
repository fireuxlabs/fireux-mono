<template>
  <section data-entity-cta-family="profile-managed">
    <div v-if="hasProfile && profileCard">
      <ChefCardsPreview v-if="profileCard" v-bind="profileCard" :link="false" />

      <div>
        <UButton v-if="profileTo" color="primary" :to="profileTo">
          View profile
        </UButton>
        <UButton color="neutral" variant="soft" to="/dashboard/chef/profile">
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
      <ChefCreate />
    </UPageCTA>
  </section>
</template>

<script setup lang="ts">
import { useUserSession } from 'fireux-core/runtime/user/composables/session/useUserSession'

import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { computed } from 'vue'
import { useChef } from '../../../composables/chef/useChef'

const { appName } = useFireUXConfig()
const { user } = useUserSession()
const { pill: chefInterface } = useChef()

const profileCard = computed(() => chefInterface())
const hasProfile = computed(() => Boolean(profileCard.value?.id))
const profileTo = computed(() => String(profileCard.value?.to || '').trim())
const userName = computed(() => String(user.value?.display_name || '').trim())
const createTitle = computed(() =>
  userName.value
    ? `Hi ${userName.value}, you are in the right place to create your chef profile`
    : 'Create your chef profile'
)
const ctaDescription = computed(() =>
  hasProfile.value
    ? `Your chef profile is live on ${appName}.`
    : 'Set up your chef profile so kitchens and venues can find you.'
)
</script>
