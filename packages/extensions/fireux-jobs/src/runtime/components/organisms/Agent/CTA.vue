<template>
  <UPageCTA
    class="cta"
    title="Agent profile"
    :description="ctaDescription"
    variant="subtle"
    orientation="horizontal"
  >
    <div v-if="hasProfile && profileCard" class="cta__body space-y-4">
      <ProfilesAgentCardsPreview v-bind="profileCard" :link="false" />

      <div class="flex flex-wrap gap-2">
        <UButton color="primary" @click="openProfile">View profile</UButton>
        <UButton color="neutral" variant="soft" @click="openConsole">Manage profile</UButton>
      </div>
    </div>

    <div v-else class="cta__body space-y-2">
      <ProfilesAgentCreateSystem />
    </div>
  </UPageCTA>
</template>

<script setup lang="ts">
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAgent } from '../../../composables/fireux/firestore/profiles/Agent/useAgent'

const router = useRouter()
const { appName } = useFireUXConfig()
const { pill: agentInterface } = useAgent()

const profileCard = computed(() => agentInterface())
const hasProfile = computed(() => Boolean(profileCard.value?.id))
const ctaDescription = computed(() =>
  hasProfile.value
    ? `Your agent profile is live on ${appName}.`
    : 'Create your agent profile so professionals know who to contact.'
)

const openProfile = () => {
  const to = String(profileCard.value?.to || '').trim()
  if (!to) return
  router.push(to)
}

const openConsole = () => {
  router.push('/dashboard/agent/profile')
}
</script>
