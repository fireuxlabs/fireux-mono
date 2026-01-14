<template>
  <UPageCTA
    title="Agent profile"
    description="Add an agent profile to your FireUX portfolio so talent knows who is hiring."
    variant="naked"
  >
    <template #default>
      <div v-if="!hasAgentProfile" class="space-y-2">
        <OrganismsProfilesAgentCreateSystem />
      </div>

      <div v-else-if="!profileCard" class="space-y-2">
        <OrganismsProfilesAgentCreateSystem />
      </div>

      <div v-else class="space-y-4">
        <div class="flex justify-end">
          <UButton v-if="canToggle" size="xs" variant="ghost" @click="toggleView">
            {{ view === 'preview' ? 'Profile' : 'Preview' }}
          </UButton>
        </div>

        <div class="space-y-4">
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

      <component
        :is="DevJson"
        v-if="showDebug && DevJson"
        title="Agent CTA Debug"
        :data="debugPayload"
      />
    </template>
  </UPageCTA>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, ref, watch } from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth.ts'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser.ts'
import { useAgent } from '../../../../composables/fireux/firestore/profiles/Agent/useAgent.ts'

const DevJson = defineAsyncComponent(() =>
  import('fireux-core/runtime/components/dev/DevJson.vue')
)

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

