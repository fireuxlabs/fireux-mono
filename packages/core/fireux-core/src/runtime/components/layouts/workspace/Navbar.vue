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
          <UserAccessBadge
            v-else
            :subscription="subscription"
          />
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

defineProps<{
  title: string
  ui?: any
}>()

const { subscription, isDeveloper } = useUser()
const subscriptionPending = ref(false)
const toast = useToast()
const subscriptionLabel = computed(() =>
  subscription.value === 'premium' ? 'Premium' : 'Free'
)
const subscriptionIcon = computed(() =>
  subscription.value === 'premium' ? 'i-lucide-crown' : 'i-lucide-user-round'
)
const nextSubscription = computed(() =>
  subscription.value === 'premium' ? 'free' : 'premium'
)
const nextSubscriptionLabel = computed(() =>
  nextSubscription.value === 'premium' ? 'Premium' : 'Free'
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
