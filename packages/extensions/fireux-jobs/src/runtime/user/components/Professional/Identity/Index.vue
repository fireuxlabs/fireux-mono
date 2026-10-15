<template>
  <section class="workspace-profile__section">
    <div class="workspace-profile__pills">
      <ProfessionalCardsPill
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
      v-else-if="!resolvedProfile"
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
      <ProfessionalCardsProfile
        v-if="professionalProfileView"
        :model="professionalProfileView"
      />
    </ClientOnly>
  </section>
</template>

<script setup lang="ts">
import { useProfileCreate } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/mutations/useProfileCreate'
import { professionalConfig } from '../../../composables/profiles/Professional/config/professionalConfig'
import { computed, ref, watch } from 'vue'
import { useProfessional } from '../../../composables/profiles/Professional/useProfessional'
import { useProfessionalProfileView } from '../../../composables/profiles/Professional/utils/view/useProfessionalProfileView'

const { professionalProfile, profile: professionalCardFromProfile } =
  useProfessional()
const {
  createProfile: createProfileRecord,
  captureIntent,
  scopeEpoch,
} = useProfileCreate(professionalConfig)

const isCreating = ref(false)
const createError = ref<string | null>(null)
watch(
  scopeEpoch,
  () => {
    isCreating.value = false
    createError.value = null
  },
  { flush: 'sync' }
)

const isProfileLoading = computed(() => professionalProfile.value === undefined)
const resolvedProfile = computed(() => professionalProfile.value ?? null)
const professionalCard = computed(() =>
  professionalCardFromProfile(resolvedProfile.value)
)
const { model: professionalProfileView } = useProfessionalProfileView(
  resolvedProfile,
  professionalCard
)

const createProfile = async () => {
  if (isCreating.value) return

  const isCurrent = captureIntent()
  isCreating.value = true
  createError.value = null

  try {
    await createProfileRecord()
  } catch (error) {
    if (isCurrent())
      createError.value =
        (error as Error)?.message || 'Failed to create profile.'
  } finally {
    if (isCurrent()) isCreating.value = false
  }
}
</script>
