<template>
  <UPageCTA
    class="cta"
    title="Professional profile"
    :description="ctaDescription"
    variant="subtle"
    orientation="horizontal"
  >
    <div v-if="hasProfile && profileCard" class="cta__body space-y-4">
      <ProfilesProfessionalCardsPreview v-bind="profileCard" :link="false" />

      <div class="flex flex-wrap gap-2">
        <UButton color="primary" @click="openProfile">View profile</UButton>
        <UButton color="neutral" variant="soft" @click="openConsole">Manage profile</UButton>
      </div>
    </div>

    <div v-else class="cta__body space-y-2">
      <ProfilesProfessionalCreateSystem />
    </div>
  </UPageCTA>
</template>

<script setup lang="ts">
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useProfessional } from '../../../../composables/fireux/firestore/profiles/Professional/useProfessional'

const router = useRouter()
const { interface: professionalInterface } = useProfessional()
const { appName } = useFireUXConfig()

const profileCard = computed(() => professionalInterface())
const hasProfile = computed(() => Boolean(profileCard.value?.id))
const ctaDescription = computed(() =>
  hasProfile.value
    ? `Your professional profile is live on ${appName}.`
    : 'Create your professional profile so agents can find and invite you.'
)

const openProfile = () => {
  const to = String(profileCard.value?.to || '').trim()
  if (!to) return
  router.push(to)
}

const openConsole = () => {
  router.push('/dashboard/professional/profile')
}
</script>
