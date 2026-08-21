<template>
  <section class="workspace-profile__section">
    <div class="workspace-profile__pills">
      <ChefCardsPill
        v-if="chefCard"
        v-bind="chefCard"
        :link="Boolean(chefCard.to)"
        class="block"
      />
    </div>

    <UPageCard v-if="isProfileLoading" variant="subtle">
      <p class="text-sm text-dimmed">Loading profile…</p>
    </UPageCard>

    <UPageCard
      v-else-if="!resolvedCoreProfile"
      title="Chef profile not available"
      description="Your chef profile has not been created yet."
      variant="subtle"
    >
      <UButton
        :label="chefConfig.cta || 'Create Chef profile'"
        color="neutral"
        :loading="isCreating"
        @click="createProfile"
      />

      <p v-if="createError" class="mt-3 text-sm text-dimmed">
        {{ createError }}
      </p>
    </UPageCard>

    <ClientOnly v-else>
      <ChefCardsProfile
        v-if="chefCard"
        :card="chefCard"
        :profile="resolvedCoreProfile"
      />
    </ClientOnly>
  </section>
</template>

<script setup lang="ts">
import { useProfileCreate } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/mutations/useProfileCreate'
import { chefConfig } from '../../composables/firestore/profiles/Chef/config/chefConfig'
import { computed, ref } from 'vue'
import { useChef } from '../../composables/chef/useChef'

const { chefProfile, profile: chefCardFromProfile } = useChef()
const { createProfile: createProfileRecord } = useProfileCreate(chefConfig)

const isCreating = ref(false)
const createError = ref<string | null>(null)

const isProfileLoading = computed(() => chefProfile.value === undefined)
const resolvedProfile = computed(() => chefProfile.value ?? null)
const chefCard = computed(() => chefCardFromProfile(resolvedProfile.value))

const createProfile = async () => {
  if (isCreating.value) return

  isCreating.value = true
  createError.value = null

  try {
    await createProfileRecord()
  } catch (error) {
    createError.value = (error as Error)?.message || 'Failed to create profile.'
  } finally {
    isCreating.value = false
  }
}
</script>
