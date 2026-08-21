<!-- Concurrent edit — 2026-07-19 17:35 CEST — Profile privacy pass: render the current app-private Customer record. -->
<template>
  <section data-entity-cta-family="profile-managed" class="space-y-4">
    <div v-if="hasProfile && profileCard" class="space-y-4">
      <CustomerCardsCell v-bind="profileCard" />

      <p class="text-sm text-dimmed">
        Your customer profile is available for ordering autofill.
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
      <UButton color="primary" :loading="creating" @click="create">
        Create customer profile
      </UButton>
    </UPageCTA>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useUser } from 'fireux-core/runtime/user/composables/useUser'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useCustomer } from '../../composables/customer/useCustomer'
import { useCustomerInterface } from '../../composables/customer/useCustomerInterface'
import { useCustomerCreate } from '../../composables/firestore/profiles/Customer/mutations/useCustomerCreate'

const { appName } = useFireUXConfig()
const { currentUser } = useUser()
const { customerProfile } = useCustomer()
const { createCustomerProfile } = useCustomerCreate()
const { cell } = useCustomerInterface()
const creating = ref(false)

const profileCard = computed(() =>
  cell(
    customerProfile.value
      ? { ...customerProfile.value, user: currentUser.value ?? null }
      : null
  )
)
const hasProfile = computed(() => Boolean(profileCard.value?.id))
const userName = computed(() =>
  String(currentUser.value?.display_name || '').trim()
)
const createTitle = computed(() =>
  userName.value
    ? `Hi ${userName.value}, create your customer profile`
    : 'Create your customer profile'
)
const ctaDescription = computed(() =>
  hasProfile.value
    ? `Your customer profile is ready on ${appName}.`
    : 'Save ordering details so delivery and pre-orders are faster.'
)

async function create() {
  if (creating.value) return
  creating.value = true
  try {
    await createCustomerProfile()
  } finally {
    creating.value = false
  }
}
</script>
