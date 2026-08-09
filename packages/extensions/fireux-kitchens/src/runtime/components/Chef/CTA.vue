<template>
  <section data-entity-cta-family="profile-managed" class="space-y-4">
    <div v-if="hasProfile && profileCard" class="space-y-4">
      <ChefCardsPreview v-if="profileCard" v-bind="profileCard" :link="false" />

      <div class="flex flex-wrap gap-2">
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
      <ChefCreateSystem />
    </UPageCTA>
  </section>
</template>

<script setup lang="ts">
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useUser } from 'fireux-core/runtime/composables/fireux/user/useUser'
import { computed } from 'vue'
import { useChef } from '../../composables/fireux/chef/useChef'

const { appName } = useFireUXConfig()
const { currentUser } = useUser()
const { pill: chefInterface } = useChef()

const profileCard = computed(() => chefInterface())
const hasProfile = computed(() => Boolean(profileCard.value?.id))
const profileTo = computed(() => String(profileCard.value?.to || '').trim())
const userName = computed(() => String(currentUser.value?.display_name || '').trim())
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
