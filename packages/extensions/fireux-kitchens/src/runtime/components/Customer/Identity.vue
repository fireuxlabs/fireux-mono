<template>
  <section class="console-profile__section">
    <div class="console-profile__pills">
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
      v-else-if="!resolvedCoreProfile"
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
      <CustomerCardsCell
        v-if="customerCard"
        v-bind="customerCard"
      />
    </ClientOnly>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'
import { customerConfig } from '../../composables/fireux/firestore/profiles/Customer/config/customerConfig'
import { useCustomer } from '../../composables/fireux/firestore/profiles/Customer/useCustomer'
import { useCustomerInterface } from '../../composables/fireux/firestore/profiles/Customer/utils/view/useCustomerInterface'

const { coreUser } = useUser()
const { coreProfile, createCustomerProfile } = useCustomer()
const { cell: customerCardFromProfile } = useCustomerInterface()

const isCreating = ref(false)
const createError = ref<string | null>(null)

const isProfileLoading = computed(() => coreProfile.value === undefined)
const resolvedCoreProfile = computed(() => coreProfile.value ?? null)
const customerCard = computed(() =>
  resolvedCoreProfile.value
    ? customerCardFromProfile({
        ...resolvedCoreProfile.value,
        user: coreUser.value ?? null,
      })
    : null
)

const createProfile = async () => {
  if (isCreating.value) return

  isCreating.value = true
  createError.value = null

  try {
    await createCustomerProfile()
  } catch (error) {
    createError.value = (error as Error)?.message || 'Failed to create profile.'
  } finally {
    isCreating.value = false
  }
}
</script>
