<template>
  <section data-entity-cta-family="profile-managed" class="space-y-4">
    <div v-if="hasProfile && profileCard" class="space-y-4">
      <DriverCardsCell v-bind="profileCard" />

      <p class="text-sm text-dimmed">
        Your driver profile is available for delivery work.
      </p>
    </div>

    <UPageCTA
      v-else
      class="cta"
      :title="createTitle"
      :description="ctaDescription"
      variant="soft"
      orientation="horizontal"
    >
      <UButton
        color="primary"
        :loading="creating"
        @click="create"
      >
        Create driver profile
      </UButton>
    </UPageCTA>
  </section>
</template>

<script setup lang="ts">
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'
import { computed, ref } from 'vue'
import { useDriver } from '../../composables/fireux/firestore/profiles/Driver/useDriver'
import { useDriverInterface } from '../../composables/fireux/firestore/profiles/Driver/utils/view/useDriverInterface'

const { appName } = useFireUXConfig()
const { currentUser } = useUser()
const { coreProfile, createDriverProfile } = useDriver()
const { cell } = useDriverInterface()
const creating = ref(false)

const profileCard = computed(() =>
  cell(
    coreProfile.value
      ? { ...coreProfile.value, user: currentUser.value ?? null }
      : null
  )
)
const hasProfile = computed(() => Boolean(profileCard.value?.id))
const userName = computed(() => String(currentUser.value?.display_name || '').trim())
const createTitle = computed(() =>
  userName.value
    ? `Hi ${userName.value}, create your driver profile`
    : 'Create your driver profile'
)
const ctaDescription = computed(() =>
  hasProfile.value
    ? `Your driver profile is ready on ${appName}.`
    : 'Accept kitchen delivery work and driver pings.'
)

async function create() {
  if (creating.value) return
  creating.value = true
  try {
    await createDriverProfile()
  } finally {
    creating.value = false
  }
}
</script>
