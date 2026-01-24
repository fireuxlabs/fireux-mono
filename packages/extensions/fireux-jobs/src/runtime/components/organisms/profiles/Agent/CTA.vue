<template>
  <UPageCTA
    class="fx-cta"
    title="Agent profile"
    description="Add an agent profile to your FireUX portfolio so talent knows who is hiring."
    variant="naked"
  >
    <template #default>
      <div v-if="!hasAgentProfile" class="fx-cta__body space-y-2">
        <OrganismsProfilesAgentCreateSystem />
      </div>

      <div v-else-if="!profileCard" class="fx-cta__body space-y-2">
        <OrganismsProfilesAgentCreateSystem />
      </div>

      <div v-else class="fx-cta__body space-y-4">
        <div class="fx-cta__toolbar flex justify-end">
          <UButton v-if="canToggle" size="xs" variant="ghost" @click="toggleView">
            {{ view === 'preview' ? 'Profile' : 'Preview' }}
          </UButton>
        </div>

        <div class="fx-cta__panel space-y-4">
          <OrganismsProfilesAgentCardsPreview
            v-if="view === 'preview' && profileCard"
            :card="profileCard"
          />
          <OrganismsProfilesAgentCardsProfile
            v-else-if="profileCard"
            :card="profileCard"
          />
        </div>
      </div>

      <pre v-if="showDebug" class="text-xs text-muted">{{ debugPayload }}</pre>
    </template>
  </UPageCTA>
</template>

<script setup lang="ts">
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth.ts'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser.ts'
import { computed, ref, watch } from 'vue'
import { useAgent } from '../../../../composables/fireux/firestore/profiles/Agent/useAgent.ts'

const { coreProfile, card } = useAgent()
const { uid } = useAuth()
const { user, coreUser, hasProfile } = useUser()

const hasAgentProfile = computed(() => hasProfile('agent'))

const profileCard = computed(() => (coreProfile.value ? card(coreProfile.value) : null))

const canToggle = computed(() => Boolean(profileCard.value))
type View = 'preview' | 'profile'
const view = ref<View>('preview')

const toggleView = () => {
  if (!canToggle.value) return
  view.value = view.value === 'preview' ? 'profile' : 'preview'
}

watch(canToggle, (enabled: boolean) => {
  if (!enabled) view.value = 'preview'
})

const showDebug = import.meta.dev
const debugPayload = computed(() => {
  return {
    authUid: uid.value ?? null,
    userId: user.value?.id ?? null,
    profiles: coreUser.value?.profiles ?? null,
    hasAgentProfile: hasAgentProfile.value,
    hasProfileCard: Boolean(profileCard.value),
    view: view.value,
  }
})
</script>

