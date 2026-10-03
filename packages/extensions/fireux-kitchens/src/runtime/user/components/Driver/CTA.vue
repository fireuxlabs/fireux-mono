<template>
  <section data-entity-cta-family="profile-managed" class="space-y-4">
    <div v-if="hasProfile && profileCard" class="space-y-4">
      <DriverCardsCell v-bind="profileCard" :link="false" />

      <div class="flex flex-wrap gap-2">
        <UButton v-if="profileTo" color="primary" :to="profileTo">
          View profile
        </UButton>
        <UButton color="neutral" variant="soft" to="/dashboard/driver">
          Manage profile
        </UButton>
      </div>
    </div>

    <UPageCTA
      v-else
      class="cta"
      :title="createTitle"
      :description="ctaDescription"
      variant="soft"
      orientation="horizontal"
    >
      <UButton color="primary" :loading="creating" @click="create">
        Create driver profile
      </UButton>
    </UPageCTA>
  </section>
</template>

<script setup lang="ts">
import { useUserSession } from 'fireux-core/runtime/user/composables/useUserSession'

// Concurrent edit — 2026-07-20 13:29 CEST — Root profile identity cutover: pass canonical User separately from Driver storage.
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { computed, ref } from 'vue'
import { useDriver } from '../../composables/driver/useDriver'
import { useDriverInterface } from '../../composables/driver/useDriverInterface'

const { appName } = useFireUXConfig()
const { currentUser } = useUserSession()
const { driverProfile, createDriverProfile } = useDriver()
const { cell } = useDriverInterface()
const creating = ref(false)

const profileCard = computed(() =>
  cell(driverProfile.value, currentUser.value ?? null)
)
const hasProfile = computed(() => Boolean(profileCard.value?.id))
const profileTo = computed(() => String(profileCard.value?.to || '').trim())
const userName = computed(() =>
  String(currentUser.value?.display_name || '').trim()
)
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
