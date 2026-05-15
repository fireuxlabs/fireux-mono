<template>
  <section class="console-profile__section">
    <div class="console-profile__pills">
      <ProfilesProfessionalCardsPill
        v-if="professionalCard"
        v-bind="professionalCard"
        :link="Boolean(professionalCard.to)"
        class="block"
      />
    </div>

    <UPageCard v-if="isProfileLoading" variant="subtle">
      <p class="text-sm text-dimmed">Loading profile…</p>
    </UPageCard>

    <UPageCard
      v-else-if="!resolvedCoreProfile"
      title="Professional profile not available"
      description="Your professional profile has not been created yet."
      variant="subtle"
    >
      <UButton
        :label="professionalConfig.cta || 'Create Professional profile'"
        color="neutral"
        :loading="isCreating"
        @click="createProfile"
      />

      <p v-if="createError" class="mt-3 text-sm text-dimmed">
        {{ createError }}
      </p>
    </UPageCard>

    <ClientOnly v-else>
      <ProfilesProfessionalCardsProfile
        v-if="professionalProfileView"
        :model="professionalProfileView"
      />
    </ClientOnly>
  </section>
</template>

<script setup lang="ts">
import { useProfileEnsure } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/mutations/useProfileEnsure'
import { professionalConfig } from 'fireux-jobs/runtime/composables/fireux/firestore/profiles/Professional/config/professionalConfig'
import { computed, ref } from 'vue'
import { useProfessional } from '../../../composables/fireux/firestore/profiles/Professional/useProfessional'
import { useProfessionalProfileView } from '../../../composables/fireux/firestore/profiles/Professional/utils/view/useProfessionalProfileView'

const { coreProfile, profile: professionalCardFromProfile } = useProfessional()
const { ensure } = useProfileEnsure(professionalConfig)

const isCreating = ref(false)
const createError = ref<string | null>(null)

const isProfileLoading = computed(() => coreProfile.value === undefined)
const resolvedCoreProfile = computed(() => coreProfile.value ?? null)
const professionalCard = computed(() =>
  professionalCardFromProfile(resolvedCoreProfile.value)
)
const { model: professionalProfileView } = useProfessionalProfileView(
  resolvedCoreProfile,
  professionalCard
)

const createProfile = async () => {
  if (isCreating.value) return

  isCreating.value = true
  createError.value = null

  try {
    const result = await ensure()
    if (result.coreProfile) {
      coreProfile.value = result.coreProfile as any
    }
  } catch (error) {
    createError.value = (error as Error)?.message || 'Failed to create profile.'
  } finally {
    isCreating.value = false
  }
}
</script>
