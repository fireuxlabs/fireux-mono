<template>
  <ProfileCta
    title="Agent profile"
    :description="ctaDescription"
    :has-profile="hasProfile"
    :profile-to="profileTo"
    manage-to="/dashboard/agent/profile"
  >
    <template #profile>
      <AgentCardsPreview v-if="profileCard" v-bind="profileCard" :link="false" />
    </template>

    <template #create>
      <AgentCreateSystem />
    </template>
  </ProfileCta>
</template>

<script setup lang="ts">
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { computed } from 'vue'
import { useAgent } from '../../composables/fireux/firestore/profiles/Agent/useAgent'

const { appName } = useFireUXConfig()
const { pill: agentInterface } = useAgent()

const profileCard = computed(() => agentInterface())
const hasProfile = computed(() => Boolean(profileCard.value?.id))
const profileTo = computed(() => String(profileCard.value?.to || '').trim())
const ctaDescription = computed(() =>
  hasProfile.value
    ? `Your agent profile is live on ${appName}.`
    : 'Create your agent profile from your user profile so professionals know who to contact.'
)
</script>
