<template>
  <FireState v-if="isLoading" outcome="pending" entity="your profile" />
  <FireDashboardOverviewRecovery
    v-else-if="hasError || !card"
    :outcome="hasError ? 'error' : 'empty'"
    :error="error"
  />
  <UPageCard v-else-if="card" variant="subtle">
    <UUser
      :name="card.displayName"
      :description="card.handle || undefined"
      :avatar="{ src: card.avatarUrl, alt: card.displayName }"
    />
    <div class="fx-card__actions">
      <UButton
        to="/dashboard/user-profile"
        label="Profile"
        icon="i-lucide-user-round"
      />
      <UButton
        to="/dashboard/settings"
        label="Settings"
        icon="i-lucide-settings"
        color="neutral"
        variant="soft"
      />
    </div>
    <FireState
      v-if="accountOutcome === 'error'"
      outcome="error"
      entity="your private account"
    />
    <UButton
      v-else-if="accountOutcome === 'empty'"
      to="/users/create?redirect=%2Fdashboard"
      label="Finish account setup"
    />
  </UPageCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuth } from '../../../composables/fireux/firebase/useAuth'
import { useUserRead } from '../../../user/composables/useUserRead'
import { useUserAccount } from '../../../user/composables/account/useUserAccount'
import { useUserView } from '../../../user/composables/useUserView'

const { uid } = useAuth()
const { user, outcome, error } = useUserRead(uid)
const { outcome: accountOutcome } = useUserAccount()
const { profile } = useUserView()
const card = computed(() => profile(user.value ?? null))
const isLoading = computed(
  () => outcome.value === 'idle' || outcome.value === 'pending'
)
const hasError = computed(
  () => outcome.value === 'error' || Boolean(error.value)
)
</script>
