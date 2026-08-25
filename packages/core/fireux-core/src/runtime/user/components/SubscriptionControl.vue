<template>
  <ClientOnly>
    <UButton
      v-if="canManageSubscription"
      :label="subscriptionLabel"
      :icon="subscriptionIcon"
      :loading="pending"
      :disabled="pending"
      color="neutral"
      variant="soft"
      size="sm"
      :aria-label="`Switch subscription from ${subscriptionLabel} to ${nextSubscriptionLabel}`"
      @click="toggleSubscription"
    />
    <UserAccessBadge v-else :subscription="subscription" />
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed, ref, useToast, watch } from '#imports'
import type { AppUserSubscription } from '../../app/models/app-user.model.ts'
import { mutateAppMembership } from '../composables/firestore/utils/appMembershipMutation'
import { useUser } from '../composables/useUser'

const { isAdmin, isDeveloper, subscription } = useUser()
const pending = ref(false)
const displayedSubscription = ref<AppUserSubscription>(subscription.value)
const toast = useToast()
const presentation = {
  free: { label: 'Free', icon: 'i-lucide-user-round' },
  premium: { label: 'Premium', icon: 'i-lucide-crown' },
  business: { label: 'Business', icon: 'i-lucide-building-2' },
} as const satisfies Record<
  AppUserSubscription,
  { label: string; icon: string }
>
const order: AppUserSubscription[] = ['free', 'premium', 'business']
const canManageSubscription = computed(() => isAdmin.value || isDeveloper.value)
const subscriptionLabel = computed(
  () => presentation[displayedSubscription.value].label
)
const subscriptionIcon = computed(
  () => presentation[displayedSubscription.value].icon
)
const nextSubscription = computed<AppUserSubscription>(() => {
  const currentIndex = order.indexOf(displayedSubscription.value)
  return order[(currentIndex + 1) % order.length] || 'free'
})
const nextSubscriptionLabel = computed(
  () => presentation[nextSubscription.value].label
)

watch(subscription, (value) => {
  displayedSubscription.value = value
})

async function toggleSubscription() {
  if (!canManageSubscription.value || pending.value) return
  pending.value = true
  try {
    const result = await mutateAppMembership({
      action: 'set-self-subscription',
      subscription: nextSubscription.value,
    })
    if (result.subscription) {
      displayedSubscription.value = result.subscription
    }
    toast.add({
      title: `${presentation[displayedSubscription.value].label} enabled`,
      description: 'Your current App subscription has been updated.',
      color: 'success',
      icon: 'i-lucide-circle-check',
    })
  } catch (error) {
    toast.add({
      title: 'Subscription unchanged',
      description:
        error instanceof Error
          ? error.message
          : 'Your subscription could not be changed.',
      color: 'error',
      icon: 'i-lucide-triangle-alert',
    })
  } finally {
    pending.value = false
  }
}
</script>
