<!-- Concurrent edit — 2026-07-19 17:35 CEST — Profile privacy pass: render the current app-private Customer record. -->
<template>
  <section class="workspace-profile__section">
    <div class="workspace-profile__pills">
      <CustomerCardsPill
        v-if="customerCard"
        v-bind="customerCard"
        class="block"
      />
    </div>

    <UPageCard v-if="isProfileLoading" variant="subtle">
      <p class="text-sm text-dimmed">Loading customer profile…</p>
    </UPageCard>

    <UPageCard
      v-else-if="!resolvedProfile"
      title="Customer profile not available"
      description="Create your customer profile to make ordering faster."
      variant="subtle"
    >
      <UButton
        :label="customerConfig.cta || 'Create customer profile'"
        color="neutral"
        :loading="isCreating"
        @click="createProfile"
      />

      <p v-if="createError" class="mt-3 text-sm text-dimmed">
        {{ createError }}
      </p>
    </UPageCard>

    <ClientOnly v-else>
      <CustomerCardsCell v-if="customerCard" v-bind="customerCard" />
    </ClientOnly>
  </section>
</template>

<script setup lang="ts">
import { useUserSession } from 'fireux-core/runtime/user/composables/session/useUserSession'

import { computed, ref, watch } from 'vue'
import { customerConfig } from '../../../composables/firestore/profiles/Customer/config/customerConfig'
import { useCustomer } from '../../../composables/customer/useCustomer'
import { useCustomerInterface } from '../../../composables/customer/useCustomerInterface'
import { useCustomerCreate } from '../../../composables/firestore/profiles/Customer/mutations/useCustomerCreate'

const { coreUser } = useUserSession()
const { customerProfile, pending } = useCustomer()
const { createCustomerProfile, captureIntent, scopeEpoch } = useCustomerCreate()
const { cell: customerCardFromProfile } = useCustomerInterface()

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

const isProfileLoading = computed(() => pending.value)
const resolvedProfile = computed(() => customerProfile.value ?? null)
const customerCard = computed(() =>
  resolvedProfile.value
    ? customerCardFromProfile({
        ...resolvedProfile.value,
        user: coreUser.value ?? null,
      })
    : null
)

const createProfile = async () => {
  if (isCreating.value) return

  const isCurrent = captureIntent()
  isCreating.value = true
  createError.value = null

  try {
    await createCustomerProfile()
  } catch (error) {
    if (isCurrent())
      createError.value =
        (error as Error)?.message || 'Failed to create profile.'
  } finally {
    if (isCurrent()) isCreating.value = false
  }
}
</script>
