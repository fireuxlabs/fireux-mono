<template>
  <section data-entity-cta-family="profile-managed" class="space-y-4">
    <div v-if="hasProfile && profileCard" class="space-y-4">
      <AgentCardsSummary
        v-if="profileCard"
        v-bind="profileCard"
        :link="false"
      />

      <div class="flex flex-wrap gap-2">
        <UButton v-if="profileTo" color="primary" :to="profileTo">
          View profile
        </UButton>
        <UButton color="neutral" variant="soft" to="/dashboard/agent/profile">
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
      <AgentCreate />
    </UPageCTA>
  </section>
</template>

<script setup lang="ts">
import { useUserSession } from 'fireux-core/runtime/user/composables/session/useUserSession'

import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { computed } from 'vue'
import { useAgent } from '../../../composables/profiles/Agent/useAgent'

const { appName } = useFireUXConfig()
const { currentUser } = useUserSession()
const { pill: agentInterface } = useAgent()

const profileCard = computed(() => agentInterface())
const hasProfile = computed(() => Boolean(profileCard.value?.id))
const profileTo = computed(() => String(profileCard.value?.to || '').trim())
const userName = computed(() =>
  String(currentUser.value?.display_name || '').trim()
)
const createTitle = computed(() =>
  userName.value
    ? `Hi ${userName.value}, you are in the right place to create your hiring profile`
    : 'Create your hiring profile'
)
const ctaDescription = computed(() =>
  hasProfile.value
    ? `Your hiring profile is live on ${appName}.`
    : 'Set up your hiring profile so professionals know who to contact.'
)
</script>
