<template>
  <UPageCTA
    class="cta"
    title="Professional profile"
    description="Add a professional profile to your FireUX portfolio so agents can discover you more easily."
    variant="naked"
  >
    <template #default>
      <div v-if="!hasProfessionalProfile" class="cta__body space-y-2">
        <OrganismsProfilesProfessionalCreateSystem />
      </div>

      <div v-else-if="!profileCard" class="cta__body space-y-2">
        <OrganismsProfilesProfessionalCreateSystem />
      </div>

      <div v-else class="cta__body space-y-4">
        <div class="cta__toolbar flex justify-end">
          <UButton v-if="canToggle" size="xs" variant="ghost" @click="toggleView">
            {{ view === 'preview' ? 'Profile' : 'Preview' }}
          </UButton>
        </div>

        <div class="cta__panel space-y-4">
          <OrganismsProfilesProfessionalCardsPreview
            v-if="view === 'preview' && profileCard"
            :card="profileCard"
          />
          <OrganismsProfilesProfessionalCardsProfile
            v-else-if="profileCard"
            :card="profileCard"
            :profile="coreProfile"
            :computed="professionalComputed"
          />
        </div>
      </div>

      <pre v-if="showDebug" class="text-xs text-muted">{{ debugPayload }}</pre>
    </template>
  </UPageCTA>
</template>

<script setup lang="ts">
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth.ts'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'
import { computed, ref, watch } from 'vue'
import { useProfessional } from '../../../../composables/fireux/firestore/profiles/Professional/useProfessional'

const { coreProfile, card, computed: professionalComputed } = useProfessional()
const { uid } = useAuth()
const { user, coreUser, hasProfile } = useUser()

const hasProfessionalProfile = computed(() => hasProfile('professional'))

const profileCard = computed(() =>
  coreProfile.value ? card(coreProfile.value) : null
)

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
    hasProfessionalProfile: hasProfessionalProfile.value,
    hasProfileCard: Boolean(profileCard.value),
    view: view.value,
  }
})
</script>

