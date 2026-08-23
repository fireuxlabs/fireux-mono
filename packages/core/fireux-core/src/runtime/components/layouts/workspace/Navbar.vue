<template>
  <LayoutsDashboardNavbar :title="title" :ui="ui">
    <template #right>
      <div class="flex items-center gap-2">
        <ClientOnly>
          <UButton
            v-if="isDeveloper"
            :label="subscriptionLabel"
            :icon="subscriptionIcon"
            :loading="subscriptionPending"
            :disabled="subscriptionPending"
            color="neutral"
            variant="soft"
            size="sm"
            :aria-label="`Switch developer subscription from ${subscriptionLabel} to ${nextSubscriptionLabel}`"
            @click="toggleDeveloperSubscription"
          />
          <UserAccessBadge v-else :subscription="subscription" />
        </ClientOnly>
        <slot name="right" />
      </div>
    </template>
  </LayoutsDashboardNavbar>
</template>

<script setup lang="ts">
import { computed, ref, useToast } from '#imports'
import { useUser } from '../../../user/composables/useUser'
import { mutateAppMembership } from '../../../user/composables/firestore/utils/appMembershipMutation'
import type { AppUserSubscription } from '../../../app/models/app-user.model.ts'

defineProps<{
  title: string
  ui?: any
}>()

const { subscription, isDeveloper } = useUser()
const subscriptionPending = ref(false)
const toast = useToast()
const subscriptionPresentation = {
  free: { label: 'Free', icon: 'i-lucide-user-round' },
  premium: { label: 'Premium', icon: 'i-lucide-crown' },
  business: { label: 'Business', icon: 'i-lucide-building-2' },
} as const satisfies Record<
  AppUserSubscription,
  { label: string; icon: string }
>
const subscriptionOrder: AppUserSubscription[] = ['free', 'premium', 'business']
const subscriptionLabel = computed(
  () => subscriptionPresentation[subscription.value].label
)
const subscriptionIcon = computed(
  () => subscriptionPresentation[subscription.value].icon
)
const nextSubscription = computed<AppUserSubscription>(() => {
  const currentIndex = subscriptionOrder.indexOf(subscription.value)
  return (
    subscriptionOrder[(currentIndex + 1) % subscriptionOrder.length] || 'free'
  )
})
const nextSubscriptionLabel = computed(
  () => subscriptionPresentation[nextSubscription.value].label
)

async function toggleDeveloperSubscription() {
  if (!isDeveloper.value || subscriptionPending.value) return
  subscriptionPending.value = true
  try {
    await mutateAppMembership({
      action: 'set-self-subscription',
      subscription: nextSubscription.value,
    })
  } catch (error) {
    toast.add({
      title: 'Subscription unchanged',
      description:
        error instanceof Error
          ? error.message
          : 'The developer subscription could not be changed.',
      color: 'error',
      icon: 'i-lucide-triangle-alert',
    })
  } finally {
    subscriptionPending.value = false
  }
}
</script>
